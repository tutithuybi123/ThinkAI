import assert from "node:assert/strict";
import test from "node:test";

import { projectLearnerDiscovery, type PublishedDiscoveryNode } from "./discovery.js";

const nodes: readonly PublishedDiscoveryNode[] = [
  {
    subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
    topic: { id: "topic_quadratic", label: "Phương trình quy về bậc hai", displayOrder: 1 },
    microSkill: { id: "micro_factor", evidenceSkillId: "skill_factor_evidence", revisionId: "revision_factor", title: "Phân tích tam thức thành nhân tử", displayOrder: 1, prerequisiteMicroSkillIds: [] },
  },
  {
    subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
    topic: { id: "topic_quadratic", label: "Phương trình quy về bậc hai", displayOrder: 1 },
    microSkill: { id: "micro_zero_product", evidenceSkillId: "skill_zero_product_evidence", revisionId: "revision_zero_product", title: "Dùng tích bằng 0 để tìm nghiệm", displayOrder: 2, prerequisiteMicroSkillIds: ["micro_factor"] },
  },
];

test("projects authored hierarchy and server-owned first-use action without hidden task metadata", () => {
  const discovery = projectLearnerDiscovery(nodes, []);

  assert.equal(discovery.subjects.length, 1);
  assert.equal(discovery.subjects[0]?.label, "Toán 10");
  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[0]?.state, "available");
  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[1]?.state, "unavailable");
  assert.equal(discovery.nextAction.kind, "start_practice");
  assert.equal(discovery.nextAction.microSkillRevisionId, "revision_factor");
  assert.equal(JSON.stringify(discovery).includes("pairId"), false);
  assert.equal(JSON.stringify(discovery).includes("rubric"), false);
  assert.equal(JSON.stringify(discovery).includes("evidenceSkillId"), false);
});

test("uses persisted signals for resumable current work", () => {
  const discovery = projectLearnerDiscovery(nodes, [
    { type: "practice_started", microSkillId: "micro_factor", sessionId: "challenge_resume" },
  ]);

  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[0]?.state, "current");
  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[1]?.state, "unavailable");
  assert.deepEqual(discovery.nextAction, { kind: "resume_practice", microSkillRevisionId: "revision_factor", practiceSessionId: "challenge_resume" });
  assert.equal(discovery.progress.hasPracticeEvidence, true);
  assert.equal(discovery.progress.hasIndependentTransferEvidence, false);
});

test("uses completed independent evidence to unlock the next authored MicroSkill", () => {
  const discovery = projectLearnerDiscovery(nodes, [{ type: "transfer_pass", microSkillId: "micro_factor" }]);

  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[0]?.state, "completed");
  assert.equal(discovery.subjects[0]?.topics[0]?.microSkills[1]?.state, "available");
  assert.deepEqual(discovery.nextAction, { kind: "start_practice", microSkillRevisionId: "revision_zero_product" });
  assert.equal(discovery.progress.hasPracticeEvidence, false);
  assert.equal(discovery.progress.hasIndependentTransferEvidence, true);
});
