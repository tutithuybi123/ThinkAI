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

const isNonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const hasDuplicates = <T>(values: readonly T[]): boolean => new Set(values).size !== values.length;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

function validateReview(
  review: unknown,
  path: string,
  issues: ContentValidationIssue[],
): void {
  if (!isRecord(review)) {
    issues.push({ path, code: "INVALID_REVIEW", message: "review record is required" });
    return;
  }
  const status = review.status;
  const reviewerId = review.reviewerId;
  const validationVersion = review.validationVersion;
  const sourceProvenance = review.sourceProvenance;
  const reviewedAt = review.reviewedAt;
  if (typeof status !== "string" || !REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number]) || status !== "approved") {
    issues.push({ path: `${path}.status`, code: "INVALID_REVIEW", message: "must be approved for active content" });
  }
  if (!isNonEmpty(reviewerId) || !isNonEmpty(validationVersion) || !isNonEmpty(sourceProvenance)) {
    issues.push({ path, code: "INVALID_REVIEW", message: "reviewerId, validationVersion and sourceProvenance are required" });
  }
  if (!isNonEmpty(reviewedAt) || Number.isNaN(Date.parse(reviewedAt))) {
    issues.push({ path: `${path}.reviewedAt`, code: "INVALID_REVIEW", message: "must be an ISO-parseable timestamp" });
  }
}

function validateAnswerSpec(
  answerSpec: unknown,
  path: string,
  issues: ContentValidationIssue[],
): void {
  if (!isRecord(answerSpec) || !isNonEmpty(answerSpec.kind) || !isNonEmpty(answerSpec.normalizationVersion)) {
    issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "kind and normalizationVersion are required" });
    return;
  }
  switch (answerSpec.kind) {
    case "exact_text":
      if (!Array.isArray(answerSpec.accepted) || answerSpec.accepted.length === 0 || answerSpec.accepted.some((value) => !isNonEmpty(value))) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "accepted exact values are required" });
      }
      break;
    case "numeric":
      if (!isNonEmpty(answerSpec.expected)) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "expected answer is required" });
      }
      break;
    case "expression":
      issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "expression scoring is not enabled for authoritative MVP content" });
      break;
    case "choice":
      if (!Array.isArray(answerSpec.acceptedOptionIds) || answerSpec.acceptedOptionIds.length === 0 || hasDuplicates(answerSpec.acceptedOptionIds)) {
        issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "one or more unique accepted option IDs are required" });
      }
      break;
    default:
      issues.push({ path, code: "INVALID_ANSWER_SPEC", message: "uses an unsupported answer specification kind" });
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
  bundle.skills.forEach((item, index) => {
    if (!isNonEmpty(item.version) || !isNonEmpty(item.title) || !isNonEmpty(item.targetRelation)) {
      issues.push({ path: `skills[${index}]`, code: "INVALID_REVIEW", message: "version, title and targetRelation are required" });
    }
  });
  bundle.taskFamilies.forEach((item, index) => {
    validateReview(item.review, `taskFamilies[${index}].review`, issues);
    if (!isNonEmpty(item.version) || !isNonEmpty(item.representation)) {
      issues.push({ path: `taskFamilies[${index}]`, code: "INVALID_REVIEW", message: "version and representation are required" });
    }
    if (!skills.has(item.skillId)) issues.push({ path: `taskFamilies[${index}].skillId`, code: "MISSING_REFERENCE", message: "skill does not exist" });
  });
  bundle.tasks.forEach((item, index) => {
    validateReview(item.review, `tasks[${index}].review`, issues);
    validateAnswerSpec(item.answerSpec, `tasks[${index}].answerSpec`, issues);
    if (!isNonEmpty(item.version) || !isNonEmpty(item.prompt?.body) || !["plain_text", "markdown"].includes(item.prompt?.format)) {
      issues.push({ path: `tasks[${index}]`, code: "INVALID_ANSWER_SPEC", message: "version and supported non-empty prompt are required" });
    }
    const family = families.get(item.familyId);
    if (!family) issues.push({ path: `tasks[${index}].familyId`, code: "MISSING_REFERENCE", message: "task family does not exist" });
    else if (family.skillId !== item.skillId) issues.push({ path: `tasks[${index}].skillId`, code: "MISSING_REFERENCE", message: "must match task family skill" });
  });
  bundle.taskPairs.forEach((pair, index) => {
    validateReview(pair.review, `taskPairs[${index}].review`, issues);
    if (!isNonEmpty(pair.version) || !isNonEmpty(pair.targetRelation) || !isNonEmpty(pair.relationMapping?.sharedRelation) || !isNonEmpty(pair.relationMapping?.explanation?.body)) {
      issues.push({ path: `taskPairs[${index}]`, code: "INVALID_PAIR", message: "version, target relation and reveal mapping are required" });
    }
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
    if (practice && transfer && practice.familyId === transfer.familyId) {
      issues.push({ path: `taskPairs[${index}]`, code: "INVALID_PAIR", message: "practice and transfer tasks must come from distinct task families" });
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
    if (!isNonEmpty(hint.version) || !isNonEmpty(hint.title) || !isNonEmpty(hint.body?.body)) {
      issues.push({ path: `interventions[${index}]`, code: "INVALID_INTERVENTION", message: "version, title and body are required" });
    }
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
