import type { AnswerSpec, TaskContent } from "../content/schema.js";
import { SCORING_POLICY_VERSION } from "../domain/policies.js";

export type ScoreOutcome = "correct" | "incorrect" | "invalid";
export type ScoreReasonCode = "FORMAT" | "OUT_OF_TOLERANCE" | "NOT_EQUIVALENT";

/** The answer formats accepted from the application boundary. */
export type SubmittedAnswer =
  | string
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "choice"; readonly optionId: string }
  | { readonly kind: "cannot_start" };

export interface ScoreResult {
  readonly outcome: ScoreOutcome;
  readonly scorerVersion: string;
  /** The authored normalization/answer-spec version cited by this score. */
  readonly answerSpecVersion: string;
  readonly normalizedAnswer?: string;
  readonly reasonCode?: ScoreReasonCode;
}

export type ScorableTaskSnapshot = Pick<TaskContent, "answerSpec">;

/**
 * Pure authoritative scorer. It has no network, clock, persistence, or AI dependency.
 */
export interface ScoringService {
  score(taskSnapshot: ScorableTaskSnapshot, answer: unknown): ScoreResult;
}

const normalizeText = (value: string): string => value.normalize("NFKC").trim().replace(/\s+/gu, " ");

const invalid = (answerSpecVersion: string, normalizedAnswer?: string): ScoreResult => ({
  outcome: "invalid",
  scorerVersion: SCORING_POLICY_VERSION,
  answerSpecVersion,
  ...(normalizedAnswer === undefined ? {} : { normalizedAnswer }),
  reasonCode: "FORMAT",
});

const incorrect = (
  answerSpecVersion: string,
  normalizedAnswer: string,
  reasonCode: Exclude<ScoreReasonCode, "FORMAT">,
): ScoreResult => ({
  outcome: "incorrect",
  scorerVersion: SCORING_POLICY_VERSION,
  answerSpecVersion,
  normalizedAnswer,
  reasonCode,
});

const correct = (answerSpecVersion: string, normalizedAnswer: string): ScoreResult => ({
  outcome: "correct",
  scorerVersion: SCORING_POLICY_VERSION,
  answerSpecVersion,
  normalizedAnswer,
});

function textValue(answer: unknown): string | undefined {
  if (typeof answer === "string") return answer;
  if (typeof answer !== "object" || answer === null || !("kind" in answer) || answer.kind !== "text") return undefined;
  return "value" in answer && typeof answer.value === "string" ? answer.value : undefined;
}

function choiceValue(answer: unknown): string | undefined {
  if (typeof answer !== "object" || answer === null || !("kind" in answer) || answer.kind !== "choice") return undefined;
  return "optionId" in answer && typeof answer.optionId === "string" ? answer.optionId : undefined;
}

interface Decimal {
  readonly coefficient: bigint;
  readonly scale: number;
  readonly normalized: string;
}

/** Parses finite base-10 decimal input without floating point rounding. */
function parseDecimal(value: string): Decimal | undefined {
  const input = normalizeText(value);
  const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/u.exec(input);
  if (!match) return undefined;

  const sign = match[1] === "-" ? -1n : 1n;
  const integer = match[2] ?? "0";
  const fraction = match[3] ?? match[4] ?? "";
  const unscaled = `${integer}${fraction}`.replace(/^0+(?=\d)/u, "");
  const rawCoefficient = BigInt(unscaled || "0") * sign;

  let scale = fraction.length;
  let coefficient = rawCoefficient;
  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }
  if (coefficient === 0n) return { coefficient: 0n, scale: 0, normalized: "0" };

  const negative = coefficient < 0n;
  const digits = (negative ? -coefficient : coefficient).toString();
  const absolute = scale === 0
    ? digits
    : digits.length > scale
      ? `${digits.slice(0, digits.length - scale)}.${digits.slice(digits.length - scale)}`
      : `0.${"0".repeat(scale - digits.length)}${digits}`;
  return { coefficient, scale, normalized: `${negative ? "-" : ""}${absolute}` };
}

