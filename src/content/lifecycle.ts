import { createHash } from "node:crypto";
import type { ContentRevisionId } from "../domain/ids.js";
import { immutableCopy } from "./immutable.js";

export const CONTENT_LIFECYCLES = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "DEPRECATED"] as const;
export type ContentLifecycle = (typeof CONTENT_LIFECYCLES)[number];

export interface ContentRevision<T> {
  readonly id: ContentRevisionId;
  readonly lifecycle: ContentLifecycle;
  readonly body: Readonly<T>;
  readonly bodyHash: string;
}

const hash = (value: unknown): string => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const revision = <T>(id: ContentRevisionId, lifecycle: ContentLifecycle, body: T): ContentRevision<T> => { const owned = immutableCopy(body); return Object.freeze({ id, lifecycle, body: owned, bodyHash: hash(owned) }); };

export function createDraftRevision<T>(input: { readonly id: ContentRevisionId; readonly body: T }): ContentRevision<T> { return revision(input.id, "DRAFT", input.body); }
export function submitForReview<T>(source: ContentRevision<T>): ContentRevision<T> { if (source.lifecycle !== "DRAFT") throw new Error("Only a draft can enter review."); return revision(source.id, "IN_REVIEW", source.body); }
export function approveRevision<T>(source: ContentRevision<T>): ContentRevision<T> { if (source.lifecycle !== "IN_REVIEW") throw new Error("Only an in-review revision can be approved."); return revision(source.id, "APPROVED", source.body); }
export function publishRevision<T>(source: ContentRevision<T>): ContentRevision<T> { if (source.lifecycle !== "APPROVED") throw new Error("Only an approved revision can be published."); return revision(source.id, "PUBLISHED", source.body); }
export function deprecateRevision<T>(source: ContentRevision<T>): ContentRevision<T> { if (source.lifecycle !== "PUBLISHED") throw new Error("Only a published revision can be deprecated."); return revision(source.id, "DEPRECATED", source.body); }
export function editRevision<T>(source: ContentRevision<T>, body: T, successorId?: ContentRevisionId): ContentRevision<T> {
  if (source.lifecycle === "DRAFT") return revision(source.id, "DRAFT", body);
  if (!successorId) throw new Error("Reviewed content is immutable; create a successor draft.");
  return revision(successorId, "DRAFT", body);
}
