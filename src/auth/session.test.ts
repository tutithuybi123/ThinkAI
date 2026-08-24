import assert from "node:assert/strict";
import test from "node:test";
import { actorId } from "../domain/ids.js";
import { PostgresSyntheticSessionRegistry, SignedSessionService, SyntheticSessionRegistry } from "./session.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "../persistence/index.js";
import { runMigrations } from "../persistence/migrations.js";
import { evidenceEventId, skillId } from "../domain/ids.js";

test("signed sessions reject tampering and expiry rather than trusting a caller actor", () => {
  const now = new Date("2026-08-14T00:00:00.000Z");
  const sessions = new SignedSessionService("0123456789abcdef0123456789abcdef", () => now);
  const token = sessions.issue({ actorId: actorId("actor_auth"), role: "learner", sessionId: "session_auth", ttlMs: 1_000 });
  assert.equal(sessions.verify(token).actorId, actorId("actor_auth"));
  assert.throws(() => sessions.verify(`${token}x`), /signature|malformed/i);
  const expired = new SignedSessionService("0123456789abcdef0123456789abcdef", () => new Date("2026-08-14T00:01:00.000Z"));
  assert.throws(() => expired.verify(token), /expired/i);
});

test("synthetic registry accepts only configured role claims and revokes a rotated actor session", () => {
  const signer = new SignedSessionService("0123456789abcdef0123456789abcdef");
  const registry = new SyntheticSessionRegistry(signer, [{ actorId: actorId("actor_learner_demo"), role: "learner" }]);
  const token = registry.issue(actorId("actor_learner_demo"), 60_000);
  assert.equal(registry.verify(token).role, "learner");
  const forgedRole = signer.issue({ actorId: actorId("actor_learner_demo"), role: "presenter", sessionId: "synthetic_forged", ttlMs: 60_000 });
  assert.throws(() => registry.verify(forgedRole), /not active/i);
  registry.rotate(actorId("actor_learner_demo"));
  assert.throws(() => registry.verify(token), /not active/i);
});

const databaseUrl = process.env.THINKAI_TEST_DATABASE_URL;
const integration = databaseUrl ? test : test.skip;

integration("PostgreSQL-backed synthetic sessions survive a registry restart and revoke across instances", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_auth_sessions CASCADE; CREATE SCHEMA thinkai_pg_auth_sessions");
  await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_auth_sessions");
  try {
    await runMigrations(client);
    const account = { actorId: actorId("actor_persistent_learner"), role: "learner" as const };
    const signer = new SignedSessionService("0123456789abcdef0123456789abcdef");
    const first = new PostgresSyntheticSessionRegistry(signer, client, [account]);
    await first.initialize();
    const token = await first.issue(account.actorId, 60_000);
    const restarted = new PostgresSyntheticSessionRegistry(signer, client, [account]);
    await restarted.initialize();
    assert.equal((await restarted.verify(token)).actorId, account.actorId);
    await restarted.rotate(account.actorId);
    await assert.rejects(() => first.verify(token), /no longer active/i);
  } finally { await client.close(); }
});

integration("public demo learners receive isolated actor sessions", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_public_demo_sessions CASCADE; CREATE SCHEMA thinkai_pg_public_demo_sessions");
  await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_public_demo_sessions");
  try {
    await runMigrations(client);
    const registry = new PostgresSyntheticSessionRegistry(new SignedSessionService("0123456789abcdef0123456789abcdef"), client, []);
    await registry.initialize();
    const first = await registry.issuePublicDemoLearner(60_000);
    const second = await registry.issuePublicDemoLearner(60_000);
    assert.notEqual(first.actorId, second.actorId);
    assert.equal((await registry.verify(first.token)).actorId, first.actorId);
    assert.equal((await registry.verify(second.token)).actorId, second.actorId);
  } finally { await client.close(); }
});

integration("a reset/revoked PostgreSQL actor session fences a previously authenticated write", async () => {
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query("DROP SCHEMA IF EXISTS thinkai_pg_auth_fence CASCADE; CREATE SCHEMA thinkai_pg_auth_fence");
  await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, "thinkai_pg_auth_fence");
  try {
    await runMigrations(client);
    const account = { actorId: actorId("actor_fenced_learner"), role: "learner" as const };
    const registry = new PostgresSyntheticSessionRegistry(new SignedSessionService("0123456789abcdef0123456789abcdef"), client, [account]);
    await registry.initialize(); const token = await registry.issue(account.actorId, 60_000);
    const authenticated = await registry.verify(token);
    await registry.rotate(account.actorId);
    const store = new PostgresTransactionalEvidencePersistence(client);
    await assert.rejects(() => store.appendCommand({
      actorSessionId: authenticated.sessionId,
      idempotencyKey: "fenced-write",
      events: [{ id: evidenceEventId("event_fenced_write"), type: "challenge_started", actorId: account.actorId, correlationId: "fenced", skillId: skillId("skill_fenced"), occurredAt: "2026-08-14T00:00:00.000Z", schemaVersion: 1, provenance: "live", payload: { fixture: true } }],
    }), /revoked/i);
    assert.equal((await store.list(account.actorId)).length, 0);
  } finally { await client.close(); }
});
