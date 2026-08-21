import type { ContentRevisionId } from "../domain/ids.js";
import type { ContentAggregate } from "./v11-validator.js";
import type { ContentRevision } from "./lifecycle.js";
import { PostgresContentRevisionRepository } from "./postgres-repository.js";

/** Single service seam for future Ops and learner resolvers; it owns publish pointer updates. */
export class ContentLifecycleService {
  public constructor(private readonly repository: PostgresContentRevisionRepository) {}
  public publish(id: ContentRevisionId): Promise<ContentRevision<ContentAggregate>> { return this.repository.publish(id); }
}
