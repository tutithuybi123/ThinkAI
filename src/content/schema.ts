import type {
  InterventionId,
  SkillId,
  TaskFamilyId,
  TaskId,
  TaskPairId,
} from "../domain/ids.js";

export const REVIEW_STATUSES = ["draft", "approved", "withdrawn"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CHANGE_DIMENSIONS = ["representation", "context", "givens", "route"] as const;
export type ChangeDimension = (typeof CHANGE_DIMENSIONS)[number];

export const EXPOSURE_TAGS = ["process", "concept", "strategy", "solution_step", "answer"] as const;
export type ExposureTag = (typeof EXPOSURE_TAGS)[number];

export interface RichContent {
  format: "plain_text" | "markdown";
  body: string;
}

export interface ReviewRecord {
  status: ReviewStatus;
  reviewerId: string;
  reviewedAt: string;
  validationVersion: string;
  sourceProvenance: string;
  notes?: string;
}

export interface SkillContent {
  id: SkillId;
  version: string;
  title: string;
  targetRelation: string;
  review: ReviewRecord;
}

export interface TaskFamilyContent {
  id: TaskFamilyId;
  version: string;
  skillId: SkillId;
  representation: string;
  review: ReviewRecord;
}

export type AnswerSpec =
  | { kind: "exact_text"; accepted: readonly string[]; normalizationVersion: string }
  | { kind: "numeric"; expected: string; tolerance?: string; normalizationVersion: string }
  | { kind: "expression"; expected: string; equivalencePolicy: "symbolic"; normalizationVersion: string }
  | { kind: "choice"; acceptedOptionIds: readonly string[]; normalizationVersion: string };

export interface TaskContent {
  id: TaskId;
  version: string;
  familyId: TaskFamilyId;
  skillId: SkillId;
  role: "practice" | "transfer";
  prompt: RichContent;
  assetRefs: readonly string[];
  answerSpec: AnswerSpec;
  rubricRef?: string;
  review: ReviewRecord;
}

export interface ConnectionRevealSpec {
  title: string;
  sharedRelation: string;
  explanation: RichContent;
  practiceHighlights: readonly string[];
  transferHighlights: readonly string[];
}

export interface ReviewedTaskPair {
  id: TaskPairId;
  version: string;
  skillId: SkillId;
  practiceTaskId: TaskId;
  transferTaskId: TaskId;
  targetRelation: string;
  changeDimensions: readonly ChangeDimension[];
  relationMapping: ConnectionRevealSpec;
  review: ReviewRecord;
}

export interface InterventionContent {
  id: InterventionId;
  version: string;
  taskId: TaskId;
  title: string;
  body: RichContent;
  exposureTags: readonly ExposureTag[];
  review: ReviewRecord;
}

/** Structural only: a bundle does not itself prove educational validity. */
export interface ContentBundle {
  contractVersion: string;
  fixtureProvenance: "structural_test_only" | "teacher_reviewed";
  skills: readonly SkillContent[];
  taskFamilies: readonly TaskFamilyContent[];
  tasks: readonly TaskContent[];
  taskPairs: readonly ReviewedTaskPair[];
  interventions: readonly InterventionContent[];
}
