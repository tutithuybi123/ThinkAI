import assert from "node:assert/strict";
import test from "node:test";

import { aggregateGrading, type RubricEvaluation } from "./index.js";

const deterministicCorrect = {
  outcome: "correct" as const,
  scorerVersion: "score-v1",
  answerSpecVersion: "answer-v1",
};

const rubric = (overrides: Partial<RubricEvaluation> = {}): RubricEvaluation => ({
  outcome: "CORRECT",
  finalAnswer: "correct",
  reasoning: "correct",
  criteria: [],
  errors: [],
  confidence: "high",
  evaluatorVersion: "rubric-v1",
  ...overrides,
});

test("accepts a correct alternate method when final answer and reviewed reasoning agree", () => {
  const result = aggregateGrading({ deterministic: deterministicCorrect, rubric: rubric({ method: "quadratic_formula" }) });
  assert.equal(result.outcome, "CORRECT");
  assert.equal(result.method, "quadratic_formula");
});

test("keeps a correct final answer with invalid reasoning partially correct", () => {
  const result = aggregateGrading({ deterministic: deterministicCorrect, rubric: rubric({ outcome: "PARTIALLY_CORRECT", reasoning: "incorrect", errors: [{ code: "INVALID_DISCRIMINANT" }] }) });
  assert.equal(result.outcome, "PARTIALLY_CORRECT");
  assert.equal(result.finalAnswer, "correct");
  assert.equal(result.reasoning, "incorrect");
});

test("keeps correct procedure with an arithmetic final error partially correct", () => {
  const result = aggregateGrading({
    deterministic: { ...deterministicCorrect, outcome: "incorrect" as const },
    rubric: rubric({ outcome: "PARTIALLY_CORRECT", finalAnswer: "incorrect", reasoning: "correct", errors: [{ code: "ARITHMETIC" }] }),
  });
  assert.equal(result.outcome, "PARTIALLY_CORRECT");
  assert.equal(result.reasoning, "correct");
});

test("fails closed as uncertain when written-solution rubric evidence is unavailable", () => {
  const result = aggregateGrading({ deterministic: { ...deterministicCorrect, outcome: "invalid" as const }, rubricStatus: "unavailable" });
  assert.equal(result.outcome, "UNCERTAIN");
  assert.equal(result.reason, "RUBRIC_UNAVAILABLE");
});

test("fails closed when deterministic final answer conflicts with rubric final answer", () => {
  const result = aggregateGrading({ deterministic: deterministicCorrect, rubric: rubric({ finalAnswer: "incorrect" }) });
  assert.equal(result.outcome, "UNCERTAIN");
  assert.equal(result.reason, "DETERMINISTIC_RUBRIC_CONFLICT");
});
