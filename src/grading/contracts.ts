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
/** Evaluator evidence only: it cannot supply a grading outcome or gate decision. */
export interface RubricFacetEvaluation {
  readonly finalAnswer: FinalAnswerAssessment;
  readonly reasoning: ReasoningAssessment;
  readonly criteria: readonly { readonly id:string; readonly status:ReasoningAssessment }[];
  readonly method?: string;
  readonly errors: readonly RubricError[];
  readonly confidence: "high" | "medium" | "low";
  readonly evaluatorVersion: string;
}
/** @deprecated Slice 4 will replace legacy aggregate consumers with facets. */
export interface RubricEvaluation extends RubricFacetEvaluation { readonly outcome: GradingOutcome; }

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
