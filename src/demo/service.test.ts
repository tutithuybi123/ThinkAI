import assert from "node:assert/strict";
import test from "node:test";
import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import { MemoryPersistenceDatabase, TransactionalEvidencePersistence } from "../persistence/index.js";
import { DemoService } from "./service.js";

test("presenter-only reset is deterministic and keeps historical seed separate", async () => {
  const database = new MemoryPersistenceDatabase(); const store = new TransactionalEvidencePersistence(database);
  const demo = new DemoService(database, "presenter", structuredClone(database.state), () => new Date("2026-08-14T00:00:00Z"));
  await store.append([{ id: evidenceEventId("event_demo"), type: "challenge_started", actorId: actorId("actor_demo"), correlationId: "demo", skillId: skillId("skill_demo"), occurredAt: "2026-08-14T00:00:00Z", schemaVersion: 1, provenance: "live", payload: { demo: true } }]);
  assert.equal((await store.list()).length, 1);
  assert.equal(demo.reset({ presenterSecret: "presenter", profile: "clean" }).provenance, "seeded_demo");
  assert.equal((await store.list()).length, 0);
  assert.equal(demo.reset({ presenterSecret: "presenter", profile: "clean" }).resetAt, "2026-08-14T00:00:00.000Z");
  assert.throws(() => demo.reset({ presenterSecret: "learner", profile: "clean" }), /DEMO_RESET_FORBIDDEN/);
  assert.deepEqual(demo.health(), { status: "ok", persistence: "available", ai: "disabled" });
});
