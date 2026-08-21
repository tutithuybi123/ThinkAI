import type {
  ActorId,
  ChallengeSessionId,
  EvidenceEventId,
  SkillId,
  TaskFamilyId,
  TaskId,
  TransferSessionId,
} from "../domain/ids.js";
import type { Provenance } from "../domain/policies.js";

export const EVIDENCE_EVENT_TYPES = [
  "challenge_started",
  "attempt_submitted",
  "unable_to_start_declared",
  "intervention_opened",
  "practice_assistance_recorded",
  "answer_submitted",
  "practice_scored",
  "transfer_started",
  "transfer_submitted",
  "transfer_scored",
  "connection_revealed",
  "capability_receipt_issued",
  "delayed_check_completed",
  "evidence_corrected",
] as const;

export type EvidenceEventType = (typeof EVIDENCE_EVENT_TYPES)[number];

export interface EvidenceEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: EvidenceEventId;
  type: EvidenceEventType;
  actorId: ActorId;
  correlationId: string;
  challengeSessionId?: ChallengeSessionId;
  transferSessionId?: TransferSessionId;
  skillId: SkillId;
  taskId?: TaskId;
  taskVersion?: string;
  taskFamilyId?: TaskFamilyId;
  occurredAt: string;
  schemaVersion: number;
  scorerVersion?: string;
  policyVersion?: string;
  provenance: Provenance;
  payload: TPayload;
}

export interface EvidenceEventValidationIssue {
  path: string;
  message: string;
}

export function validateEvidenceEvent(event: EvidenceEvent): readonly EvidenceEventValidationIssue[] {
  const issues: EvidenceEventValidationIssue[] = [];
  if (!event.correlationId.trim()) issues.push({ path: "correlationId", message: "is required" });
  if (!event.occurredAt || Number.isNaN(Date.parse(event.occurredAt))) {
    issues.push({ path: "occurredAt", message: "must be an ISO-parseable timestamp" });
  }
  if (event.schemaVersion < 1) issues.push({ path: "schemaVersion", message: "must be at least 1" });
  if (Object.keys(event.payload).length === 0) issues.push({ path: "payload", message: "must not be empty" });
  if (event.type === "evidence_corrected" && typeof event.payload.targetEventId !== "string") {
    issues.push({ path: "payload.targetEventId", message: "is required for a correction" });
  }
  return issues;
}
