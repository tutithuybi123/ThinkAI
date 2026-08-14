import type { InterventionContent, ReviewedTaskPair, TaskContent } from "./schema.js";
import type { TaskPairId } from "../domain/ids.js";

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
}

export function createReviewedPairSnapshot(
  pair: ReviewedTaskPair,
  practiceTask: TaskContent,
  transferTask: TaskContent,
  interventions: readonly InterventionContent[],
): ReviewedPairSnapshot {
  const references = [pair, practiceTask, transferTask, ...interventions].map((item) => `${item.id}@${item.version}`);
  return Object.freeze({
    pair: Object.freeze({ id: pair.id, version: pair.version }),
    practiceTask: Object.freeze({ id: practiceTask.id, version: practiceTask.version }),
    transferTask: Object.freeze({ id: transferTask.id, version: transferTask.version }),
    interventions: Object.freeze(interventions.map((item) => Object.freeze({ id: item.id, version: item.version }))),
    integrityKey: references.join("|"),
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
