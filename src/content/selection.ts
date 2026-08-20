import { createHash } from "node:crypto";
import type { ActorId, ContentRevisionId, TaskId, TaskPairId } from "../domain/ids.js";

export interface ReviewedPairChoice { readonly id: TaskPairId; readonly version: string; readonly microSkillRevisionId: ContentRevisionId; readonly practiceTask: { readonly id: TaskId; readonly version: string; readonly role: "practice" }; readonly transferTask: { readonly id: TaskId; readonly version: string; readonly role: "transfer" }; }
const ordinal = (seed: string, length: number) => Number(BigInt(`0x${createHash("sha256").update(seed).digest("hex").slice(0, 12)}`) % BigInt(length));
export function selectInitialPair(input: { readonly actorId: ActorId; readonly microSkillRevisionId: ContentRevisionId; readonly eligiblePairs: readonly ReviewedPairChoice[] }): ReviewedPairChoice { if (!input.eligiblePairs.length) throw new Error("No eligible reviewed pairs."); return input.eligiblePairs[ordinal(`${input.actorId}|${input.microSkillRevisionId}`, input.eligiblePairs.length)]!; }
export type FreshSelection = { readonly kind: "PAIR_SELECTED"; readonly pair: ReviewedPairChoice } | { readonly kind: "NO_FRESH_TRANSFER_AVAILABLE" };
export function selectFreshTransferPair(input: { readonly actorId: ActorId; readonly microSkillRevisionId: ContentRevisionId; readonly independentAttemptOrdinal: number; readonly eligiblePairs: readonly ReviewedPairChoice[]; readonly exposedPairs: readonly { readonly pairId: TaskPairId; readonly pairVersion: string }[]; readonly exposedTransferTasks: readonly { readonly taskId: TaskId; readonly version: string }[] }): FreshSelection {
  const pairs = input.eligiblePairs.filter((pair) => !input.exposedPairs.some((exposed) => exposed.pairId === pair.id && exposed.pairVersion === pair.version) && !input.exposedTransferTasks.some((exposed) => exposed.taskId === pair.transferTask.id && exposed.version === pair.transferTask.version));
  return pairs.length ? { kind: "PAIR_SELECTED", pair: pairs[ordinal(`${input.actorId}|${input.microSkillRevisionId}|${input.independentAttemptOrdinal}`, pairs.length)]! } : { kind: "NO_FRESH_TRANSFER_AVAILABLE" };
}
