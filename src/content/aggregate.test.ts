import assert from "node:assert/strict";
import test from "node:test";
import { actorId, contentRevisionId, microSkillId, subjectId, taskId, taskPairId, topicId } from "../domain/ids.js";
import { selectFreshTransferPair, selectInitialPair } from "./selection.js";
import { validateContentAggregate } from "./v11-validator.js";
import { createAggregatePairSnapshot } from "./snapshot.js";
import { validateContentBundle } from "./validator.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { assertPublishableContent, publishReviewedAggregate, validatePublishableContent } from "./publication.js";
import { approveRevision, createDraftRevision, submitForReview } from "./lifecycle.js";

const assessment = { expectedResult: "2", gradingShape: { finalAnswerFacet: "required" as const, reasoningFacet: "required" as const, requiredCriterionIds: ["method"], optionalCriterionIds: [] }, criteria: [{ id: "method", description: "method" }], referenceSolutions: [{ format: "plain_text" as const, body: "alternate" }], commonMisconceptions: ["swap"], aiGuidance: { version: "g1", allowedSupportLevels: ["PROMPT"] as const } };
const pair = (id: string, transfer = `task_${id}_transfer`) => { const practiceId = taskId(`task_${id}_practice`); const transferId = taskId(transfer); return { id: taskPairId(`pair_${id}`), version: "1", microSkillRevisionId: contentRevisionId("revision_gradient_1"), practiceTask: { id: practiceId, version: "1", role: "practice" as const }, transferTask: { id: transferId, version: "1", role: "transfer" as const }, practiceContent: { id: practiceId, version: "1", role: "practice" as const, prompt: { format: "plain_text" as const, body: "practice" }, answerSpec: { kind: "written_solution" as const, assessment } }, transferContent: { id: transferId, version: "1", role: "transfer" as const, prompt: { format: "plain_text" as const, body: "transfer" }, answerSpec: { kind: "exact_text" as const, accepted: ["2"], normalizationVersion: "v1" } }, connectionReveal: { id: "reveal_a", version: "1", pairId: taskPairId(`pair_${id}`), pairVersion: "1", title: "relation", sharedRelation: "same", explanation: { format: "plain_text" as const, body: "same idea" } } }; };
const base = () => ({ subject: { id: subjectId("subject_math"), displayOrder: 1 }, topic: { id: topicId("topic_linear"), subjectId: subjectId("subject_math"), displayOrder: 1 }, microSkill: { id: microSkillId("micro_gradient"), topicId: topicId("topic_linear"), revisionId: contentRevisionId("revision_gradient_1"), displayOrder: 1, prerequisiteMicroSkillIds: [] }, pairs: [pair("a"), pair("b")] });

test("validates multi-node authored progression and rejects cycles", () => {
  const a = base(); const b = { ...base(), microSkill: { ...base().microSkill, id: microSkillId("micro_intercept"), revisionId: contentRevisionId("revision_intercept_1"), prerequisiteMicroSkillIds: [a.microSkill.id] }, pairs: [] };
  assert.deepEqual(validateContentAggregate({ microSkills: [a, b] }), []);
  assert.match(validateContentAggregate({ microSkills: [a, { ...b, microSkill: { ...b.microSkill, prerequisiteMicroSkillIds: [a.microSkill.id, a.microSkill.id] } }] })[0]!.code, /DUPLICATE/);
  const cyclic = { ...a, microSkill: { ...a.microSkill, prerequisiteMicroSkillIds: [b.microSkill.id] } };
  assert.match(validateContentAggregate({ microSkills: [cyclic, b] })[0]!.code, /CYCLE/);
});

test("ContentBundle validates the authored graph as a containing aggregate", () => {
  const a = base(); const b = { ...base(), microSkill: { ...base().microSkill, id: microSkillId("micro_intercept"), revisionId: contentRevisionId("revision_intercept_1"), prerequisiteMicroSkillIds: [a.microSkill.id] }, pairs: [] };
  assert.equal(validateContentBundle({ ...packageAStructuralFixture, contentAggregate: { microSkills: [a, b] } }).valid, true);
  assert.equal(validateContentBundle({ ...packageAStructuralFixture, contentAggregate: { microSkills: [{ ...a, microSkill: { ...a.microSkill, prerequisiteMicroSkillIds: [microSkillId("micro_unknown")] } }] } }).valid, false);
});

