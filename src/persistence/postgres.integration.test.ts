import assert from "node:assert/strict";
import test from "node:test";
import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import { NodePostgresClient } from "./pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "./index.js";
import { runMigrations } from "./migrations.js";

const url = process.env.THINKAI_TEST_DATABASE_URL;
const integration = url ? test : test.skip;

async function isolatedDatabase(schema: string): Promise<NodePostgresClient> {
  const admin = NodePostgresClient.fromConnectionString(url!);
  try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`); }
  finally { await admin.close(); }
  const client = NodePostgresClient.fromConnectionStringInSchema(url!, schema);
  await runMigrations(client);
  return client;
}

integration("PostgreSQL persistence commits one idempotent event and rejects duplicate event IDs", async () => {
  const client = await isolatedDatabase("thinkai_pg_idempotency");
  try {
    const store = new PostgresTransactionalEvidencePersistence(client);
    const event = { id: evidenceEventId("event_pg_live"), type: "challenge_started" as const, actorId: actorId("actor_pg_live"), correlationId: "pg-live", skillId: skillId("skill_pg_live"), occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, provenance: "live" as const, payload: { source: "integration" } };
    const [one, two] = await Promise.all([store.appendCommand({ events: [event], idempotencyKey: "pg-same-key" }), store.appendCommand({ events: [event], idempotencyKey: "pg-same-key" })]);
    assert.equal(one.events.length + two.events.length >= 1, true);
    const count = await client.query<{ count: string }>("SELECT count(*) FROM evidence_events");
    assert.equal(count.rows[0]?.count, "1");
  } finally { await client.close(); }
});

integration("PostgreSQL rejects a stale distinct-key session snapshot rather than losing an operation", async () => {
  const client = await isolatedDatabase("thinkai_pg_concurrency");
  try {
    const store = new PostgresTransactionalEvidencePersistence(client);
    const content = { pair: { id: "pair_pg_lock", version: "1" }, practiceTask: { id: "task_pg_lock", version: "1" }, transferTask: { id: "task_pg_lock_transfer", version: "1" }, interventions: [], integrityKey: "snapshot_pg_lock" };
    const base = { sessionId: "challenge_pg_lock", kind: "challenge" as const, contentIntegrityKey: content.integrityKey, state: { operations: {} } };
    const make = (id: string) => ({ id: evidenceEventId(id), type: "attempt_submitted" as const, actorId: actorId("actor_pg_lock"), correlationId: "challenge_pg_lock", skillId: skillId("skill_pg_lock"), occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, provenance: "live" as const, payload: { source: "integration" } });
    await store.appendCommand({ events: [make("event_pg_lock_start")], contentSnapshot: content, session: base, idempotencyKey: "pg-lock-start" });
    const [first, second] = await Promise.allSettled([
      store.appendCommand({ events: [make("event_pg_lock_first")], session: { ...base, state: { operations: { first: { fingerprint: "first" } } } }, idempotencyKey: "pg-lock-first" }),
      store.appendCommand({ events: [make("event_pg_lock_second")], session: { ...base, state: { operations: { second: { fingerprint: "second" } } } }, idempotencyKey: "pg-lock-second" }),
    ]);
    assert.equal([first, second].filter((result) => result.status === "fulfilled").length, 1);
    assert.equal([first, second].filter((result) => result.status === "rejected" && /SESSION_CONCURRENT_MODIFICATION/.test(String(result.reason))).length, 1);
    const row = await client.query<{ snapshot: { operations: Record<string, unknown> } }>("SELECT snapshot FROM session_snapshots WHERE session_id = $1", [base.sessionId]);
    assert.equal(Object.keys(row.rows[0]?.snapshot.operations ?? {}).length, 1);
  } finally { await client.close(); }
});
