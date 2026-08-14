import assert from "node:assert/strict";
import test from "node:test";

import { actorId, evidenceEventId, skillId } from "../domain/ids.js";
import { EVIDENCE_EVENT_SCHEMA_VERSION } from "../domain/policies.js";
import { validateEvidenceEvent, type EvidenceEvent } from "./schema.js";

const validEvent: EvidenceEvent = {
  id: evidenceEventId("event_fixture_1"),
  type: "attempt_submitted",
  actorId: actorId("actor_fixture"),
  correlationId: "correlation_fixture_1",
  skillId: skillId("skill_fixture"),
  occurredAt: "2026-08-14T00:00:00.000Z",
  schemaVersion: EVIDENCE_EVENT_SCHEMA_VERSION,
  provenance: "live",
  payload: { attemptKind: "text", ordinal: 1 },
};

test("evidence schema accepts a versioned append-only fact", () => {
  assert.deepEqual(validateEvidenceEvent(validEvent), []);
});

test("evidence correction must cite its target event", () => {
  const issues = validateEvidenceEvent({ ...validEvent, type: "evidence_corrected", payload: { reason: "fixture" } });
  assert.ok(issues.some((issue) => issue.path === "payload.targetEventId"));
});

test("evidence schema rejects empty payload and invalid timestamps", () => {
  const issues = validateEvidenceEvent({ ...validEvent, occurredAt: "not-a-date", payload: {} });
  assert.equal(issues.length, 2);
});
