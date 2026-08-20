import assert from "node:assert/strict";
import test from "node:test";

import type { AnswerSpec } from "../content/schema.js";
import { SCORING_POLICY_VERSION } from "../domain/policies.js";
import { DeterministicScoringService } from "./service.js";

const service = new DeterministicScoringService();
const score = (answerSpec: AnswerSpec, answer: Parameters<typeof service.score>[1]) => service.score({ answerSpec }, answer);

test("scores normalized exact text and preserves versions", () => {
  assert.deepEqual(score(
    { kind: "exact_text", accepted: ["đúng  án"], normalizationVersion: "answer-v7" },
    { kind: "text", value: "  đúng\u00a0 án  " },
  ), {
    outcome: "correct", scorerVersion: SCORING_POLICY_VERSION, answerSpecVersion: "answer-v7", normalizedAnswer: "đúng án",
  });
});

test("scores choices only from a choice submission", () => {
  const spec: AnswerSpec = { kind: "choice", acceptedOptionIds: ["option-a"], normalizationVersion: "answer-v2" };
  assert.equal(score(spec, { kind: "choice", optionId: " option-a " }).outcome, "correct");
  assert.deepEqual(score(spec, "option-a"), {
    outcome: "invalid", scorerVersion: SCORING_POLICY_VERSION, answerSpecVersion: "answer-v2", reasonCode: "FORMAT",
  });
});

test("compares decimals without floating point boundary drift", () => {
  const spec: AnswerSpec = { kind: "numeric", expected: "1.25", tolerance: "0.05", normalizationVersion: "numeric-v3" };
  assert.equal(score(spec, "1.20").outcome, "correct");
  assert.equal(score(spec, "1.30").outcome, "correct");
  assert.deepEqual(score(spec, "1.3001"), {
    outcome: "incorrect", scorerVersion: SCORING_POLICY_VERSION, answerSpecVersion: "numeric-v3", normalizedAnswer: "1.3001", reasonCode: "OUT_OF_TOLERANCE",
  });
});

test("rejects malformed answers and unsupported expression specs deterministically", () => {
  const numeric: AnswerSpec = { kind: "numeric", expected: "2", normalizationVersion: "numeric-v1" };
  assert.deepEqual(score(numeric, "2e0"), {
    outcome: "invalid", scorerVersion: SCORING_POLICY_VERSION, answerSpecVersion: "numeric-v1", normalizedAnswer: "2e0", reasonCode: "FORMAT",
  });
  const expression: AnswerSpec = { kind: "expression", expected: "x + 1", equivalencePolicy: "symbolic", normalizationVersion: "expression-v1" };
  assert.deepEqual(score(expression, "1 + x"), {
    outcome: "invalid", scorerVersion: SCORING_POLICY_VERSION, answerSpecVersion: "expression-v1", reasonCode: "FORMAT",
  });
  assert.equal(score(numeric, null).outcome, "invalid");
});

test("leaves written solutions for the later reviewed-rubric route", () => {
  const written: AnswerSpec = { kind: "written_solution", assessment: { expectedResult: "2", gradingShape: { finalAnswerFacet: "required", reasoningFacet: "required", requiredCriterionIds: [], optionalCriterionIds: [] }, criteria: [], referenceSolutions: [{ format: "plain_text", body: "Any valid method." }], commonMisconceptions: [], aiGuidance: { version: "g1", allowedSupportLevels: ["PROMPT"] } } };
  assert.equal(score(written, { kind: "written_solution", rawText: "I used two points." } as never).outcome, "invalid");
});
