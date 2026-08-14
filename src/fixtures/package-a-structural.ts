import { interventionId, skillId, taskFamilyId, taskId, taskPairId } from "../domain/ids.js";
import { CONTENT_CONTRACT_VERSION } from "../domain/policies.js";
import type { ContentBundle, ReviewRecord } from "../content/schema.js";

const structuralReview: ReviewRecord = {
  status: "approved",
  reviewerId: "fixture-reviewer",
  reviewedAt: "2026-08-14T00:00:00.000Z",
  validationVersion: "fixture-validation-v1",
  sourceProvenance: "structural_test_only — not educationally validated",
};

/**
 * Contract fixture only. It contains no claim of teacher-reviewed mathematical validity
 * and must never be served as real learner content.
 */
export const packageAStructuralFixture: ContentBundle = {
  contractVersion: CONTENT_CONTRACT_VERSION,
  fixtureProvenance: "structural_test_only",
  skills: [{ id: skillId("skill_fixture"), version: "1", title: "Structural skill", targetRelation: "fixture relation", review: structuralReview }],
  taskFamilies: [
    { id: taskFamilyId("family_fixture_practice"), version: "1", skillId: skillId("skill_fixture"), representation: "fixture practice", review: structuralReview },
    { id: taskFamilyId("family_fixture_transfer"), version: "1", skillId: skillId("skill_fixture"), representation: "fixture transfer", review: structuralReview },
  ],
  tasks: [
    { id: taskId("task_fixture_practice"), version: "1", familyId: taskFamilyId("family_fixture_practice"), skillId: skillId("skill_fixture"), role: "practice", prompt: { format: "plain_text", body: "Structural practice prompt" }, assetRefs: [], answerSpec: { kind: "exact_text", accepted: ["fixture"], normalizationVersion: "normalization-v1" }, review: structuralReview },
    { id: taskId("task_fixture_transfer"), version: "1", familyId: taskFamilyId("family_fixture_transfer"), skillId: skillId("skill_fixture"), role: "transfer", prompt: { format: "plain_text", body: "Structural transfer prompt" }, assetRefs: [], answerSpec: { kind: "exact_text", accepted: ["fixture"], normalizationVersion: "normalization-v1" }, review: structuralReview },
  ],
  taskPairs: [{ id: taskPairId("pair_fixture"), version: "1", skillId: skillId("skill_fixture"), practiceTaskId: taskId("task_fixture_practice"), transferTaskId: taskId("task_fixture_transfer"), targetRelation: "fixture relation", changeDimensions: ["representation"], relationMapping: { title: "Fixture connection", sharedRelation: "fixture relation", explanation: { format: "plain_text", body: "Structural mapping only" }, practiceHighlights: ["a"], transferHighlights: ["b"] }, review: structuralReview }],
  interventions: [
    { id: interventionId("hint_fixture_1"), version: "1", taskId: taskId("task_fixture_practice"), title: "Fixture hint 1", body: { format: "plain_text", body: "Process support" }, exposureTags: ["process"], review: structuralReview },
    { id: interventionId("hint_fixture_2"), version: "1", taskId: taskId("task_fixture_practice"), title: "Fixture hint 2", body: { format: "plain_text", body: "Concept support" }, exposureTags: ["concept"], review: structuralReview },
    { id: interventionId("hint_fixture_3"), version: "1", taskId: taskId("task_fixture_practice"), title: "Fixture hint 3", body: { format: "plain_text", body: "Strategy support" }, exposureTags: ["strategy"], review: structuralReview },
  ],
};
