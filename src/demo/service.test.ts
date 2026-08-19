import assert from "node:assert/strict";
import test from "node:test";
import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import { MemoryPersistenceDatabase, TransactionalEvidencePersistence } from "../persistence/index.js";
import { DemoService } from "./service.js";
import { PostgresDemoService } from "./service.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "../persistence/index.js";
import { runMigrations } from "../persistence/migrations.js";

test("presenter-only reset is deterministic and keeps historical seed separate", async () => {
  const database = new MemoryPersistenceDatabase(); const store = new TransactionalEvidencePersistence(database); const cleanActor = actorId("actor_demo");
  const demo = new DemoService(database, cleanActor, () => new Date("2026-08-14T00:00:00Z"));
  await store.append([{ id: evidenceEventId("event_demo"), type: "challenge_started", actorId: actorId("actor_demo"), correlationId: "demo", skillId: skillId("skill_demo"), occurredAt: "2026-08-14T00:00:00Z", schemaVersion: 1, provenance: "live", payload: { demo: true } }]);
  assert.equal((await store.list()).length, 1);
  assert.equal(demo.reset({ resetBy: actorId("actor_presenter") }).provenance, "seeded_demo");
  assert.equal((await store.list()).length, 0);
  assert.equal(demo.reset({ resetBy: actorId("actor_presenter") }).resetAt, "2026-08-14T00:00:00.000Z");
  assert.equal(database.state.demoResetAudit.length, 2);
  assert.deepEqual(demo.health(), { status: "ok", persistence: "available", ai: "disabled" });
});

const databaseUrl = process.env.THINKAI_TEST_DATABASE_URL;
const integration = databaseUrl ? test : test.skip;

integration("PostgreSQL reset scopes deletion to demo-clean, removes stale idempotency, and records durable audit", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_demo_reset CASCADE; CREATE SCHEMA thinkai_pg_demo_reset");
  await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_demo_reset");
  try {
    await runMigrations(client);
    const store = new PostgresTransactionalEvidencePersistence(client);
    const clean = actorId("actor_demo_clean"); const history = actorId("actor_demo_history"); const other = actorId("actor_demo_other");
    const event = (id: string, actorIdValue: ReturnType<typeof actorId>) => ({ id: evidenceEventId(id), type: "challenge_started" as const, actorId: actorIdValue, correlationId: id, skillId: skillId("skill_demo"), occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, provenance: actorIdValue === history ? "historical_seed" as const : "live" as const, payload: { fixture: true } });
    const snapshot = { pair: { id: "pair_reset", version: "1" }, practiceTask: { id: "task_reset", version: "1" }, transferTask: { id: "task_reset_transfer", version: "1" }, interventions: [], integrityKey: "snapshot_reset" };
    const demo = new PostgresDemoService(client, clean, "fixture-reset-v1");
    await demo.initialize({
      clean: { profile: "clean", actorId: clean, fixtureVersion: "fixture-reset-v1", events: [{ ...event("event_reset_clean_seed", clean), provenance: "seeded_demo" }] },
      history: { profile: "history", actorId: history, fixtureVersion: "fixture-reset-v1", events: [event("event_reset_history_seed", history)] },
    });
    await store.appendCommand({ events: [event("event_reset_clean", clean)], contentSnapshot: snapshot, session: { sessionId: "challenge_reset_clean", kind: "challenge", contentIntegrityKey: snapshot.integrityKey, state: { actorId: clean, operations: {} } }, idempotencyKey: "practice:challenge_reset_clean:old" });
    await client.query("INSERT INTO capability_receipts (receipt_id,actor_id,transfer_scored_event_id,policy_version,issued_event_id,issued_at) VALUES ($1,$2,$3,$4,$5,$6)", ["receipt_reset_clean", clean, evidenceEventId("event_reset_clean"), "receipt-policy-v1", evidenceEventId("event_reset_clean"), "2026-08-14T00:00:00.000Z"]);
    await store.appendCommand({ events: [event("event_reset_other", other)], idempotencyKey: "practice:challenge_reset_other:old" });
    const firstReset = await demo.reset({ resetBy: actorId("actor_demo_presenter"), idempotencyKey: "reset-one" });
    const replayReset = await demo.reset({ resetBy: actorId("actor_demo_presenter"), idempotencyKey: "reset-one" });
    assert.deepEqual(replayReset, firstReset, "the same reset retry returns the original result");
    await Promise.all([
      demo.reset({ resetBy: actorId("actor_demo_presenter"), idempotencyKey: "reset-concurrent" }),
      demo.reset({ resetBy: actorId("actor_demo_presenter"), idempotencyKey: "reset-concurrent" }),
    ]);
    assert.equal((await store.list(clean)).length, 1, "clean baseline is re-seeded, not merely deleted");
    assert.equal((await store.list(clean))[0]?.event.id, evidenceEventId("event_reset_clean_seed"));
    assert.equal((await client.query<{ count: string }>("SELECT count(*) FROM capability_receipts WHERE actor_id = $1", [clean])).rows[0]?.count, "0");
    assert.equal((await store.list(history)).length, 1);
    assert.equal((await store.list(other)).length, 1);
    const audit = await client.query<{ actor_id: string; reset_by: string; fixture_version: string }>("SELECT actor_id,reset_by,fixture_version FROM demo_reset_audit");
    assert.deepEqual(audit.rows, [
      { actor_id: clean, reset_by: actorId("actor_demo_presenter"), fixture_version: "fixture-reset-v1" },
      { actor_id: clean, reset_by: actorId("actor_demo_presenter"), fixture_version: "fixture-reset-v1" },
    ], "one audit exists for each distinct reset operation, including concurrent retry");
    const afterReset = await store.appendCommand({ events: [event("event_reset_clean_after", clean)], contentSnapshot: snapshot, session: { sessionId: "challenge_reset_clean", kind: "challenge", contentIntegrityKey: snapshot.integrityKey, state: { actorId: clean, operations: {} } }, idempotencyKey: "practice:challenge_reset_clean:old" });
    assert.equal(afterReset.replayed, false, "reset must remove the clean actor's old idempotency record");
  } finally { await client.close(); }
});

integration("PostgreSQL demo baselines are immutable after first registration", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_demo_baseline CASCADE; CREATE SCHEMA thinkai_pg_demo_baseline");
  await admin.close(); const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_demo_baseline");
  try {
    await runMigrations(client); const clean = actorId("actor_baseline_clean"), history = actorId("actor_baseline_history");
    const seed = (cleanEvent: string) => ({ clean: { profile: "clean" as const, actorId: clean, fixtureVersion: "fixture-v1", events: [{ id: evidenceEventId(cleanEvent), type: "challenge_started" as const, actorId: clean, correlationId: cleanEvent, skillId: skillId("skill_baseline"), occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, provenance: "seeded_demo" as const, payload: { fixture: true } }] }, history: { profile: "history" as const, actorId: history, fixtureVersion: "fixture-v1", events: [] } });
    const demo = new PostgresDemoService(client, clean);
    await demo.initialize(seed("event_baseline_first"));
    await assert.rejects(() => demo.initialize(seed("event_baseline_tampered")), /immutable source/i);
  } finally { await client.close(); }
});
