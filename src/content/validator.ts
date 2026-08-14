import { CONTENT_CONTRACT_VERSION } from "../domain/policies.js";
import { CHANGE_DIMENSIONS, EXPOSURE_TAGS, REVIEW_STATUSES, type ContentBundle } from "./schema.js";

export interface ContentValidationIssue {
  path: string;
  code:
    | "INVALID_CONTRACT_VERSION"
    | "DUPLICATE_ID"
    | "MISSING_REFERENCE"
    | "INVALID_REVIEW"
    | "INVALID_PAIR"
    | "INVALID_INTERVENTION"
    | "INVALID_ANSWER_SPEC";
  message: string;
}

export interface ContentValidationResult {
  valid: boolean;
  issues: readonly ContentValidationIssue[];
}

const isNonEmpty = (value: string): boolean => value.trim().length > 0;
const hasDuplicates = <T>(values: readonly T[]): boolean => new Set(values).size !== values.length;

function validateReview(
  review: { status: string; reviewerId: string; reviewedAt: string; validationVersion: string; sourceProvenance: string },
  path: string,
  issues: ContentValidationIssue[],
): void {
  if (!REVIEW_STATUSES.includes(review.status as (typeof REVIEW_STATUSES)[number]) || review.status !== "approved") {
    issues.push({ path: `${path}.status`, code: "INVALID_REVIEW", message: "must be approved for active content" });
  }
  if (!isNonEmpty(review.reviewerId) || !isNonEmpty(review.validationVersion) || !isNonEmpty(review.sourceProvenance)) {
    issues.push({ path, code: "INVALID_REVIEW", message: "reviewerId, validationVersion and sourceProvenance are required" });
  }
  if (Number.isNaN(Date.parse(review.reviewedAt))) {
    issues.push({ path: `${path}.reviewedAt`, code: "INVALID_REVIEW", message: "must be an ISO-parseable timestamp" });
  }
}

function validateAnswerSpec(
  answerSpec: ContentBundle["tasks"][number]["answerSpec"],
  path: string,
  issues: ContentValidationIssue[],
): void {
  if (!isNonEmpty(answerSpec.normalizationVersion)) {
    issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "normalizationVersion is required" });
  }
  switch (answerSpec.kind) {
    case "exact_text":
      if (answerSpec.accepted.length === 0 || answerSpec.accepted.some((value) => !isNonEmpty(value))) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "accepted exact values are required" });
      }
      break;
    case "numeric":
    case "expression":
      if (!isNonEmpty(answerSpec.expected)) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "expected answer is required" });
      }
      break;
    case "choice":
      if (answerSpec.acceptedOptionIds.length === 0 || hasDuplicates(answerSpec.acceptedOptionIds)) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "one or more unique accepted option IDs are required" });
      }
      break;
  }
}

/**
 * Validates data shape and traceability, not whether a mathematical pair truly transfers.
 * That semantic decision remains a teacher-review responsibility captured in ReviewRecord.
 */
