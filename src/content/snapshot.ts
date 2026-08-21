import type { InterventionContent, ReviewedTaskPair, TaskContent } from "./schema.js";
import type { TaskPairId } from "../domain/ids.js";
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
}

export function createReviewedPairSnapshot(
  pair: ReviewedTaskPair,
  practiceTask: TaskContent,
  transferTask: TaskContent,
  interventions: readonly InterventionContent[],
): ReviewedPairSnapshot {
  const references = [pair, practiceTask, transferTask, ...interventions].map((item) => `${item.id}@${item.version}`);
  const written = practiceTask.answerSpec.kind === "written_solution" ? practiceTask.answerSpec : undefined;
  return Object.freeze({
    pair: Object.freeze({ id: pair.id, version: pair.version }),
    practiceTask: Object.freeze({ id: practiceTask.id, version: practiceTask.version }),
    transferTask: Object.freeze({ id: transferTask.id, version: transferTask.version }),
    interventions: Object.freeze(interventions.map((item) => Object.freeze({ id: item.id, version: item.version }))),
    integrityKey: [...references, ...(written ? [`assessment:${JSON.stringify(written.assessment)}`, `guidance:${written.assessment.aiGuidance.version}`] : [])].join("|"),
    ...(written ? { assessment: immutableCopy(written.assessment), aiGuidanceVersion: written.assessment.aiGuidance.version } : {}),
  });
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
