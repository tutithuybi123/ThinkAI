import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import test from "node:test";

import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";

const enabled = process.env.THINKAI_RUNTIME_ACCEPTANCE === "1" && process.env.THINKAI_TEST_DATABASE_URL;
const acceptance = enabled ? test : test.skip;
const databaseName = `thinkai_runtime_acceptance_${process.pid}`;
const sessionSecret = "0123456789abcdef0123456789abcdef";
const staffSecret = "runtime-acceptance-staff-secret";

interface RunningServer { readonly child: ChildProcess; readonly origin: string; readonly output: readonly Buffer[]; readonly distDir: string; }
interface HttpResult { readonly status: number; readonly body: Record<string, unknown>; readonly cookie?: string; readonly setCookie?: string; }

function assertSafeDatabaseName(value: string): void { assert.match(value, /^thinkai_runtime_acceptance_[0-9]+$/u); }
function databaseUrl(base: string, database: string): string { const url = new URL(base); url.pathname = `/${database}`; return url.toString(); }
async function freePort(): Promise<number> {
  const server = createServer(); server.listen(0, "127.0.0.1"); await once(server, "listening");
  const address = server.address(); assert.ok(address && typeof address !== "string"); const port = address.port;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); return port;
}
async function waitForHealth(origin: string): Promise<void> {
  let lastFailure = "server did not accept a connection";
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      const result = await fetch(`${origin}/healthz`);
      if (result.status === 200) return;
      lastFailure = `HTTP ${result.status}: ${(await result.text()).slice(0, 500)}`;
    } catch (error) { lastFailure = error instanceof Error ? error.message : String(error); }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next runtime did not reach a healthy HTTP state within 30 seconds. Last failure: ${lastFailure}`);
}
async function startRuntime(environment: NodeJS.ProcessEnv): Promise<RunningServer> {
  const port = await freePort();
  const distDir = `.next-runtime-acceptance-${process.pid}-${port}`;
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", String(port)], {
    cwd: process.cwd(), env: { ...environment, PORT: String(port), NEXT_TELEMETRY_DISABLED: "1", THINKAI_RUNTIME_ACCEPTANCE_TEST: "1", THINKAI_NEXT_DIST_DIR: distDir }, stdio: ["ignore", "pipe", "pipe"],
  });
  const output: Buffer[] = [];
  child.stdout?.on("data", (chunk: Buffer) => output.push(Buffer.from(chunk)));
  child.stderr?.on("data", (chunk: Buffer) => output.push(Buffer.from(chunk)));
  const origin = `http://127.0.0.1:${port}`;
  try { await waitForHealth(origin); } catch (error) {
    await stopRuntime({ child, origin, output, distDir }); throw new Error(`${error instanceof Error ? error.message : error}\nRuntime output:\n${Buffer.concat(output).toString("utf8")}`);
  }
  return { child, origin, output, distDir };
}
async function stopRuntime(server: RunningServer): Promise<void> {
  if (server.child.exitCode !== null || server.child.killed) return;
  server.child.kill("SIGTERM");
  await Promise.race([once(server.child, "exit"), new Promise((resolve) => setTimeout(resolve, 10_000))]);
  if (server.child.exitCode === null) server.child.kill("SIGKILL");
  await rm(join(process.cwd(), server.distDir), { recursive: true, force: true });
}
async function request(origin: string, method: string, path: string, input: { readonly cookie?: string; readonly body?: unknown; readonly idempotencyKey?: string; readonly headers?: Record<string, string> } = {}): Promise<HttpResult> {
  const headers: Record<string, string> = { ...(input.headers ?? {}) };
  if (input.cookie) headers.cookie = input.cookie;
  if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey;
  if (input.body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(`${origin}${path}`, { method, headers, ...(input.body === undefined ? {} : { body: JSON.stringify(input.body) }) });
  const json = await response.json() as Record<string, unknown>;
  const setCookie = response.headers.get("set-cookie");
  return { status: response.status, body: json, ...(setCookie ? { cookie: setCookie.split(";", 1)[0], setCookie } : {}) };
}
function expectStatus(result: HttpResult, status: number): HttpResult { assert.equal(result.status, status, JSON.stringify(result.body)); return result; }
async function bootstrapLearner(origin: string, profile: "clean" | "history"): Promise<string> {
  const result = expectStatus(await request(origin, "POST", "/api/v1/demo/session", { body: { profile } }), 200);
  assert.match(result.setCookie ?? "", /HttpOnly/iu, "demo bootstrap cookie must be HttpOnly");
  assert.match(result.setCookie ?? "", /SameSite=Lax/iu, "demo bootstrap cookie must use SameSite=Lax");
  assert.equal(JSON.stringify(result.body).includes("token"), false, "demo bootstrap JSON must not expose the signed session token");
  assert.ok(result.cookie, "demo bootstrap must issue an HttpOnly session cookie"); return result.cookie;
}
async function bootstrapStaff(origin: string): Promise<string> {
  const result = expectStatus(await request(origin, "POST", "/api/v1/demo/staff-session", { body: { role: "presenter" }, headers: { "X-ThinkAI-Staff-Bootstrap": staffSecret } }), 200);
  assert.ok(result.cookie, "staff bootstrap must issue a session cookie"); return result.cookie;
}
async function createCleanDatabase(admin: NodePostgresClient): Promise<void> {
  assertSafeDatabaseName(databaseName);
  await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [databaseName]);
  await admin.query(`DROP DATABASE IF EXISTS ${databaseName}`); await admin.query(`CREATE DATABASE ${databaseName}`);
}
async function runGoldenFlow(server: RunningServer, suffix: string): Promise<{ readonly cleanCookie: string; readonly historyCookie: string; readonly staffCookie: string; readonly challengeId: string; readonly transferId: string; readonly receiptId: string }> {
  const cleanCookie = await bootstrapLearner(server.origin, "clean"); const historyCookie = await bootstrapLearner(server.origin, "history"); const staffCookie = await bootstrapStaff(server.origin);
  expectStatus(await request(server.origin, "GET", "/healthz"), 200);
  expectStatus(await request(server.origin, "GET", "/api/v1/home", { cookie: cleanCookie }), 200);
  expectStatus(await request(server.origin, "GET", "/api/v1/skills", { cookie: cleanCookie }), 200);
  const challengeId = `challenge_runtime_${suffix}`;
  const start = expectStatus(await request(server.origin, "POST", "/api/v1/challenges/start", { cookie: cleanCookie, idempotencyKey: `start-${suffix}`, body: { sessionId: challengeId, pairId: "pair_forged" } }), 201);
  assert.equal((start.body.challenge as { pairId?: unknown }).pairId, "pair_fixture", "server must ignore supplied pair selection");
  expectStatus(await request(server.origin, "GET", `/api/v1/challenges/${challengeId}`, { cookie: cleanCookie }), 200);
  expectStatus(await request(server.origin, "POST", `/api/v1/challenges/${challengeId}/attempts`, { cookie: cleanCookie, idempotencyKey: `attempt-${suffix}`, body: { kind: "attempt" } }), 200);
  expectStatus(await request(server.origin, "POST", `/api/v1/challenges/${challengeId}/interventions/hint_fixture_1/open`, { cookie: cleanCookie, idempotencyKey: `hint-${suffix}`, body: {} }), 200);
  expectStatus(await request(server.origin, "POST", `/api/v1/challenges/${challengeId}/submissions`, { cookie: cleanCookie, idempotencyKey: `solve-${suffix}`, body: { answer: "fixture" } }), 200);
  const requestedTransferId = `transfer_runtime_${suffix}`;
  const transfer = expectStatus(await request(server.origin, "POST", `/api/v1/challenges/${challengeId}/transfer/start`, { cookie: cleanCookie, idempotencyKey: `transfer-start-${suffix}`, body: { sessionId: requestedTransferId } }), 201);
  const transferIdValue = transfer.body.sessionId;
  if (typeof transferIdValue !== "string") throw new Error("Transfer start response did not contain a server-issued session ID.");
  const transferId = transferIdValue;
  assert.equal(JSON.stringify(transfer.body).includes("hint_fixture"), false, "transfer view must remain isolated from practice hint context");
  expectStatus(await request(server.origin, "GET", `/api/v1/transfers/${transferId}`, { cookie: cleanCookie }), 200);
  expectStatus(await request(server.origin, "POST", `/api/v1/transfers/${transferId}/submissions`, { cookie: cleanCookie, idempotencyKey: `transfer-submit-${suffix}`, body: { answer: "fixture" } }), 200);
  expectStatus(await request(server.origin, "POST", `/api/v1/transfers/${transferId}/connection/reveal`, { cookie: cleanCookie, idempotencyKey: `reveal-${suffix}`, body: {} }), 200);
  const receipt = expectStatus(await request(server.origin, "POST", "/api/v1/receipts/issue", { cookie: cleanCookie, idempotencyKey: `receipt-${suffix}`, body: { practiceSessionId: challengeId, transferSessionId: transferId } }), 201);
  const receiptIdValue = (receipt.body.receipt as { id?: unknown }).id;
  if (typeof receiptIdValue !== "string") throw new Error("Receipt response did not contain a string receipt ID.");
  const receiptId = receiptIdValue;
  const duplicateReceipt = expectStatus(await request(server.origin, "POST", "/api/v1/receipts/issue", { cookie: cleanCookie, idempotencyKey: `receipt-duplicate-${suffix}`, body: { practiceSessionId: challengeId, transferSessionId: transferId } }), 201);
  assert.equal((duplicateReceipt.body.receipt as { id?: unknown }).id, receiptId, "a duplicate public receipt request must return the original receipt");
  assert.equal(duplicateReceipt.body.replayed, true, "duplicate public receipt issuance must be reported as a replay");
  expectStatus(await request(server.origin, "GET", `/api/v1/receipts/${receiptId}`, { cookie: cleanCookie }), 200);
  expectStatus(await request(server.origin, "GET", "/api/v1/progress", { cookie: cleanCookie }), 200);
  expectStatus(await request(server.origin, "GET", `/api/v1/audit/receipts/${receiptId}`, { cookie: staffCookie }), 200);
  assert.equal((await request(server.origin, "GET", `/api/v1/audit/receipts/${receiptId}`, { cookie: cleanCookie })).status, 403);
  return { cleanCookie, historyCookie, staffCookie, challengeId, transferId, receiptId };
}

