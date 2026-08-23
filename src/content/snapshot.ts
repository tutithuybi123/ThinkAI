import { createHash } from "node:crypto";
import type { InterventionContent, ReviewedTaskPair, ReviewRecord, TaskContent } from "./schema.js";
import { taskFamilyId, type TaskPairId } from "../domain/ids.js";
import type { MicroSkillAggregate } from "./v11-validator.js";
import type { ReviewedPairChoice } from "./selection.js";
import { immutableCopy } from "./immutable.js";

export interface VersionReference {
  id: string;
  version: string;
}

export interface ReviewedPairSnapshot {
  pair: VersionReference;
  practiceTask: VersionReference;
  transferTask: VersionReference;
  interventions: readonly VersionReference[];
  integrityKey: string;
  /** v1.1 authored fields remain optional so v1.0 historical snapshots retain meaning. */
  assessment?: unknown;
  aiGuidanceVersion?: string;
  /**
   * Exact executable reviewed material.  New production sessions carry this
   * immutable copy so a later publication can never change an active session.
   * Older snapshots deliberately omit it and retain their legacy resolver path.
   */
  runtimeContent?: Readonly<{ readonly pair: ReviewedTaskPair; readonly practiceTask: TaskContent; readonly transferTask: TaskContent; readonly interventions: readonly InterventionContent[] }>;
  readonly microSkillRevisionId?: string;
}

export function createReviewedPairSnapshot(
  pair: ReviewedTaskPair,
  practiceTask: TaskContent,
  transferTask: TaskContent,
  interventions: readonly InterventionContent[],
): ReviewedPairSnapshot {
  const written = practiceTask.answerSpec.kind === "written_solution" ? practiceTask.answerSpec : undefined;
  const snapshot = {
    pair: Object.freeze({ id: pair.id, version: pair.version }),
    practiceTask: Object.freeze({ id: practiceTask.id, version: practiceTask.version }),
    transferTask: Object.freeze({ id: transferTask.id, version: transferTask.version }),
    interventions: Object.freeze(interventions.map((item) => Object.freeze({ id: item.id, version: item.version }))),
    integrityKey: `${legacyIntegrityKey(pair, practiceTask, transferTask, interventions)}|content:${contentDigest(pair, practiceTask, transferTask, interventions)}`,
    ...(written ? { assessment: immutableCopy(written.assessment), aiGuidanceVersion: written.assessment.aiGuidance.version } : {}),
  };
  return Object.freeze({ ...snapshot, runtimeContent: freezeRuntimeContent(pair, practiceTask, transferTask, interventions) });
}

/** Builds a runtime snapshot from the immutable PostgreSQL published body only. */
export function createPublishedPairSnapshot(aggregate: MicroSkillAggregate, selected: ReviewedPairChoice): ReviewedPairSnapshot {
  const authored = createAggregatePairSnapshot(aggregate, selected).pair;
  const review = publishedReview();
  const familyId = taskFamilyId(`family_${authored.id}`);
  const practiceTask: TaskContent = Object.freeze({
    id: authored.practiceContent.id as TaskContent["id"], version: authored.practiceContent.version, familyId,
    skillId: aggregate.microSkill.evidenceSkillId, role: "practice", prompt: immutableCopy(authored.practiceContent.prompt), assetRefs: Object.freeze([]), answerSpec: immutableCopy(authored.practiceContent.answerSpec), review,
  });
  const transferTask: TaskContent = Object.freeze({
    id: authored.transferContent.id as TaskContent["id"], version: authored.transferContent.version, familyId,
    skillId: aggregate.microSkill.evidenceSkillId, role: "transfer", prompt: immutableCopy(authored.transferContent.prompt), assetRefs: Object.freeze([]), answerSpec: immutableCopy(authored.transferContent.answerSpec), review,
  });
  const pair: ReviewedTaskPair = Object.freeze({
    id: authored.id as TaskPairId, version: authored.version, skillId: aggregate.microSkill.evidenceSkillId,
    practiceTaskId: practiceTask.id, transferTaskId: transferTask.id, targetRelation: authored.connectionReveal.sharedRelation,
    changeDimensions: Object.freeze([]),
    relationMapping: Object.freeze({ title: authored.connectionReveal.title, sharedRelation: authored.connectionReveal.sharedRelation, explanation: immutableCopy(authored.connectionReveal.explanation), practiceHighlights: Object.freeze([]), transferHighlights: Object.freeze([]) }), review,
  });
  const base = createReviewedPairSnapshot(pair, practiceTask, transferTask, []);
  return Object.freeze({ ...base, integrityKey: `${base.integrityKey}|revision:${aggregate.microSkill.revisionId}`, microSkillRevisionId: aggregate.microSkill.revisionId, runtimeContent: freezeRuntimeContent(pair, practiceTask, transferTask, []) });
}

