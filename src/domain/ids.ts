/** Branded IDs prevent accidental cross-entity assignment in Package A. */
export type Brand<Value, Name extends string> = Value & { readonly __brand: Name };

export type ActorId = Brand<string, "ActorId">;
export type SkillId = Brand<string, "SkillId">;
export type TaskFamilyId = Brand<string, "TaskFamilyId">;
export type TaskId = Brand<string, "TaskId">;
export type TaskPairId = Brand<string, "TaskPairId">;
export type InterventionId = Brand<string, "InterventionId">;
export type ChallengeSessionId = Brand<string, "ChallengeSessionId">;
export type TransferSessionId = Brand<string, "TransferSessionId">;
export type EvidenceEventId = Brand<string, "EvidenceEventId">;
export type CapabilityReceiptId = Brand<string, "CapabilityReceiptId">;
export type SubjectId = Brand<string, "SubjectId">;
export type TopicId = Brand<string, "TopicId">;
export type MicroSkillId = Brand<string, "MicroSkillId">;
export type ContentRevisionId = Brand<string, "ContentRevisionId">;

function brandId<Name extends string>(value: string, prefix: string): Brand<string, Name> {
  if (!new RegExp(`^${prefix}[a-z0-9_-]+$`).test(value)) {
    throw new Error(`Expected ${prefix}<identifier>, received "${value}".`);
  }
  return value as Brand<string, Name>;
}

export const actorId = (value: string): ActorId => brandId<"ActorId">(value, "actor_");
export const skillId = (value: string): SkillId => brandId<"SkillId">(value, "skill_");
export const taskFamilyId = (value: string): TaskFamilyId => brandId<"TaskFamilyId">(value, "family_");
export const taskId = (value: string): TaskId => brandId<"TaskId">(value, "task_");
export const taskPairId = (value: string): TaskPairId => brandId<"TaskPairId">(value, "pair_");
export const interventionId = (value: string): InterventionId => brandId<"InterventionId">(value, "hint_");
export const challengeSessionId = (value: string): ChallengeSessionId => brandId<"ChallengeSessionId">(value, "challenge_");
export const transferSessionId = (value: string): TransferSessionId => brandId<"TransferSessionId">(value, "transfer_");
export const evidenceEventId = (value: string): EvidenceEventId => brandId<"EvidenceEventId">(value, "event_");
export const capabilityReceiptId = (value: string): CapabilityReceiptId => brandId<"CapabilityReceiptId">(value, "receipt_");
export const subjectId = (value: string): SubjectId => brandId<"SubjectId">(value, "subject_");
export const topicId = (value: string): TopicId => brandId<"TopicId">(value, "topic_");
export const microSkillId = (value: string): MicroSkillId => brandId<"MicroSkillId">(value, "micro_");
export const contentRevisionId = (value: string): ContentRevisionId => brandId<"ContentRevisionId">(value, "revision_");
