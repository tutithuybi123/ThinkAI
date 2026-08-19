import assert from "node:assert/strict";
import test from "node:test";
import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import type { EvidenceEvent } from "../evidence/schema.js";
import { MemoryPersistenceDatabase, PostgresContentSnapshotRepository, PostgresEvidenceRepository, PostgresProjectionRepository, PostgresSessionSnapshotRepository, TransactionalEvidencePersistence, rebuildEvidenceProjections, type PostgresClient } from "./index.js";

const makeEvent = (number: number): EvidenceEvent => ({ id: evidenceEventId(`event_persist_${number}`), type: "attempt_submitted", actorId: actorId("actor_persist"), correlationId: "correlation_persist", skillId: skillId("skill_persist"), occurredAt: `2026-08-14T00:00:0${number}.000Z`, schemaVersion: 1, provenance: number === 2 ? "historical_seed" : "live", taskVersion: `task-v${number}`, scorerVersion: `score-v${number}`, policyVersion: `policy-v${number}`, payload: { ordinal: number } });

test("evidence is append-only and ordered by committed sequence", async () => {
  const store = new TransactionalEvidencePersistence();
  await store.append([makeEvent(2), makeEvent(1)]);
  assert.deepEqual((await store.list()).map((item) => [item.sequence, item.event.id]), [[1, makeEvent(2).id], [2, makeEvent(1).id]]);
  await assert.rejects(() => store.append([makeEvent(1)]), /append-only/);
});

test("a failing command rolls back every event, snapshot, and idempotency record", async () => {
  const db = new MemoryPersistenceDatabase(); const store = new TransactionalEvidencePersistence(db);
  const snapshot = { pair: { id: "pair_x", version: "1" }, practiceTask: { id: "task_x", version: "1" }, transferTask: { id: "task_y", version: "1" }, interventions: [], integrityKey: "snapshot_x" };
  await assert.rejects(() => store.appendCommand({ events: [makeEvent(1), { ...makeEvent(2), payload: {} }], contentSnapshot: snapshot, session: { sessionId: "challenge_x", kind: "challenge", contentIntegrityKey: "snapshot_x", state: {} }, idempotencyKey: "atomic" }));
  assert.equal((await store.list()).length, 0); assert.equal(await store.find("challenge_x"), undefined); assert.equal(await store.findContent("snapshot_x"), undefined);
});

test("provenance and all version fields survive persistence and idempotent retry", async () => {
  const store = new TransactionalEvidencePersistence(); const first = await store.appendCommand({ events: [makeEvent(2)], idempotencyKey: "request_1" }); const retry = await store.appendCommand({ events: [makeEvent(2)], idempotencyKey: "request_1" });
  assert.equal(retry.replayed, true); assert.equal(first.events[0]?.event.provenance, "historical_seed"); assert.equal(first.events[0]?.event.taskVersion, "task-v2"); assert.equal(first.events[0]?.event.scorerVersion, "score-v2"); assert.equal(first.events[0]?.event.policyVersion, "policy-v2");
});

test("projections are rebuildable and a new repository reloads the durable database", async () => {
  const database = new MemoryPersistenceDatabase(); const writer = new TransactionalEvidencePersistence(database); await writer.append([makeEvent(1), makeEvent(2)]);
  const reader = new TransactionalEvidencePersistence(database); const events = await reader.list(); const rebuilt = rebuildEvidenceProjections(events);
  assert.deepEqual(await reader.rebuild(events), rebuilt); assert.deepEqual(await reader.listProjections(), rebuilt); assert.equal(events.length, 2);
});

test("distinct-key stale session mutations are rejected instead of rolling a snapshot backwards", async () => {
  const database = new MemoryPersistenceDatabase();
  const store = new TransactionalEvidencePersistence(database);
  const content = { pair: { id: "pair_lock", version: "1" }, practiceTask: { id: "task_lock", version: "1" }, transferTask: { id: "task_lock_transfer", version: "1" }, interventions: [], integrityKey: "snapshot_lock" };
  const base = { sessionId: "challenge_lock", kind: "challenge" as const, contentIntegrityKey: content.integrityKey, state: { operations: {} } };
  await store.appendCommand({ events: [makeEvent(1)], contentSnapshot: content, session: base, idempotencyKey: "start" });
  const first = { ...base, state: { operations: { attempt: { fingerprint: "attempt" } } } };
  const staleSecond = { ...base, state: { operations: { submit: { fingerprint: "submit" } } } };
  await store.appendCommand({ events: [makeEvent(2)], session: first, idempotencyKey: "attempt" });
  await assert.rejects(() => store.appendCommand({ events: [{ ...makeEvent(2), id: evidenceEventId("event_persist_3") }], session: staleSecond, idempotencyKey: "submit" }), /SESSION_CONCURRENT_MODIFICATION/);
  assert.deepEqual(Object.keys(((await store.find("challenge_lock"))?.state.operations as Record<string, unknown>)), ["attempt"]);
});

test("PostgreSQL repositories hydrate persisted events and snapshots after restart", async () => {
  const event = makeEvent(2);
  const snapshot = { pair: { id: "pair_pg", version: "1" }, practiceTask: { id: "task_pg", version: "1" }, transferTask: { id: "task_pg_transfer", version: "1" }, interventions: [], integrityKey: "snapshot_pg" };
  const client: PostgresClient = {
    async transaction<T>(work: (transaction: PostgresClient) => Promise<T>): Promise<T> { return work(this); },
    async query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string): Promise<{ rows: readonly Row[] }> {
      if (sql.startsWith("SELECT sequence")) return { rows: [{ sequence: "7", id: event.id, type: event.type, actor_id: event.actorId, correlation_id: event.correlationId, challenge_session_id: null, transfer_session_id: null, skill_id: event.skillId, task_id: null, task_version: event.taskVersion, task_family_id: null, occurred_at: event.occurredAt, schema_version: event.schemaVersion, scorer_version: event.scorerVersion, policy_version: event.policyVersion, provenance: event.provenance, payload: JSON.stringify(event.payload) } as unknown as Row] };
      if (sql.startsWith("SELECT session_id")) return { rows: [{ session_id: "challenge_pg", session_kind: "challenge", content_integrity_key: snapshot.integrityKey, snapshot: JSON.stringify({ stage: "started" }) } as unknown as Row] };
      if (sql.startsWith("SELECT integrity_key")) return { rows: [{ integrity_key: snapshot.integrityKey, snapshot: JSON.stringify(snapshot) } as unknown as Row] };
      if (sql.startsWith("SELECT actor_id")) return { rows: [{ actor_id: event.actorId, skill_id: event.skillId, event_count: "1", last_sequence: "7", last_occurred_at: event.occurredAt } as unknown as Row] };
      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };
  // Fresh instances model a process restart while the PostgreSQL rows remain durable.
  const events = await new PostgresEvidenceRepository(client).list();
  const session = await new PostgresSessionSnapshotRepository(client).find("challenge_pg");
  const content = await new PostgresContentSnapshotRepository(client).find(snapshot.integrityKey);
  const projections = await new PostgresProjectionRepository(client).list();
  assert.deepEqual(events[0]?.event, event); assert.equal(events[0]?.sequence, 7);
  assert.deepEqual(session, { sessionId: "challenge_pg", kind: "challenge", contentIntegrityKey: snapshot.integrityKey, state: { stage: "started" } });
  assert.deepEqual(content, snapshot); assert.deepEqual(projections, [{ actorId: event.actorId, skillId: event.skillId, eventCount: 1, lastSequence: 7, lastOccurredAt: event.occurredAt }]);
});
