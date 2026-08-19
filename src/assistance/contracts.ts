export const ASSISTANCE_LEVELS = ["NONE", "PROMPT", "CONCEPTUAL_HINT", "STRATEGIC_HINT", "STRONG_SCAFFOLD"] as const;
export type AssistanceLevel = (typeof ASSISTANCE_LEVELS)[number];

export interface AssistanceRecord {
  readonly supportLevel: Exclude<AssistanceLevel, "NONE">;
  readonly messageId: string;
  readonly occurredAt: string;
  readonly answerRevealed: false;
}

export interface AssistanceSummary {
  readonly aiUsed: boolean;
  readonly interactionCount: number;
  readonly highestSupportLevel: AssistanceLevel;
  readonly answerRevealed: false;
}

export interface RecordAssistanceInput {
  readonly supportLevel: Exclude<AssistanceLevel, "NONE">;
  readonly messageId: string;
  readonly occurredAt: string;
  /** Present only at a server boundary; true is always invalid. */
  readonly answerRevealed?: boolean;
}
