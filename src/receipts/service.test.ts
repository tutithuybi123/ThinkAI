import assert from "node:assert/strict";
import test from "node:test";
import { PracticeChallengeService } from "../challenge/service.js";
import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, challengeSessionId, evidenceEventId, skillId, taskFamilyId, taskId, taskPairId, transferSessionId } from "../domain/ids.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import type { EvidenceEvent } from "../evidence/schema.js";
import { MemoryPersistenceDatabase, TransactionalEvidencePersistence } from "../persistence/index.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "../persistence/index.js";
import { runMigrations } from "../persistence/migrations.js";
import { scoringService } from "../scoring/service.js";
import { TransferService } from "../transfer/service.js";
import { CapabilityReceiptService, ReceiptError, rebuildHistory, rebuildLearnerProgress } from "./service.js";

async function qualified() {
  const actor = actorId("actor_receipt");
  const database = new MemoryPersistenceDatabase();
  const store = new TransactionalEvidencePersistence(database);
  const content = ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  const practice = new PracticeChallengeService(content, store, scoringService);
  const transfer = new TransferService(content, store, scoringService);
  const challenge = challengeSessionId("challenge_receipt"); const transferId = transferSessionId("transfer_receipt");
  await practice.start({ sessionId: challenge, actorId: actor, idempotencyKey: "start" });
  await practice.recordAttempt({ sessionId: challenge, actorId: actor, idempotencyKey: "attempt" });
  await practice.submit({ sessionId: challenge, actorId: actor, answer: "fixture", idempotencyKey: "practice" });
  await transfer.start({ sessionId: transferId, practiceSessionId: challenge, actorId: actor, idempotencyKey: "transfer-start" });
  await transfer.submit({ sessionId: transferId, actorId: actor, answer: "fixture", idempotencyKey: "transfer-score" });
  return { actor, store, database, challenge, transferId };
}

test("qualifying receipt is bound to the exact practice/transfer parent chain and is idempotent", async () => {
  const { actor, store, challenge, transferId } = await qualified();
  const service = new CapabilityReceiptService(store, () => new Date("2026-08-14T01:00:00Z"));
  const first = await service.issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "receipt" });
  const again = await service.issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "another-retry" });
  assert.equal(first.receipt.sourceEventIds.length, 2);
  assert.equal(again.replayed, true);
  assert.equal((await store.list()).filter((item) => item.event.type === "capability_receipt_issued").length, 1);
});
test("learner receipt DTO excludes provenance, source events and internal policy",async()=>{const {actor,store,challenge,transferId}=await qualified();const service=new CapabilityReceiptService(store);const issued=await service.issue({actorId:actor,practiceSessionId:challenge,transferSessionId:transferId,idempotencyKey:"learner-view"});const view=await service.learnerView({id:issued.receipt.id,actorId:actor});const serialized=JSON.stringify(view);for(const hidden of ["sourceEventIds","policyVersion","provenance","actorId","skillId"])assert.equal(serialized.includes(hidden),false);assert.equal(view.claim.length>0,true);});

test("same-skill forged score facts with a wrong task, version, or family cannot issue a receipt", async () => {
  const { actor, store, database, challenge, transferId } = await qualified();
  const tampered = structuredClone(database.state.events);
  const transferScoreIndex = tampered.findIndex((stored) => stored.event.type === "transfer_scored");
  const transferScore = tampered[transferScoreIndex];
  assert.ok(transferScore);
  tampered[transferScoreIndex] = {
    ...transferScore,
    event: {
      ...transferScore.event,
      taskId: "task_wrong" as EvidenceEvent["taskId"],
      taskVersion: "wrong-v1",
      taskFamilyId: "family_wrong" as EvidenceEvent["taskFamilyId"],
    } as EvidenceEvent,
  };
  database.state.events = tampered;
  const service = new CapabilityReceiptService(store);
  await assert.rejects(
    () => service.issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "wrong-task-chain" }),
    (error: unknown) => error instanceof ReceiptError && error.code === "NOT_ELIGIBLE",
  );
});

test("a transfer state pointing at a different reviewed pair cannot mix into the practice receipt chain", async () => {
  const { actor, store, database, challenge, transferId } = await qualified();
  const transfer = database.state.sessions.get(transferId);
  assert.ok(transfer);
  database.state.sessions.set(transferId, { ...transfer, state: { ...transfer.state, pairId: "pair_other_same_task", pairVersion: "pair-v2" } });
  await assert.rejects(
    () => new CapabilityReceiptService(store).issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "wrong-pair-chain" }),
    (error: unknown) => error instanceof ReceiptError && error.code === "NOT_ELIGIBLE",
  );
});

