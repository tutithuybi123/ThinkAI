import assert from "node:assert/strict";
import test from "node:test";

import { isSafeCompanionResponse, isRubricEvaluation } from "./contracts.js";

test("rejects a companion response that reveals a final answer", () => {
  assert.equal(isSafeCompanionResponse({ reply: "The answer is x = 2", supportLevel: "STRONG_SCAFFOLD", answerRevealed: true }), false);
});

test("accepts a bounded conceptual companion reply", () => {
  assert.equal(isSafeCompanionResponse({ reply: "Em thử so sánh Δx và Δy trước nhé.", supportLevel: "CONCEPTUAL_HINT", answerRevealed: false }), true);
});

test("fails closed for malformed rubric output", () => {
  assert.equal(isRubricEvaluation({ outcome: "CORRECT", finalAnswer: "correct", reasoning: "correct" }), false);
});
