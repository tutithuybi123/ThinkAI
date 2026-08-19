import type { TaskPairId, TaskId } from "../domain/ids.js";
import type { ContentBundle, InterventionContent, ReviewedTaskPair, TaskContent } from "./schema.js";
import { loadReviewedContentBundle, type ContentLoadOptions } from "./loader.js";
import { assertSnapshotIntegrity, createReviewedPairSnapshot, type ReviewedPairSnapshot, type SnapshotSource } from "./snapshot.js";

/** In-memory reviewed-content repository only. Persistence is deliberately Package C work. */
export class ReviewedContentRepository implements SnapshotSource {
  private readonly pairs: ReadonlyMap<TaskPairId, ReviewedTaskPair>;
  private readonly tasks: ReadonlyMap<TaskId, TaskContent>;
  private readonly interventionsByTask: ReadonlyMap<TaskId, readonly InterventionContent[]>;

  public constructor(private readonly bundle: Readonly<ContentBundle>) {
    this.pairs = new Map(bundle.taskPairs.map((pair) => [pair.id, pair]));
    this.tasks = new Map(bundle.tasks.map((task) => [task.id, task]));
    this.interventionsByTask = new Map(bundle.tasks.map((task) => [task.id, Object.freeze(bundle.interventions.filter((hint) => hint.taskId === task.id))]));
  }

  public static fromRaw(raw: unknown, options: ContentLoadOptions = {}): ReviewedContentRepository {
    return new ReviewedContentRepository(loadReviewedContentBundle(raw, options));
  }

  public getReviewedPair(id: TaskPairId): ReviewedTaskPair {
    const pair = this.pairs.get(id);
    if (!pair) throw new Error(`Reviewed pair ${id} is unavailable.`);
    return pair;
  }

  /** Selection policy is server-owned. MVP exposes the sole approved pair only. */
  public selectApprovedPair(): ReviewedTaskPair {
    const approved = [...this.pairs.values()].filter((pair) => {
      const practice = this.tasks.get(pair.practiceTaskId);
      const transfer = this.tasks.get(pair.transferTaskId);
      return pair.review.status === "approved" && practice?.review.status === "approved" && transfer?.review.status === "approved";
    });
    if (approved.length !== 1) throw new Error("Exactly one approved MVP task pair must be available for server selection.");
    return approved[0]!;
  }

  public getTask(id: string): TaskContent {
    const task = this.tasks.get(id as TaskId);
    if (!task) throw new Error(`Task ${id} is unavailable.`);
    return task;
  }

  public getInterventionsForPracticeTask(id: string): readonly InterventionContent[] {
    const interventions = this.interventionsByTask.get(id as TaskId);
    if (!interventions) throw new Error(`Task ${id} is unavailable.`);
    return interventions;
  }

  public createPairSnapshot(pairId: TaskPairId): ReviewedPairSnapshot {
    const pair = this.getReviewedPair(pairId);
    const practice = this.getTask(pair.practiceTaskId);
    const transfer = this.getTask(pair.transferTaskId);
    return createReviewedPairSnapshot(pair, practice, transfer, this.getInterventionsForPracticeTask(practice.id));
  }

  public assertSnapshotIntegrity(snapshot: ReviewedPairSnapshot): void {
    assertSnapshotIntegrity(snapshot, this);
  }
}
