import type { ScoreResult } from "../scoring/service.js";

export const GRADING_OUTCOMES = ["CORRECT", "PARTIALLY_CORRECT", "INCORRECT", "UNCERTAIN"] as const;
export type GradingOutcome = (typeof GRADING_OUTCOMES)[number];
export type FinalAnswerAssessment = "correct" | "incorrect" | "unknown";
export type ReasoningAssessment = "correct" | "incorrect" | "partial" | "not_assessed" | "uncertain";

export interface RubricError {
  readonly code: string;
  readonly location?: string;
}

/** Schema-validated evaluator evidence; never a policy decision. */
export interface RubricEvaluation {
  readonly outcome: GradingOutcome;
  readonly finalAnswer: FinalAnswerAssessment;
  readonly reasoning: ReasoningAssessment;
  readonly method?: string;
  readonly errors: readonly RubricError[];
  readonly confidence: "high" | "medium" | "low";
  readonly evaluatorVersion: string;
}

export type RubricStatus = "unavailable" | "malformed";

export interface AggregateGradingInput {
  readonly deterministic: ScoreResult;
  readonly rubric?: RubricEvaluation;
  readonly rubricStatus?: RubricStatus;
}

export type GradingReason = "RUBRIC_UNAVAILABLE" | "RUBRIC_MALFORMED" | "DETERMINISTIC_RUBRIC_CONFLICT";

export interface GradingResult {
  readonly outcome: GradingOutcome;
  readonly finalAnswer: FinalAnswerAssessment;
  readonly reasoning: ReasoningAssessment;
  readonly deterministic: ScoreResult;
  readonly rubric?: RubricEvaluation;
  readonly method?: string;
  readonly reason?: GradingReason;
}