acceptance("actual Next HTTP runtime accepts the explicitly test-only structural fixture", { timeout: 180_000 }, async () => {
  assertSafeDatabaseName(databaseName);
  const base = process.env.THINKAI_TEST_DATABASE_URL!;
  const adminUrl = databaseUrl(base, "postgres"); const runtimeUrl = databaseUrl(base, databaseName);
  const temporary = await mkdtemp(join(tmpdir(), "thinkai-runtime-acceptance-"));
  const contentPath = join(temporary, "content.json"); const seedPath = join(temporary, "seed.json");
  const seed = {
    clean: { profile: "clean", actorId: "actor_demo_clean", fixtureVersion: "runtime-acceptance-v1", events: [] },
    history: { profile: "history", actorId: "actor_demo_history", fixtureVersion: "runtime-acceptance-v1", events: [{ id: evidenceEventId("event_runtime_history_seed"), type: "challenge_started", actorId: actorId("actor_demo_history"), correlationId: "runtime-history", skillId: skillId("skill_fixture"), occurredAt: "2026-08-15T00:00:00.000Z", schemaVersion: 1, provenance: "historical_seed", payload: { source: "runtime_acceptance" } }] },
  };
  const seedText = JSON.stringify(seed); await writeFile(contentPath, JSON.stringify(packageAStructuralFixture), "utf8"); await writeFile(seedPath, seedText, "utf8");
  const environment: NodeJS.ProcessEnv = {
    ...process.env, NODE_ENV: "development", THINKAI_DATABASE_URL: runtimeUrl, THINKAI_SESSION_SECRET: sessionSecret,
    THINKAI_CONTENT_PATH: contentPath, THINKAI_DEMO_SEED_PATH: seedPath, THINKAI_DEMO_SEED_SHA256: createHash("sha256").update(seedText, "utf8").digest("hex"), THINKAI_DEMO_SEED_VERSION: "runtime-acceptance-v1", THINKAI_DEMO_STAFF_BOOTSTRAP_SECRET: staffSecret,
  };
  const admin = NodePostgresClient.fromConnectionString(adminUrl); let server: RunningServer | undefined;
  try {
    await createCleanDatabase(admin);
    server = await startRuntime(environment);
    expectStatus(await request(server.origin, "GET", "/healthz"), 200);
    const first = await runGoldenFlow(server, "first");
    const runtimeDatabase = NodePostgresClient.fromConnectionString(runtimeUrl);
    try {
      const migrations = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM schema_migrations"); assert.equal(Number(migrations.rows[0]?.count), 7, "runtime must apply every real migration");
      await stopRuntime(server); server = await startRuntime(environment);
      expectStatus(await request(server.origin, "GET", `/api/v1/challenges/${first.challengeId}`, { cookie: first.cleanCookie }), 200);
      assert.equal((await request(server.origin, "GET", "/api/v1/home", { cookie: `${first.cleanCookie}x` })).status, 401, "tampered signed cookie must be rejected");
      await runtimeDatabase.query(`INSERT INTO evidence_events (id,type,actor_id,correlation_id,skill_id,occurred_at,schema_version,provenance,payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`, ["event_runtime_unrelated", "challenge_started", "actor_runtime_unrelated", "runtime-unrelated", "skill_fixture", "2026-08-15T00:00:00.000Z", 1, "live", JSON.stringify({ source: "runtime_acceptance" })]);
      const historyBefore = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM evidence_events WHERE actor_id = $1", ["actor_demo_history"]);
      const unrelatedBefore = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM evidence_events WHERE actor_id = $1", ["actor_runtime_unrelated"]);
      const reset = expectStatus(await request(server.origin, "POST", "/api/v1/demo/reset", { cookie: first.staffCookie, idempotencyKey: "runtime-reset", body: {} }), 200);
      expectStatus(await request(server.origin, "POST", "/api/v1/demo/reset", { cookie: first.staffCookie, idempotencyKey: "runtime-reset", body: {} }), 200);
      assert.equal((await request(server.origin, "GET", "/api/v1/home", { cookie: first.cleanCookie })).status, 401, "reset must revoke the old clean session");
      expectStatus(await request(server.origin, "GET", "/api/v1/home", { cookie: first.historyCookie }), 200);
      const historyAfter = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM evidence_events WHERE actor_id = $1", ["actor_demo_history"]);
      const unrelatedAfter = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM evidence_events WHERE actor_id = $1", ["actor_runtime_unrelated"]);
      const audits = await runtimeDatabase.query<{ count: string }>("SELECT count(*) FROM demo_reset_audit");
      assert.equal(historyAfter.rows[0]?.count, historyBefore.rows[0]?.count, "reset must preserve history profile"); assert.equal(unrelatedAfter.rows[0]?.count, unrelatedBefore.rows[0]?.count, "reset must preserve unrelated actor evidence"); assert.equal(audits.rows[0]?.count, "1", "same reset idempotency key must produce one audit"); assert.equal(reset.body.provenance, "seeded_demo");
      const freshCookie = await bootstrapLearner(server.origin, "clean"); const concurrentId = "challenge_runtime_concurrent";
      expectStatus(await request(server.origin, "POST", "/api/v1/challenges/start", { cookie: freshCookie, idempotencyKey: "concurrent-start", body: { sessionId: concurrentId } }), 201);
      const concurrent = await Promise.all([request(server.origin, "POST", `/api/v1/challenges/${concurrentId}/attempts`, { cookie: freshCookie, idempotencyKey: "concurrent-a", body: { kind: "attempt" } }), request(server.origin, "POST", `/api/v1/challenges/${concurrentId}/attempts`, { cookie: freshCookie, idempotencyKey: "concurrent-b", body: { kind: "attempt" } })]);
      assert.ok(concurrent.every((item) => item.status === 200 || item.status === 409), "distinct concurrent mutation responses must be success or typed conflict");
      const resumed = expectStatus(await request(server.origin, "GET", `/api/v1/challenges/${concurrentId}`, { cookie: freshCookie }), 200);
      const attempts = ((resumed.body as { state?: { attemptCount?: unknown } }).state?.attemptCount); assert.ok(attempts === 1 || attempts === 2, "concurrent writes must leave a monotonic resumed state");
    } finally { await runtimeDatabase.close(); }
    await stopRuntime(server); server = undefined;
    await createCleanDatabase(admin);
    server = await startRuntime(environment);
    await runGoldenFlow(server, "second");
  } finally { if (server) await stopRuntime(server); await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [databaseName]); await admin.query(`DROP DATABASE IF EXISTS ${databaseName}`); await admin.close(); await rm(temporary, { recursive: true, force: true }); }
});