function absoluteDifference(left: Decimal, right: Decimal): { coefficient: bigint; scale: number } {
  const scale = Math.max(left.scale, right.scale);
  const leftValue = left.coefficient * 10n ** BigInt(scale - left.scale);
  const rightValue = right.coefficient * 10n ** BigInt(scale - right.scale);
  return { coefficient: leftValue >= rightValue ? leftValue - rightValue : rightValue - leftValue, scale };
}

function isWithinTolerance(answer: Decimal, expected: Decimal, tolerance: Decimal): boolean {
  if (tolerance.coefficient < 0n) return false;
  const difference = absoluteDifference(answer, expected);
  const comparisonScale = Math.max(difference.scale, tolerance.scale);
  const scaledDifference = difference.coefficient * 10n ** BigInt(comparisonScale - difference.scale);
  const scaledTolerance = tolerance.coefficient * 10n ** BigInt(comparisonScale - tolerance.scale);
  return scaledDifference <= scaledTolerance;
}

function scoreText(spec: Extract<AnswerSpec, { kind: "exact_text" }>, answer: unknown): ScoreResult {
  const value = textValue(answer);
  if (value === undefined) return invalid(spec.normalizationVersion);
  const normalized = normalizeText(value);
  if (normalized.length === 0) return invalid(spec.normalizationVersion, normalized);
  return spec.accepted.some((accepted) => normalizeText(accepted) === normalized)
    ? correct(spec.normalizationVersion, normalized)
    : incorrect(spec.normalizationVersion, normalized, "NOT_EQUIVALENT");
}

function scoreChoice(spec: Extract<AnswerSpec, { kind: "choice" }>, answer: unknown): ScoreResult {
  const value = choiceValue(answer);
  if (value === undefined) return invalid(spec.normalizationVersion);
  const normalized = normalizeText(value);
  if (normalized.length === 0) return invalid(spec.normalizationVersion, normalized);
  return spec.acceptedOptionIds.some((optionId) => normalizeText(optionId) === normalized)
    ? correct(spec.normalizationVersion, normalized)
    : incorrect(spec.normalizationVersion, normalized, "NOT_EQUIVALENT");
}

function scoreNumeric(spec: Extract<AnswerSpec, { kind: "numeric" }>, answer: unknown): ScoreResult {
  const value = textValue(answer);
  if (value === undefined) return invalid(spec.normalizationVersion);
  const parsedAnswer = parseDecimal(value);
  if (!parsedAnswer) return invalid(spec.normalizationVersion, normalizeText(value));
  const expected = parseDecimal(spec.expected);
  const tolerance = parseDecimal(spec.tolerance ?? "0");
  if (!expected || !tolerance || tolerance.coefficient < 0n) return invalid(spec.normalizationVersion, parsedAnswer.normalized);
  return isWithinTolerance(parsedAnswer, expected, tolerance)
    ? correct(spec.normalizationVersion, parsedAnswer.normalized)
    : incorrect(spec.normalizationVersion, parsedAnswer.normalized, "OUT_OF_TOLERANCE");
}

export class DeterministicScoringService implements ScoringService {
  score(taskSnapshot: ScorableTaskSnapshot, answer: unknown): ScoreResult {
    const spec = taskSnapshot.answerSpec;
    switch (spec.kind) {
      case "exact_text": return scoreText(spec, answer);
      case "choice": return scoreChoice(spec, answer);
      case "numeric": return scoreNumeric(spec, answer);
      // A symbolic adapter must be explicitly reviewed and deterministic. None is installed for MVP.
      case "expression": return invalid(spec.normalizationVersion);
      // Written solutions are deliberately deferred to the reviewed-rubric route.
      case "written_solution": return invalid("written-solution-rubric-pending");
    }
  }
}

export const scoringService: ScoringService = new DeterministicScoringService();
