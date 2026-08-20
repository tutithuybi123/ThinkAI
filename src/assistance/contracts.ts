export const ASSISTANCE_LEVELS = ["NONE", "PROMPT", "CONCEPTUAL_HINT", "STRATEGIC_HINT", "STRONG_SCAFFOLD"] as const;
export type AssistanceLevel = (typeof ASSISTANCE_LEVELS)[number];

export interface AssistanceRecord {
  readonly supportLevel: Exclude<AssistanceLevel, "NONE">;
  readonly messageId: string;
  readonly occurredAt: string;
  readonly answerRevealAttempted: boolean;
  readonly answerRevealed: boolean;
  readonly responseBlocked: boolean;
}

export interface AssistanceSummary {
  readonly aiUsed: boolean;
  readonly interactionCount: number;
  readonly highestSupportLevel: AssistanceLevel;
  readonly answerRevealed: boolean;
}

export interface RecordAssistanceInput {
  readonly supportLevel: Exclude<AssistanceLevel, "NONE">;
  readonly messageId: string;
  readonly occurredAt: string;
  readonly answerRevealAttempted: boolean;
  readonly answerRevealed: boolean;
  readonly responseBlocked: boolean;
}
