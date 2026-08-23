import assert from "node:assert/strict";
import test from "node:test";

import { validateReviewedAssessment } from "./rubric.js";

const assessment = {
  expectedResult: "m = 2",
  gradingShape: { finalAnswerFacet: "required", reasoningFacet: "required", requiredCriterionIds: ["identify", "calculate"], optionalCriterionIds: ["notation"] },
  criteria: [{ id: "identify", description: "Uses two points" }, { id: "calculate", description: "Computes rise over run" }, { id: "notation", description: "Uses gradient notation" }],
  referenceSolutions: [{ format: "plain_text", body: "Use any two points and divide rise by run." }],
  commonMisconceptions: ["Uses x divided by y"],
  aiGuidance: { version: "guidance-v1", allowedSupportLevels: ["PROMPT"] },
} as const;

test("reviewed assessment rejects duplicate, overlapping, and unknown criterion requiredness", () => {
  assert.deepEqual(validateReviewedAssessment(assessment), []);
  assert.match(validateReviewedAssessment({ ...assessment, gradingShape: { ...assessment.gradingShape, requiredCriterionIds: ["identify", "identify"] } })[0]!.code, /DUPLICATE/);
  assert.match(validateReviewedAssessment({ ...assessment, gradingShape: { ...assessment.gradingShape, optionalCriterionIds: ["identify"] } })[0]!.code, /DISJOINT/);
  assert.match(validateReviewedAssessment({ ...assessment, gradingShape: { ...assessment.gradingShape, requiredCriterionIds: ["missing"] } })[0]!.code, /UNKNOWN/);
  assert.match(validateReviewedAssessment({ ...assessment, gradingShape: { ...assessment.gradingShape, finalAnswerFacet: "invalid" as never } })[0]!.code, /FACET/);
});

test("malformed assessment values fail closed without throwing", () => {
  for (const value of [{}, { expectedResult: "x" }, { ...assessment, referenceSolutions: [{ format: "pdf", body: "x" }] }, { ...assessment, aiGuidance: { version: "v", allowedSupportLevels: ["NONE"] } }]) assert.doesNotThrow(() => assert.notEqual(validateReviewedAssessment(value).length, 0));
});

test("reviewed assessment requires at least one authored Companion support level", () => {
  assert.notEqual(validateReviewedAssessment({ ...assessment, aiGuidance: { version: "guidance-v1", allowedSupportLevels: [] } }).length, 0);
});
