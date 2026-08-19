import assert from "node:assert/strict";
import test from "node:test";

import { AssistancePolicyError, recordAssistance, summarizeAssistance } from "./index.js";

test("summarizes no assistance without treating it as a score", () => {
  const summary = summarizeAssistance([]);
  assert.equal(summary.aiUsed, false);
  assert.equal(summary.interactionCount, 0);
  assert.equal(summary.highestSupportLevel, "NONE");
  assert.equal(summary.answerRevealed, false);
});

test("keeps the strongest observed assistance level and interaction count", () => {
  const records = [
    recordAssistance({ supportLevel: "CONCEPTUAL_HINT", messageId: "m1", occurredAt: "2026-08-19T00:00:00.000Z" }),
    recordAssistance({ supportLevel: "STRATEGIC_HINT", messageId: "m2", occurredAt: "2026-08-19T00:00:01.000Z" }),
    recordAssistance({ supportLevel: "STRONG_SCAFFOLD", messageId: "m3", occurredAt: "2026-08-19T00:00:02.000Z" }),
  ];
  const summary = summarizeAssistance(records);
  assert.equal(summary.aiUsed, true);
  assert.equal(summary.interactionCount, 3);
  assert.equal(summary.highestSupportLevel, "STRONG_SCAFFOLD");
  assert.equal(summary.answerRevealed, false);
});

test("rejects any record claiming that the companion revealed an answer", () => {
  assert.throws(
    () => recordAssistance({ supportLevel: "PROMPT", messageId: "m1", occurredAt: "2026-08-19T00:00:00.000Z", answerRevealed: true }),
    AssistancePolicyError,
  );
});
