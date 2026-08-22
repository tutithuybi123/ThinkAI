import assert from "node:assert/strict";
import test from "node:test";
import { actorId, contentRevisionId, microSkillId, skillId, subjectId, taskId, taskPairId, topicId } from "../domain/ids.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { createProductionRuntime } from "./server.js";

const base = process.env.THINKAI_TEST_DATABASE_URL;
const integration = base ? test : test.skip;
const database = `thinkai_pg_authority_${process.pid}`;
const urlFor = (name: string) => { const url = new URL(base!); url.pathname = `/${name}`; return url.toString(); };

integration("production runtime executes only the exact PostgreSQL published revision when bootstrap is empty", { timeout: 60_000 }, async () => {
  const admin = NodePostgresClient.fromConnectionString(urlFor("postgres"));
  let runtime: Awaited<ReturnType<typeof createProductionRuntime>> | undefined;
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${database}`); await admin.query(`CREATE DATABASE ${database}`);
    runtime = await createProductionRuntime({ databaseUrl: urlFor(database), sessionSecret: "0123456789abcdef0123456789abcdef", cleanDemoActorId: actorId("actor_demo_clean"), historyDemoActorId: actorId("actor_demo_history") });
    const revisionId = contentRevisionId("revision_postgres_only_1"), evidence = skillId("skill_postgres_only");
    const pair = (suffix: string) => ({ id: taskPairId(`pair_postgres_only_${suffix}`), version: "1", microSkillRevisionId: revisionId, practiceTask: { id: taskId(`task_postgres_practice_${suffix}`), version: "1", role: "practice" as const }, transferTask: { id: taskId(`task_postgres_transfer_${suffix}`), version: "1", role: "transfer" as const }, practiceContent: { id: taskId(`task_postgres_practice_${suffix}`), version: "1", skillId: evidence, role: "practice" as const, prompt: { format: "plain_text" as const, body: `Practice ${suffix}` }, answerSpec: { kind: "exact_text" as const, accepted: ["ok"], normalizationVersion: "v1" } }, transferContent: { id: taskId(`task_postgres_transfer_${suffix}`), version: "1", skillId: evidence, role: "transfer" as const, prompt: { format: "plain_text" as const, body: `Transfer ${suffix}` }, answerSpec: { kind: "exact_text" as const, accepted: ["ok"], normalizationVersion: "v1" } }, connectionReveal: { id: `reveal_postgres_${suffix}`, version: "1", pairId: taskPairId(`pair_postgres_only_${suffix}`), pairVersion: "1", title: "Liên hệ", sharedRelation: "Cùng quan hệ", explanation: { format: "plain_text" as const, body: "Kết nối đã duyệt." } } });
    const subject = subjectId("subject_math"), topic = topicId("topic_algebra"); const body = { microSkills: [{ subject: { id: subject, label: "Toán", displayOrder: 1 }, topic: { id: topic, subjectId: subject, label: "Đại số", displayOrder: 1 }, microSkill: { id: microSkillId("micro_postgres_only"), evidenceSkillId: evidence, topicId: topic, revisionId, title: "Nội dung PostgreSQL", displayOrder: 1, prerequisiteMicroSkillIds: [] }, practiceGate: { policyVersion: "practice-gate/v1" as const, strategy: "distinct-correct-count" as const, requiredCorrectCount: 1, maxPracticeItems: 2 }, pairs: [pair("a"), pair("b")] }] };
    await runtime.ops.createDraft({ id: revisionId, body }); await runtime.ops.submitReview(revisionId); await runtime.ops.approve(revisionId); await runtime.ops.publish(revisionId);
    const actor = actorId("actor_postgres_only"); const started = await runtime.startPublishedPractice(actor, revisionId, "start"); const practiceId = (started as { sessionId: string }).sessionId as never;
    const view = await runtime.practice.learnerView(practiceId, actor); assert.match(view.task.prompt.body, /^Practice/);
    await runtime.practice.recordAttempt({ sessionId: practiceId, actorId: actor, idempotencyKey: "attempt" }); await runtime.practice.submit({ sessionId: practiceId, actorId: actor, answer: "ok", idempotencyKey: "submit" });
    assert.equal((await runtime.practiceLearnerView(actor, practiceId) as { nextAction: string }).nextAction, "READY_FOR_TRANSFER");
    const transfer = await runtime.startPublishedTransfer(actor, practiceId, "transfer", undefined as never) as { sessionId: string }; await runtime.transfer.submit({ sessionId: transfer.sessionId as never, actorId: actor, answer: "ok", idempotencyKey: "transfer-submit" });
    const reveal = await runtime.transfer.revealConnection({ sessionId: transfer.sessionId as never, actorId: actor, idempotencyKey: "reveal" }); assert.equal(reveal.reveal.title, "Liên hệ");
  } finally { await runtime?.close(); await admin.query(`DROP DATABASE IF EXISTS ${database}`); await admin.close(); }
});