/** Resolves only material stored in the evidence snapshot; it never consults a latest revision. */
export function runtimeContentFromSnapshot(snapshot: ReviewedPairSnapshot): Readonly<{ readonly pair: ReviewedTaskPair; readonly practiceTask: TaskContent; readonly transferTask: TaskContent; readonly interventions: readonly InterventionContent[] }> {
  if (!snapshot.runtimeContent) throw new Error("Persisted snapshot has no executable reviewed content.");
  const value = snapshot.runtimeContent;
  const current = createReviewedPairSnapshot(value.pair, value.practiceTask, value.transferTask, value.interventions);
  const revisionBound = snapshot.microSkillRevisionId ? `${current.integrityKey}|revision:${snapshot.microSkillRevisionId}` : current.integrityKey;
  if (current.integrityKey !== snapshot.integrityKey && revisionBound !== snapshot.integrityKey && (!isLegacyIntegrityKey(snapshot.integrityKey) || legacyIntegrityKey(value.pair, value.practiceTask, value.transferTask, value.interventions) !== snapshot.integrityKey)) throw new Error(`Content snapshot integrity mismatch for ${snapshot.pair.id}.`);
  return value;
}

/** Prior snapshots predate the executable-content digest. Keep their exact historical binding readable. */
function legacyIntegrityKey(pair: ReviewedTaskPair, practiceTask: TaskContent, transferTask: TaskContent, interventions: readonly InterventionContent[]): string {
  const references = [pair, practiceTask, transferTask, ...interventions].map((item) => `${item.id}@${item.version}`);
  const written = practiceTask.answerSpec.kind === "written_solution" ? practiceTask.answerSpec : undefined;
  return [...references, ...(written ? [`assessment:${JSON.stringify(written.assessment)}`, `guidance:${written.assessment.aiGuidance.version}`] : [])].join("|");
}

function contentDigest(pair: ReviewedTaskPair, practiceTask: TaskContent, transferTask: TaskContent, interventions: readonly InterventionContent[]): string {
  return createHash("sha256").update(canonicalJson({ pair, practiceTask, transferTask, interventions }), "utf8").digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function isLegacyIntegrityKey(key: string): boolean { return !key.includes("|content:"); }

function publishedReview(): ReviewRecord {
  return Object.freeze({ status: "approved", reviewerId: "postgres-published", reviewedAt: "1970-01-01T00:00:00.000Z", validationVersion: "content-revision/v1", sourceProvenance: "postgres-published-revision" });
}

function freezeRuntimeContent(pair: ReviewedTaskPair, practiceTask: TaskContent, transferTask: TaskContent, interventions: readonly InterventionContent[]) {
  return Object.freeze({ pair: immutableCopy(pair), practiceTask: immutableCopy(practiceTask), transferTask: immutableCopy(transferTask), interventions: Object.freeze(interventions.map(immutableCopy)) });
}

export interface SnapshotSource {
  getReviewedPair(id: TaskPairId): ReviewedTaskPair;
  getTask(id: string): TaskContent;
  getInterventionsForPracticeTask(id: string): readonly InterventionContent[];
}

export function assertSnapshotIntegrity(snapshot: ReviewedPairSnapshot, source: SnapshotSource): void {
  const pair = source.getReviewedPair(snapshot.pair.id as TaskPairId);
  const practice = source.getTask(snapshot.practiceTask.id);
  const transfer = source.getTask(snapshot.transferTask.id);
  const hints = source.getInterventionsForPracticeTask(snapshot.practiceTask.id);
  const current = createReviewedPairSnapshot(pair, practice, transfer, hints);
  if (current.integrityKey !== snapshot.integrityKey) {
    throw new Error(`Content snapshot integrity mismatch for ${snapshot.pair.id}.`);
  }
}

export interface AggregatePairSnapshot { readonly microSkillRevisionId: string; readonly pair: Readonly<MicroSkillAggregate["pairs"][number]>; readonly subjectId: string; readonly topicId: string; readonly microSkillId: string; readonly authoredAggregate: Readonly<MicroSkillAggregate>; }
/** Selection is supplied by the server; this only freezes that exact selected authored pair. */
export function createAggregatePairSnapshot(aggregate: MicroSkillAggregate, selected: ReviewedPairChoice): AggregatePairSnapshot {
  if (!aggregate.pairs.some((pair) => pair.id === selected.id && pair.version === selected.version)) throw new Error("Selected pair is not in the authored micro-skill bank.");
  const canonical = aggregate.pairs.find((pair) => pair.id === selected.id && pair.version === selected.version)!;
  return Object.freeze({ microSkillRevisionId: aggregate.microSkill.revisionId, pair: immutableCopy(canonical), subjectId: aggregate.subject.id, topicId: aggregate.topic.id, microSkillId: aggregate.microSkill.id, authoredAggregate: immutableCopy(aggregate) });
}
