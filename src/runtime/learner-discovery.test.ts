import assert from "node:assert/strict";
import test from "node:test";

import { actorId, challengeSessionId, contentRevisionId, evidenceEventId, microSkillId, skillId, subjectId, topicId } from "../domain/ids.js";
import { assertPublishedEvidenceIdentity, deriveLearnerDiscovery } from "./learner-discovery.js";

const actor = actorId("actor_discovery");
const revision = {
  id: contentRevisionId("revision_factor"),
  lifecycle: "PUBLISHED",
  bodyHash: "fixture",
  body: {
    microSkills: [{
      subject: { id: subjectId("subject_math"), label: "Toán 10", displayOrder: 1 },
      topic: { id: topicId("topic_equation"), subjectId: subjectId("subject_math"), label: "Phương trình", displayOrder: 1 },
      microSkill: { id: microSkillId("micro_factor"), evidenceSkillId: skillId("skill_factor_evidence"), topicId: topicId("topic_equation"), revisionId: contentRevisionId("revision_factor"), title: "Phân tích nhân tử", displayOrder: 1, prerequisiteMicroSkillIds: [] },
      pairs: [],
    }],
  },
} as const;

test("maps persisted evidence through evidenceSkillId, never by authored microSkill id", () => {
  const event = {
    sequence: 1,
    event: {
      id: evidenceEventId("event_transfer_factor"), type: "transfer_scored" as const, actorId: actor, correlationId: "transfer_factor", skillId: skillId("skill_factor_evidence"), occurredAt: "2026-08-22T00:00:00.000Z", schemaVersion: 1, provenance: "live" as const, payload: { outcome: "correct" },
    },
  };

  const discovery = deriveLearnerDiscovery(revision.body.microSkills, [event]);

  assert.notEqual(String(revision.body.microSkills[0]!.microSkill.id), String(revision.body.microSkills[0]!.microSkill.evidenceSkillId));
  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[0]?.state, "completed");
  assert.equal(JSON.stringify(discovery).includes("evidenceSkillId"), false);
});

test("ignores unmapped evidence and does not guess an authored identity", () => {
  const event = {
    sequence: 1,
    event: {
      id: evidenceEventId("event_unmapped"), type: "challenge_started" as const, actorId: actor, correlationId: "challenge_unmapped", challengeSessionId: challengeSessionId("challenge_unmapped"), skillId: skillId("skill_unmapped"), occurredAt: "2026-08-22T00:00:00.000Z", schemaVersion: 1, provenance: "live" as const, payload: { started: true },
    },
  };

  const discovery = deriveLearnerDiscovery(revision.body.microSkills, [event]);

  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[0]?.state, "available");
  assert.equal(discovery.nextAction.kind, "start_practice");
});

test("fails closed when a published Practice pair would write evidence under a different domain skill", () => {
  const node = revision.body.microSkills[0]!;
  assert.doesNotThrow(() => assertPublishedEvidenceIdentity(node, skillId("skill_factor_evidence")));
  assert.throws(() => assertPublishedEvidenceIdentity(node, skillId("skill_other_evidence")), /evidence identity/i);
});
