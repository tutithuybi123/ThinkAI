import assert from "node:assert/strict";
import test from "node:test";

import { actorId, contentRevisionId, microSkillId, skillId, subjectId, taskId, taskPairId, topicId } from "../domain/ids.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { createProductionRuntime } from "./server.js";

const base = process.env.THINKAI_TEST_DATABASE_URL;
const integration = base ? test : test.skip;
const database = `thinkai_pg_authored_guidance_${process.pid}`;
const urlFor = (name: string) => { const url = new URL(base!); url.pathname = `/${name}`; return url.toString(); };

integration("PostgreSQL snapshots bind authored Companion guidance without a bootstrap or latest-content fallback", { timeout: 60_000 }, async () => {
  const admin = NodePostgresClient.fromConnectionString(urlFor("postgres"));
  let runtime: Awaited<ReturnType<typeof createProductionRuntime>> | undefined;
  const requests: unknown[] = [];
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${database}`);
    await admin.query(`CREATE DATABASE ${database}`);
    runtime = await createProductionRuntime({
      databaseUrl: urlFor(database), sessionSecret: "0123456789abcdef0123456789abcdef",
      cleanDemoActorId: actorId("actor_demo_clean"), historyDemoActorId: actorId("actor_demo_history"),
      companion: { async respond(input) {
        requests.push(input);
        return { delivery: "Hãy xác định vị trí của điểm trước.", record: { supportLevel: "CONCEPTUAL_HINT", messageId: input.messageId, occurredAt: "2026-08-23T00:00:00.000Z", answerRevealAttempted: false, answerRevealed: false, responseBlocked: false }, provider: "test-provider", model: "test-model" };
      } },
    });
    const subject = subjectId("subject_guidance"), topic = topicId("topic_guidance"), evidence = skillId("skill_guidance"), revisionA = contentRevisionId("revision_guidance_a");
    const bodyFor = (revisionId: typeof revisionA, guidanceVersion: string, misconception: string) => {
      const key = guidanceVersion.replace(/-/g, "_");
      return ({
      microSkills: [{
        subject: { id: subject, label: "Toán", displayOrder: 1 },
        topic: { id: topic, subjectId: subject, label: "Đại số", displayOrder: 1 },
        microSkill: { id: microSkillId("micro_guidance"), evidenceSkillId: evidence, topicId: topic, revisionId, title: "Guidance snapshot", displayOrder: 1, prerequisiteMicroSkillIds: [] },
        practiceGate: { policyVersion: "practice-gate/v1" as const, strategy: "distinct-correct-count" as const, requiredCorrectCount: 1, maxPracticeItems: 1 },
        pairs: [{
          id: taskPairId(`pair_${key}`), version: "1", microSkillRevisionId: revisionId,
          practiceTask: { id: taskId(`task_practice_${key}`), version: "1", role: "practice" as const },
          transferTask: { id: taskId(`task_transfer_${key}`), version: "1", role: "transfer" as const },
          practiceContent: {
            id: taskId(`task_practice_${key}`), version: "1", skillId: evidence, role: "practice" as const,
            prompt: { format: "plain_text" as const, body: `Prompt ${guidanceVersion}` },
            answerSpec: { kind: "written_solution" as const, normalizationVersion: "written-v1", assessment: {
              expectedResult: "ok", gradingShape: { finalAnswerFacet: "required" as const, reasoningFacet: "required" as const, requiredCriterionIds: [], optionalCriterionIds: [] },
              criteria: [], referenceSolutions: [{ format: "plain_text" as const, body: "reviewed" }], commonMisconceptions: [misconception],
              aiGuidance: { version: guidanceVersion, allowedSupportLevels: ["PROMPT", "CONCEPTUAL_HINT"] as const },
            } },
          },
          transferContent: { id: taskId(`task_transfer_${key}`), version: "1", skillId: evidence, role: "transfer" as const, prompt: { format: "plain_text" as const, body: "Transfer" }, answerSpec: { kind: "exact_text" as const, accepted: ["ok"], normalizationVersion: "v1" } },
          connectionReveal: { id: `reveal_${key}`, version: "1", pairId: taskPairId(`pair_${key}`), pairVersion: "1", title: "Reveal", sharedRelation: "Relation", explanation: { format: "plain_text" as const, body: "Reviewed reveal" } },
        }],
      }],
      });
    };
    await runtime.ops.createDraft({ id: revisionA, body: bodyFor(revisionA, "guidance-a", "misconception-a") });
    await runtime.ops.submitReview(revisionA); await runtime.ops.approve(revisionA); await runtime.ops.publish(revisionA);
    const bootstrap = await runtime.sessionBootstrap.issueLearner("clean");
    const learner = bootstrap.actorId, actorSessionId = (await runtime.auth.verify(bootstrap.token)).sessionId;
    const startedA = await runtime.startPublishedPractice(learner, revisionA, "start-a") as { sessionId: string };
    await runtime.practiceCompanion(learner, startedA.sessionId as never, { message: "Em bắt đầu thế nào?", idempotencyKey: "assist-a", actorSessionId });
    assert.match(JSON.stringify(requests[0]), /guidance-a/);
    assert.match(JSON.stringify(requests[0]), /misconception-a/);
    assert.equal(JSON.stringify(requests[0]).includes("referenceSolutions"), false);

    const revisionB = contentRevisionId("revision_guidance_b");
    await runtime.ops.createDraft({ id: revisionB, body: bodyFor(revisionB as typeof revisionA, "guidance-b", "misconception-b") });
    await runtime.ops.submitReview(revisionB); await runtime.ops.approve(revisionB); await runtime.ops.publish(revisionB);
    await runtime.practiceCompanion(learner, startedA.sessionId as never, { message: "Nhắc lại chiến lược", idempotencyKey: "assist-a-2", actorSessionId });
    assert.match(JSON.stringify(requests[1]), /guidance-a/);
    assert.match(JSON.stringify(requests[1]), /misconception-a/);

    const startedB = await runtime.startPublishedPractice(learner, revisionB, "start-b") as { sessionId: string };
    await runtime.practiceCompanion(learner, startedB.sessionId as never, { message: "Em bắt đầu thế nào?", idempotencyKey: "assist-b", actorSessionId });
    assert.match(JSON.stringify(requests[2]), /guidance-b/);
    assert.match(JSON.stringify(requests[2]), /misconception-b/);
    const verify = NodePostgresClient.fromConnectionString(urlFor(database));
    try {
      const assistance = await verify.query<{ payload: { guidanceVersion?: string; provider?: string; model?: string } }>("SELECT payload FROM evidence_events WHERE type = 'practice_assistance_recorded' ORDER BY sequence ASC");
      assert.deepEqual(assistance.rows.map((row) => row.payload.guidanceVersion), ["guidance-a", "guidance-a", "guidance-b"]);
      assert.deepEqual(assistance.rows.map((row) => [row.payload.provider, row.payload.model]), [["test-provider", "test-model"], ["test-provider", "test-model"], ["test-provider", "test-model"]]);
    } finally { await verify.close(); }
    await runtime.ops.deprecate(revisionB);
    assert.equal((await runtime.practice.companionContext(startedA.sessionId as never, learner)).guidanceVersion, "guidance-a");
  } finally {
    await runtime?.close();
    await admin.query(`DROP DATABASE IF EXISTS ${database}`);
    await admin.close();
  }
});
