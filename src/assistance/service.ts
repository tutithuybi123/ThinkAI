import type { AssistanceLevel, AssistanceRecord, AssistanceSummary, RecordAssistanceInput } from "./contracts.js";

const ranks: Record<AssistanceLevel, number> = {
  NONE: 0,
  PROMPT: 1,
  CONCEPTUAL_HINT: 2,
  STRATEGIC_HINT: 3,
  STRONG_SCAFFOLD: 4,
};

export class AssistancePolicyError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AssistancePolicyError";
  }
}

/** Creates the normalized evidence payload only after the server selected a permitted support level. */
export function recordAssistance(input: RecordAssistanceInput): AssistanceRecord {
  if (input.answerRevealed === true) throw new AssistancePolicyError("Practice assistance must never reveal the final answer.");
  if (!input.messageId.trim() || !input.occurredAt.trim()) throw new AssistancePolicyError("Assistance evidence requires a message ID and server timestamp.");
  return Object.freeze({ supportLevel: input.supportLevel, messageId: input.messageId, occurredAt: input.occurredAt, answerRevealed: false });
}

/** A neutral factual summary for evidence/feedback; it is not a learner penalty or score. */
export function summarizeAssistance(records: readonly AssistanceRecord[]): AssistanceSummary {
  const highestSupportLevel = records.reduce<AssistanceLevel>(
    (highest, record) => ranks[record.supportLevel] > ranks[highest] ? record.supportLevel : highest,
    "NONE",
  );
  return Object.freeze({ aiUsed: records.length > 0, interactionCount: records.length, highestSupportLevel, answerRevealed: false });
}