export function validateContentBundle(bundle: ContentBundle): ContentValidationResult {
  const issues: ContentValidationIssue[] = [];
  if (bundle.contractVersion !== CONTENT_CONTRACT_VERSION) {
    issues.push({ path: "contractVersion", code: "INVALID_CONTRACT_VERSION", message: `expected ${CONTENT_CONTRACT_VERSION}` });
  }

  const allIds = [
    ...bundle.skills.map((item) => item.id),
    ...bundle.taskFamilies.map((item) => item.id),
    ...bundle.tasks.map((item) => item.id),
    ...bundle.taskPairs.map((item) => item.id),
    ...bundle.interventions.map((item) => item.id),
  ];
  if (hasDuplicates(allIds)) issues.push({ path: "*", code: "DUPLICATE_ID", message: "all content IDs must be unique" });

  const skills = new Map(bundle.skills.map((item) => [item.id, item]));
  const families = new Map(bundle.taskFamilies.map((item) => [item.id, item]));
  const tasks = new Map(bundle.tasks.map((item) => [item.id, item]));

  bundle.skills.forEach((item, index) => validateReview(item.review, `skills[${index}].review`, issues));
  bundle.taskFamilies.forEach((item, index) => {
    validateReview(item.review, `taskFamilies[${index}].review`, issues);
    if (!skills.has(item.skillId)) issues.push({ path: `taskFamilies[${index}].skillId`, code: "MISSING_REFERENCE", message: "skill does not exist" });
  });
  bundle.tasks.forEach((item, index) => {
    validateReview(item.review, `tasks[${index}].review`, issues);
    validateAnswerSpec(item.answerSpec, `tasks[${index}].answerSpec`, issues);
    const family = families.get(item.familyId);
    if (!family) issues.push({ path: `tasks[${index}].familyId`, code: "MISSING_REFERENCE", message: "task family does not exist" });
    else if (family.skillId !== item.skillId) issues.push({ path: `tasks[${index}].skillId`, code: "MISSING_REFERENCE", message: "must match task family skill" });
  });
  bundle.taskPairs.forEach((pair, index) => {
    validateReview(pair.review, `taskPairs[${index}].review`, issues);
    const practice = tasks.get(pair.practiceTaskId);
    const transfer = tasks.get(pair.transferTaskId);
    const skill = skills.get(pair.skillId);
    if (!skill) issues.push({ path: `taskPairs[${index}].skillId`, code: "MISSING_REFERENCE", message: "skill does not exist" });
    if (!practice || !transfer) issues.push({ path: `taskPairs[${index}]`, code: "MISSING_REFERENCE", message: "both task references must exist" });
    if (practice && (practice.role !== "practice" || practice.skillId !== pair.skillId)) {
      issues.push({ path: `taskPairs[${index}].practiceTaskId`, code: "INVALID_PAIR", message: "must reference a practice task for the same skill" });
    }
    if (transfer && (transfer.role !== "transfer" || transfer.skillId !== pair.skillId)) {
      issues.push({ path: `taskPairs[${index}].transferTaskId`, code: "INVALID_PAIR", message: "must reference a transfer task for the same skill" });
    }
    if (pair.practiceTaskId === pair.transferTaskId || pair.changeDimensions.length === 0 || hasDuplicates(pair.changeDimensions)) {
      issues.push({ path: `taskPairs[${index}]`, code: "INVALID_PAIR", message: "tasks must differ and changeDimensions must be non-empty and unique" });
    }
    if (pair.changeDimensions.some((dimension) => !CHANGE_DIMENSIONS.includes(dimension))) {
      issues.push({ path: `taskPairs[${index}].changeDimensions`, code: "INVALID_PAIR", message: "contains an unsupported change dimension" });
    }
    if (!skill || pair.targetRelation !== skill.targetRelation || !isNonEmpty(pair.relationMapping.sharedRelation)) {
      issues.push({ path: `taskPairs[${index}]`, code: "INVALID_PAIR", message: "target relation and relation mapping must match the selected skill" });
    }
  });
  bundle.interventions.forEach((hint, index) => {
    validateReview(hint.review, `interventions[${index}].review`, issues);
    const task = tasks.get(hint.taskId);
    if (!task || task.role !== "practice") {
      issues.push({ path: `interventions[${index}].taskId`, code: "INVALID_INTERVENTION", message: "must reference a practice task" });
    }
    if (hint.exposureTags.length === 0 || hasDuplicates(hint.exposureTags) || hint.exposureTags.some((tag) => !EXPOSURE_TAGS.includes(tag))) {
      issues.push({ path: `interventions[${index}].exposureTags`, code: "INVALID_INTERVENTION", message: "must contain supported unique exposure tags" });
    }
  });

  for (const pair of bundle.taskPairs) {
    const activeHints = bundle.interventions.filter((hint) => hint.taskId === pair.practiceTaskId && hint.review.status === "approved");
    if (activeHints.length !== 3) {
      issues.push({ path: `taskPairs.${pair.id}`, code: "INVALID_INTERVENTION", message: "an active practice task requires exactly three reviewed interventions" });
    }
  }
  return { valid: issues.length === 0, issues };
}
