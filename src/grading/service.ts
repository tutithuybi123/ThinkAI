import type { AggregateGradingInput, FinalAnswerAssessment, GradingResult, ReasoningAssessment } from "./contracts.js";

const fromDeterministic = (outcome: AggregateGradingInput["deterministic"]["outcome"]): FinalAnswerAssessment =>
  outcome === "correct" ? "correct" : outcome === "incorrect" ? "incorrect" : "unknown";

function uncertain(input: AggregateGradingInput, reason: NonNullable<GradingResult["reason"]>): GradingResult {
  return {
    outcome: "UNCERTAIN",
    finalAnswer: input.rubric?.finalAnswer ?? fromDeterministic(input.deterministic.outcome),
    reasoning: input.rubric?.reasoning ?? "uncertain",
    deterministic: input.deterministic,
    ...(input.rubric === undefined ? {} : { rubric: input.rubric }),
    ...(input.rubric?.method === undefined ? {} : { method: input.rubric.method }),
    reason,
  };
}

/**
 * Server-side policy over already-produced evidence. It never calls an evaluator
 * and fails closed rather than inventing a written-solution verdict.
 */
export function aggregateGrading(input: AggregateGradingInput): GradingResult {
  const { deterministic, rubric, rubricStatus } = input;
  if (!rubric) return uncertain(input, rubricStatus === "malformed" ? "RUBRIC_MALFORMED" : "RUBRIC_UNAVAILABLE");

  const deterministicFinal = fromDeterministic(deterministic.outcome);
  if (deterministicFinal !== "unknown" && rubric.finalAnswer !== "unknown" && deterministicFinal !== rubric.finalAnswer) {
    return uncertain(input, "DETERMINISTIC_RUBRIC_CONFLICT");
  }

  const finalAnswer = rubric.finalAnswer === "unknown" ? deterministicFinal : rubric.finalAnswer;
  const reasoning: ReasoningAssessment = rubric.reasoning;
  const outcome = rubric.outcome === "UNCERTAIN"
    ? "UNCERTAIN"
    : finalAnswer === "correct" && reasoning === "correct"
      ? "CORRECT"
      : finalAnswer === "incorrect" && reasoning === "incorrect"
        ? "INCORRECT"
        : "PARTIALLY_CORRECT";

  return {
    outcome,
    finalAnswer,
    reasoning,
    deterministic,
    rubric,
    ...(rubric.method === undefined ? {} : { method: rubric.method }),
  };
}