test("aggregate snapshot deep-freezes the selected pair and authored identity", () => {
  const aggregate = base(); const selected = aggregate.pairs[0]!;
  const snapshot = createAggregatePairSnapshot(aggregate, selected);
  aggregate.pairs.reverse();
  assert.equal(snapshot.microSkillRevisionId, aggregate.microSkill.revisionId);
  assert.equal(snapshot.pair.id, selected.id);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.pair), true);
  assert.equal(snapshot.authoredAggregate.pairs[0]!.id, selected.id);
  (aggregate.microSkill as { title?: string }).title = "later draft edit";
  assert.equal((snapshot.authoredAggregate.microSkill as { title?: string }).title, undefined);
  assert.equal((snapshot.pair.practiceContent.answerSpec as { assessment: { aiGuidance: { version: string } } }).assessment.aiGuidance.version, "g1");
  assert.equal(Object.isFrozen(snapshot.pair.practiceContent), true);
  assert.throws(() => ((snapshot.pair.practiceContent.answerSpec as unknown as { assessment: { referenceSolutions: unknown[] } }).assessment.referenceSolutions.push("blocked")));
  const forged = { ...selected, practiceTask: { ...selected.practiceTask, id: taskId("task_forged") } };
  const canonical = createAggregatePairSnapshot(aggregate, forged);
  assert.notEqual(canonical.pair.practiceTask.id, taskId("task_forged"));
});

test("server-owned pair policies are deterministic and never reuse exposed transfer material", () => {
  const aggregate = base(); const actor = actorId("actor_learner");
  assert.equal(selectInitialPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, eligiblePairs: aggregate.pairs }).id, selectInitialPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, eligiblePairs: aggregate.pairs }).id);
  const fresh = selectFreshTransferPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, independentAttemptOrdinal: 1, eligiblePairs: aggregate.pairs, exposedPairs: [{ pairId: aggregate.pairs[0]!.id, pairVersion: "1" }], exposedTransferTasks: [] });
  assert.equal(fresh.kind, "PAIR_SELECTED"); if (fresh.kind === "PAIR_SELECTED") assert.notEqual(fresh.pair.id, aggregate.pairs[0]!.id);
  assert.deepEqual(selectFreshTransferPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, independentAttemptOrdinal: 1, eligiblePairs: aggregate.pairs, exposedPairs: [], exposedTransferTasks: aggregate.pairs.map((x) => ({ taskId: x.transferTask.id, version: x.transferTask.version })) }), { kind: "NO_FRESH_TRANSFER_AVAILABLE" });
});

test("draft aggregates may be incomplete but publication requires a complete pair bank", () => {
  assert.ok(validateContentAggregate({ microSkills: [{ ...base(), pairs: [] } ] }).length === 0);
  assert.deepEqual(validatePublishableContent({ microSkills: [{ ...base(), pairs: [] }] }), ["EMPTY_PUBLISHED_PAIR_BANK"]);
  assert.deepEqual(validatePublishableContent({ microSkills: [base()] }), []);
  assert.throws(() => assertPublishableContent({ microSkills: [{ ...base(), pairs: [] }] }), /EMPTY_PUBLISHED_PAIR_BANK/);
  const draft = createDraftRevision({ id: contentRevisionId("revision_publish_1"), body: { microSkills: [{ ...base(), pairs: [] }] } });
  assert.throws(() => publishReviewedAggregate(approveRevision(submitForReview(draft))), /EMPTY_PUBLISHED_PAIR_BANK/);
});

test("malformed aggregate data fails closed instead of throwing", () => {
  assert.doesNotThrow(() => assert.notEqual(validateContentAggregate({ microSkills: [{ microSkill: { prerequisiteMicroSkillIds: "bad" }, pairs: [] }] } as unknown).length, 0));
});
