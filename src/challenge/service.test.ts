import assert from "node:assert/strict";
import test from "node:test";

import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, challengeSessionId, interventionId, taskPairId } from "../domain/ids.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { MemoryPersistenceDatabase, TransactionalEvidencePersistence } from "../persistence/index.js";
import { scoringService } from "../scoring/service.js";
import { PracticeChallengeError, PracticeChallengeService } from "./service.js";

const learner = actorId("actor_challenge_test");
const pair = taskPairId("pair_fixture");
const session = challengeSessionId("challenge_practice_test");

function createService(database = new MemoryPersistenceDatabase(), repository?: ReviewedContentRepository) {
  const persistence = new TransactionalEvidencePersistence(database);
  const content = repository ?? ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  const service = new PracticeChallengeService(content, persistence, scoringService, { now: () => new Date("2026-08-14T10:00:00.000Z") });
  return { service, persistence, database, content };
}

test("practice lifecycle records attempt, reviewed help, incorrect recovery, and authoritative solve", async () => {
  const { service, persistence } = createService();
  assert.equal((await service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" })).challenge.stage, "ready");
  assert.equal((await service.recordAttempt({ sessionId: session, actorId: learner, idempotencyKey: "attempt-1" })).challenge.stage, "attempting");
  const opened = await service.openReviewedHint({ sessionId: session, actorId: learner, interventionId: interventionId("hint_fixture_2"), idempotencyKey: "hint-1" });
  assert.deepEqual(opened.challenge.openedInterventionIds, [interventionId("hint_fixture_2")]);
  const incorrect = await service.submit({ sessionId: session, actorId: learner, answer: "wrong", idempotencyKey: "answer-1" });
  assert.equal(incorrect.score?.outcome, "incorrect");
  assert.equal(incorrect.challenge.stage, "assisted");
  const solved = await service.submit({ sessionId: session, actorId: learner, answer: "fixture", idempotencyKey: "answer-2" });
  assert.equal(solved.score?.outcome, "correct");
  assert.equal(solved.challenge.stage, "solved");

  const events = await persistence.list(learner);
  assert.deepEqual(events.map((item) => item.event.type), ["challenge_started", "attempt_submitted", "intervention_opened", "answer_submitted", "practice_scored", "answer_submitted", "practice_scored"]);
  const exposure = events[2]?.event;
  assert.equal(exposure?.payload.interventionVersion, "1");
  assert.equal(typeof exposure?.payload.exactContentHash, "string");
  assert.equal("body" in (exposure?.payload ?? {}), false);
  const scoreEvent = events.at(-1)?.event;
  assert.equal(scoreEvent?.scorerVersion, "score-v1");
  assert.equal(scoreEvent?.payload.outcome, "correct");
});

test("cannot-start creates explicit append-only evidence and permits reviewed help", async () => {
  const { service, persistence } = createService();
  await service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  const result = await service.declareCannotStart({ sessionId: session, actorId: learner, idempotencyKey: "cannot-start" });
  assert.equal(result.challenge.stage, "attempting");
  await service.openReviewedHint({ sessionId: session, actorId: learner, interventionId: interventionId("hint_fixture_1"), idempotencyKey: "hint" });
  assert.deepEqual((await persistence.list()).map((item) => item.event.type), ["challenge_started", "attempt_submitted", "unable_to_start_declared", "intervention_opened"]);
});

test("invalid transitions, wrong learner, and unavailable interventions are rejected by the domain", async () => {
  const { service } = createService();
  await service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  await assert.rejects(() => service.submit({ sessionId: session, actorId: learner, answer: "fixture", idempotencyKey: "too-early" }), (error: unknown) => error instanceof PracticeChallengeError && error.code === "INVALID_TRANSITION");
  await assert.rejects(() => service.openReviewedHint({ sessionId: session, actorId: learner, interventionId: interventionId("hint_fixture_1"), idempotencyKey: "too-early" }), (error: unknown) => error instanceof PracticeChallengeError && error.code === "INVALID_TRANSITION");
  await service.recordAttempt({ sessionId: session, actorId: learner, idempotencyKey: "attempt" });
  await assert.rejects(() => service.openReviewedHint({ sessionId: session, actorId: learner, interventionId: interventionId("hint_missing"), idempotencyKey: "missing" }), (error: unknown) => error instanceof PracticeChallengeError && error.code === "INTERVENTION_NOT_AVAILABLE");
  await assert.rejects(() => service.resume(session, actorId("actor_other")), (error: unknown) => error instanceof PracticeChallengeError && error.code === "ACTOR_MISMATCH");
});

test("idempotency and persisted session state survive a service reload", async () => {
  const database = new MemoryPersistenceDatabase();
  const first = createService(database);
  await first.service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  await first.service.recordAttempt({ sessionId: session, actorId: learner, idempotencyKey: "attempt" });
  const reloaded = createService(database);
  const replay = await reloaded.service.recordAttempt({ sessionId: session, actorId: learner, idempotencyKey: "attempt" });
  assert.equal(replay.replayed, true);
  assert.equal(replay.challenge.attemptCount, 1);
  assert.equal((await reloaded.persistence.list()).length, 2);
  assert.equal((await reloaded.service.resume(session, learner)).stage, "attempting");
  await assert.rejects(() => reloaded.service.declareCannotStart({ sessionId: session, actorId: learner, idempotencyKey: "attempt" }), (error: unknown) => error instanceof PracticeChallengeError && error.code === "IDEMPOTENCY_CONFLICT");
});

test("an exact persisted runtime snapshot survives later bootstrap content changes", async () => {
  const database = new MemoryPersistenceDatabase();
  const initial = createService(database);
  await initial.service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  const drifted = {
    ...packageAStructuralFixture,
    tasks: packageAStructuralFixture.tasks.map((task, index) => index === 0 ? { ...task, version: "2" } : task),
  };
  const changedRepository = ReviewedContentRepository.fromRaw(drifted, { allowStructuralTestFixture: true });
  const reloaded = createService(database, changedRepository);
  assert.equal((await reloaded.service.resume(session, learner)).pairVersion, "1");
});

test("Companion context remains bound to the authored guidance in the session snapshot", async () => {
  const database = new MemoryPersistenceDatabase();
  const guidanceA = {
    expectedResult: "fixture", gradingShape: { finalAnswerFacet: "required" as const, reasoningFacet: "required" as const, requiredCriterionIds: [], optionalCriterionIds: [] }, criteria: [],
    referenceSolutions: [{ format: "plain_text" as const, body: "reviewed" }], commonMisconceptions: ["A misconception"], aiGuidance: { version: "guidance-a", allowedSupportLevels: ["PROMPT", "CONCEPTUAL_HINT"] as const },
  };
  const revisionA = { ...packageAStructuralFixture, tasks: packageAStructuralFixture.tasks.map((task, index) => index === 0 ? { ...task, answerSpec: { kind: "written_solution" as const, normalizationVersion: "written-v1", assessment: guidanceA } } : task) };
  const first = createService(database, ReviewedContentRepository.fromRaw(revisionA, { allowStructuralTestFixture: true }));
  await first.service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  const before = await first.service.companionContext(session, learner);
  assert.equal(before.guidanceVersion, "guidance-a");
  assert.deepEqual(before.taskContext.commonMisconceptions, ["A misconception"]);

  const guidanceB = { ...guidanceA, commonMisconceptions: ["B misconception"], aiGuidance: { version: "guidance-b", allowedSupportLevels: ["PROMPT"] as const } };
  const revisionB = { ...packageAStructuralFixture, tasks: packageAStructuralFixture.tasks.map((task, index) => index === 0 ? { ...task, answerSpec: { kind: "written_solution" as const, normalizationVersion: "written-v1", assessment: guidanceB } } : task) };
  const restarted = createService(database, ReviewedContentRepository.fromRaw(revisionB, { allowStructuralTestFixture: true }));
  const after = await restarted.service.companionContext(session, learner);
  assert.equal(after.guidanceVersion, "guidance-a");
  assert.deepEqual(after.taskContext.commonMisconceptions, ["A misconception"]);
});

test("learner Practice view exposes the bound prompt and capability but not grading internals", async () => {
  const { service } = createService();
  await service.start({ sessionId: session, actorId: learner, pairId: pair, idempotencyKey: "start" });
  const view = await service.learnerView(session, learner);
  assert.equal(view.task.prompt.body, "Structural practice prompt");
  assert.equal(view.task.input, "text");
  assert.equal(view.state.stage, "ready");
  assert.equal(JSON.stringify(view).includes("accepted"), false);
  assert.equal(JSON.stringify(view).includes("pairId"), false);
  assert.equal(JSON.stringify(view).includes("taskVersion"), false);
});
