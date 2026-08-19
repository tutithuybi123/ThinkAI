import { ASSISTANCE_LEVELS, type AssistanceLevel } from "../assistance/contracts.js";
import { GRADING_OUTCOMES, type RubricEvaluation } from "../grading/contracts.js";

export interface PracticeCompanionRequest {
  readonly practiceTaskId: string;
  readonly guidanceVersion: string;
  readonly learnerMessage: string;
  readonly allowedSupportLevels: readonly Exclude<AssistanceLevel, "NONE">[];
}

export interface PracticeCompanionResponse {
  readonly reply: string;
  readonly supportLevel: Exclude<AssistanceLevel, "NONE">;
  readonly answerRevealed: false;
}

export interface RubricEvaluatorRequest {
  readonly taskId: string;
  readonly taskVersion: string;
  readonly submittedSolution: string;
  readonly expectedResult: string;
  readonly rubricVersion: string;
}

export interface ProcessFeedbackRequest {
  readonly grading: RubricEvaluation;
  readonly assistance: { readonly interactionCount: number; readonly highestSupportLevel: AssistanceLevel };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export function isSafeCompanionResponse(value: unknown): value is PracticeCompanionResponse {
  if (!isRecord(value) || typeof value.reply !== "string" || !value.reply.trim() || value.answerRevealed !== false || typeof value.supportLevel !== "string") return false;
  return ASSISTANCE_LEVELS.includes(value.supportLevel as AssistanceLevel) && value.supportLevel !== "NONE";
}

/** Strict guard for provider output before it enters grading aggregation. */
export function isRubricEvaluation(value: unknown): value is RubricEvaluation {
  if (!isRecord(value) || typeof value.outcome !== "string" || !GRADING_OUTCOMES.includes(value.outcome as RubricEvaluation["outcome"]) || !Array.isArray(value.errors) || typeof value.evaluatorVersion !== "string" || !value.evaluatorVersion.trim()) return false;
  return (value.finalAnswer === "correct" || value.finalAnswer === "incorrect" || value.finalAnswer === "unknown")
    && (value.reasoning === "correct" || value.reasoning === "incorrect" || value.reasoning === "partial" || value.reasoning === "not_assessed" || value.reasoning === "uncertain")
    && (value.confidence === "high" || value.confidence === "medium" || value.confidence === "low")
    && value.errors.every((error) => isRecord(error) && typeof error.code === "string" && error.code.trim());
}