test("a fresh Transfer pair in the same authored micro-skill can issue a receipt", async () => {
  const { actor, store, database, challenge, transferId } = await qualified();
  const transfer = database.state.sessions.get(transferId); assert.ok(transfer);
  const transferSnapshot = { ...(await store.findContent(transfer.contentIntegrityKey))!, pair: { id: taskPairId("pair_fresh_transfer"), version: "pair-v2" }, transferTask: { id: taskId("task_fresh_transfer"), version: "task-v2" }, integrityKey: "snapshot_fresh_transfer" };
  const transferEvent = database.state.events.find((item) => item.event.type === "transfer_scored"); assert.ok(transferEvent);
  database.state.events = database.state.events.map((item) => item === transferEvent ? { ...item, event: { ...item.event, taskId: transferSnapshot.transferTask.id, taskVersion: transferSnapshot.transferTask.version } } : item);
  database.state.content.set(transferSnapshot.integrityKey, transferSnapshot);
  database.state.sessions.set(transferId, { ...transfer, contentIntegrityKey: transferSnapshot.integrityKey, state: { ...transfer.state, pairId: transferSnapshot.pair.id, pairVersion: transferSnapshot.pair.version, taskId: transferSnapshot.transferTask.id, taskVersion: transferSnapshot.transferTask.version, snapshotKey: transferSnapshot.integrityKey } });
  const issued = await new CapabilityReceiptService(store).issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "fresh-transfer" });
  assert.equal(issued.receipt.sourceEventIds.length, 2);
});

test("cross-parent receipt evidence is rejected and later evidence remains append-only", async () => {
  const { actor, store, challenge, transferId } = await qualified();
  const service = new CapabilityReceiptService(store);
  await assert.rejects(() => service.issue({ actorId: actor, practiceSessionId: challengeSessionId("challenge_other"), transferSessionId: transferId, idempotencyKey: "cross-parent" }), (error: unknown) => error instanceof ReceiptError && error.code === "NOT_ELIGIBLE");
  await service.issue({ actorId: actor, practiceSessionId: challenge, transferSessionId: transferId, idempotencyKey: "valid" });
  const events = await store.list(actor);
  assert.equal(rebuildLearnerProgress(events)[0]?.demonstratedInChangedSituation, true);
  assert.equal(rebuildHistory(events).some((item) => item.type === "capability_receipt_issued"), true);
});

const databaseUrl = process.env.THINKAI_TEST_DATABASE_URL;
const integration = databaseUrl ? test : test.skip;

integration("PostgreSQL concurrent distinct-key receipt issuance returns one durable receipt and one replay", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_receipt_race CASCADE; CREATE SCHEMA thinkai_pg_receipt_race");
  await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_receipt_race");
  try {
    await runMigrations(client);
    const store = new PostgresTransactionalEvidencePersistence(client);
    const actor = actorId("actor_receipt_race"), practice = challengeSessionId("challenge_receipt_race"), transfer = transferSessionId("transfer_receipt_race");
    const family = taskFamilyId("family_receipt_race"), skill = skillId("skill_receipt_race");
    const pair = taskPairId("pair_receipt_race"), practiceTask = taskId("task_receipt_practice"), transferTask = taskId("task_receipt_transfer");
    const snapshot = { pair: { id: pair, version: "pair-v1" }, practiceTask: { id: practiceTask, version: "task-v1" }, transferTask: { id: transferTask, version: "task-v1" }, interventions: [], integrityKey: "snapshot_receipt_race" };
    const practiceEvent = { id: evidenceEventId("event_receipt_practice"), type: "practice_scored" as const, actorId: actor, correlationId: practice, challengeSessionId: practice, skillId: skill, taskId: practiceTask, taskVersion: "task-v1", taskFamilyId: family, occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, policyVersion: "practice-lifecycle-v1", scorerVersion: "scoring-policy-v1", provenance: "live" as const, payload: { outcome: "correct", answerSpecVersion: "answer-v1" } };
    const transferEvent = { id: evidenceEventId("event_receipt_transfer"), type: "transfer_scored" as const, actorId: actor, correlationId: transfer, transferSessionId: transfer, skillId: skill, taskId: transferTask, taskVersion: "task-v1", taskFamilyId: family, occurredAt: "2026-08-14T00:00:01.000Z", schemaVersion: 1, policyVersion: "transfer-lifecycle-v1", scorerVersion: "scoring-policy-v1", provenance: "live" as const, payload: { outcome: "correct", answerSpecVersion: "answer-v1" } };
    await store.appendCommand({ events: [practiceEvent], contentSnapshot: snapshot, session: { sessionId: practice, kind: "challenge", contentIntegrityKey: snapshot.integrityKey, state: { actorId: actor, pairId: pair, pairVersion: "pair-v1", skillId: skill, practiceTaskId: practiceTask, practiceTaskVersion: "task-v1", taskFamilyId: family, operations: {} } }, idempotencyKey: "seed-practice" });
    await store.appendCommand({ events: [transferEvent], session: { sessionId: transfer, kind: "transfer", contentIntegrityKey: snapshot.integrityKey, state: { actorId: actor, practiceSessionId: practice, pairId: pair, pairVersion: "pair-v1", skillId: skill, taskId: transferTask, taskVersion: "task-v1", familyId: family, snapshotKey: snapshot.integrityKey, operations: {} } }, idempotencyKey: "seed-transfer" });
    const receipts = new CapabilityReceiptService(store, () => new Date("2026-08-14T00:01:00.000Z"));
    const results = await Promise.all([receipts.issue({ actorId: actor, practiceSessionId: practice, transferSessionId: transfer, idempotencyKey: "first" }), receipts.issue({ actorId: actor, practiceSessionId: practice, transferSessionId: transfer, idempotencyKey: "second" })]);
    assert.equal(results.filter((result) => result.replayed).length, 1);
    assert.equal((await store.list(actor)).filter((stored) => stored.event.type === "capability_receipt_issued").length, 1);
    assert.equal((await client.query<{ count: string }>("SELECT count(*) FROM capability_receipts")).rows[0]?.count, "1");
  } finally { await client.close(); }
});
