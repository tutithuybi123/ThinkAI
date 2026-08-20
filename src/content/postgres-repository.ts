import type { ContentRevisionId } from "../domain/ids.js";
import type { PostgresClient } from "../persistence/index.js";
import { immutableCopy } from "./immutable.js";
import { approveRevision, createDraftRevision, deprecateRevision, editRevision, publishRevision, submitForReview, type ContentRevision } from "./lifecycle.js";
import { assertPublishableContent } from "./publication.js";
import type { ContentAggregate } from "./v11-validator.js";

type Row = { revision_id: string; lifecycle: ContentRevision<unknown>["lifecycle"]; body: unknown; body_hash: string };
const hydrate = <T>(row: Row): ContentRevision<T> => Object.freeze({ id: row.revision_id as ContentRevisionId, lifecycle: row.lifecycle, body: immutableCopy(row.body as T), bodyHash: row.body_hash });
export class PostgresContentRevisionRepository {
  public constructor(private readonly client: PostgresClient) {}
  public async createDraft<T>(revision: ContentRevision<T>): Promise<ContentRevision<T>> { if (revision.lifecycle !== "DRAFT") throw new Error("Only drafts can be created."); await this.client.query("INSERT INTO content_revisions (revision_id,lifecycle,body,body_hash) VALUES ($1,$2,$3::jsonb,$4)", [revision.id, revision.lifecycle, JSON.stringify(revision.body), revision.bodyHash]); return revision; }
  public async getRevision<T>(id: ContentRevisionId): Promise<ContentRevision<T> | undefined> { const r = await this.client.query<Row>("SELECT revision_id,lifecycle,body,body_hash FROM content_revisions WHERE revision_id=$1", [id]); return r.rows[0] ? hydrate<T>(r.rows[0]) : undefined; }
  private async transition<T>(id: ContentRevisionId, map: (value: ContentRevision<T>) => ContentRevision<T>): Promise<ContentRevision<T>> { return this.client.transaction(async tx => { const r = await tx.query<Row>("SELECT revision_id,lifecycle,body,body_hash FROM content_revisions WHERE revision_id=$1 FOR UPDATE", [id]); if (!r.rows[0]) throw new Error("Revision unavailable."); const next = map(hydrate<T>(r.rows[0])); await tx.query("UPDATE content_revisions SET lifecycle=$2, body_hash=$3, updated_at=now() WHERE revision_id=$1", [id,next.lifecycle,next.bodyHash]); return next; }); }
  public submitForReview<T>(id: ContentRevisionId) { return this.transition<T>(id, submitForReview); }
  public approve<T>(id: ContentRevisionId) { return this.transition<T>(id, approveRevision); }
  public async publish(id: ContentRevisionId): Promise<ContentRevision<ContentAggregate>> { return this.transition<ContentAggregate>(id, value => { assertPublishableContent(value.body); return publishRevision(value); }); }
  public deprecate<T>(id: ContentRevisionId) { return this.transition<T>(id, deprecateRevision); }
  public async editDraft<T>(id: ContentRevisionId, body: T): Promise<ContentRevision<T>> { return this.client.transaction(async tx => { const r=await tx.query<Row>("SELECT revision_id,lifecycle,body,body_hash FROM content_revisions WHERE revision_id=$1 FOR UPDATE",[id]); if(!r.rows[0]) throw new Error("Revision unavailable."); const next=editRevision(hydrate<T>(r.rows[0]),body); await tx.query("UPDATE content_revisions SET body=$2::jsonb,body_hash=$3,updated_at=now() WHERE revision_id=$1",[id,JSON.stringify(next.body),next.bodyHash]); return next; }); }
}
