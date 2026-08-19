import { createHash } from "node:crypto";
import type { ReviewedPairSnapshot } from "../content/snapshot.js";
import { capabilityReceiptId, evidenceEventId, type ActorId, type ChallengeSessionId, type EvidenceEventId, type SkillId, type TransferSessionId } from "../domain/ids.js";
import { EVIDENCE_EVENT_SCHEMA_VERSION, RECEIPT_POLICY_VERSION, type Provenance } from "../domain/policies.js";
import type { EvidenceEvent } from "../evidence/schema.js";
import type { AppendEvidenceCommand, SessionSnapshot, StoredEvidenceEvent } from "../persistence/index.js";

export interface ReceiptPersistence {
  list(actor?: ActorId): Promise<readonly StoredEvidenceEvent[]>;
  appendCommand(command: AppendEvidenceCommand): Promise<unknown>;
  find(sessionId: string): Promise<SessionSnapshot | undefined>;
  findContent(key: string): Promise<ReviewedPairSnapshot | undefined>;
}
export interface CapabilityReceipt { readonly id:string; readonly actorId:ActorId; readonly skillId:SkillId; readonly claim:string; readonly observedConditions:readonly string[]; readonly unknownConditions:readonly string[]; readonly issuedAt:string; readonly provenance:Provenance; readonly sourceEventIds:readonly EvidenceEventId[]; readonly policyVersion:string; }
export class ReceiptError extends Error { constructor(public readonly code:"NOT_ELIGIBLE"|"ACTOR_MISMATCH", message:string) { super(message); this.name="ReceiptError"; } }
const digest = (value:string) => createHash("sha256").update(value).digest("hex");

function receiptFromEvent(event: EvidenceEvent): CapabilityReceipt | undefined {
  if (event.type !== "capability_receipt_issued" || !Array.isArray(event.payload.sourceEventIds) || typeof event.payload.receiptId !== "string") return undefined;
  return { id:event.payload.receiptId, actorId:event.actorId, skillId:event.skillId, claim:String(event.payload.claim), observedConditions:Object.freeze((event.payload.observedConditions as unknown[]).map(String)), unknownConditions:Object.freeze((event.payload.unknownConditions as unknown[]).map(String)), issuedAt:event.occurredAt, provenance:event.provenance, sourceEventIds:Object.freeze((event.payload.sourceEventIds as unknown[]).map((x) => String(x) as EvidenceEventId)), policyVersion:event.policyVersion ?? RECEIPT_POLICY_VERSION };
}
function stringState(state: Record<string, unknown> | undefined, field: string): string | undefined {
  const value = state?.[field];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * A receipt is intentionally stricter than a generic “two correct answers” query.
 * It binds the facts to the exact immutable pair snapshot and both persisted session
 * snapshots.  This keeps malformed or cross-pair same-skill events from becoming a
 * capability claim.
 */
function matchesQualifyingChain(
  snapshot: ReviewedPairSnapshot,
  practiceState: Record<string, unknown>,
  transferState: Record<string, unknown>,
  practice: EvidenceEvent,
  transfer: EvidenceEvent,
): boolean {
  return stringState(practiceState, "pairId") === snapshot.pair.id
    && stringState(practiceState, "pairVersion") === snapshot.pair.version
    && stringState(transferState, "pairId") === snapshot.pair.id
    && stringState(transferState, "pairVersion") === snapshot.pair.version
    && stringState(practiceState, "practiceTaskId") === snapshot.practiceTask.id
    && stringState(practiceState, "practiceTaskVersion") === snapshot.practiceTask.version
    && stringState(transferState, "taskId") === snapshot.transferTask.id
    && stringState(transferState, "taskVersion") === snapshot.transferTask.version
    && stringState(practiceState, "skillId") === stringState(transferState, "skillId")
    && stringState(practiceState, "taskFamilyId") === practice.taskFamilyId
    && stringState(transferState, "familyId") === transfer.taskFamilyId
    && practice.skillId === stringState(practiceState, "skillId")
    && practice.taskId === snapshot.practiceTask.id
    && practice.taskVersion === snapshot.practiceTask.version
    && transfer.skillId === stringState(transferState, "skillId")
    && transfer.taskId === snapshot.transferTask.id
    && transfer.taskVersion === snapshot.transferTask.version
    && transfer.taskFamilyId === stringState(transferState, "familyId");
}
export class CapabilityReceiptService {
  constructor(private readonly persistence: ReceiptPersistence, private readonly now = () => new Date()) {}
  public async get(input: { id: string; actorId: ActorId }): Promise<CapabilityReceipt> {
    const receipt = (await this.persistence.list(input.actorId))
      .map((item) => receiptFromEvent(item.event))
      .find((candidate): candidate is CapabilityReceipt => !!candidate && candidate.id === input.id);
    if (!receipt) throw Object.assign(new Error("Capability receipt was not found."), { code: "RECEIPT_NOT_FOUND" });
    return receipt;
  }
  public async issue(input:{actorId:ActorId;practiceSessionId:ChallengeSessionId;transferSessionId:TransferSessionId;idempotencyKey:string;actorSessionId?:string}):Promise<{replayed:boolean;receipt:CapabilityReceipt}> {
    const events = await this.persistence.list(input.actorId);
    const practice = events.findLast((item) => item.event.type === "practice_scored" && item.event.challengeSessionId === input.practiceSessionId && item.event.payload.outcome === "correct")?.event;
    const transfer = events.findLast((item) => item.event.type === "transfer_scored" && item.event.transferSessionId === input.transferSessionId && item.event.payload.outcome === "correct")?.event;
    const practiceSession = await this.persistence.find(input.practiceSessionId);
    const transferSession = await this.persistence.find(input.transferSessionId);
    const ps = practiceSession?.state as Record<string,unknown> | undefined; const ts = transferSession?.state as Record<string,unknown> | undefined;
    const snapshot = typeof ts?.snapshotKey === "string" ? await this.persistence.findContent(ts.snapshotKey) : undefined;
    if (!practice || !transfer || practiceSession?.kind !== "challenge" || transferSession?.kind !== "transfer" || ps?.actorId !== input.actorId || ts?.actorId !== input.actorId || ts?.practiceSessionId !== input.practiceSessionId || !snapshot || !matchesQualifyingChain(snapshot, ps, ts, practice, transfer)) {
      throw new ReceiptError("NOT_ELIGIBLE", "Authoritative evidence does not match one linked reviewed task pair.");
    }
    const prior = events.map((item) => receiptFromEvent(item.event)).find((receipt): receipt is CapabilityReceipt => !!receipt && receipt.sourceEventIds.includes(transfer.id));
    if (prior) return { replayed:true, receipt:prior };
    const issuedAt = this.now().toISOString(); const id = capabilityReceiptId(`receipt_${digest(`${transfer.id}|${RECEIPT_POLICY_VERSION}`).slice(0,24)}`);
    const receipt:CapabilityReceipt = { id, actorId:input.actorId, skillId:transfer.skillId, claim:"Demonstrated this skill independently in a changed situation.", observedConditions:Object.freeze(["Solved the linked practice task.","Solved an unseen changed-situation task independently."]), unknownConditions:Object.freeze(["Long-term retrieval has not been checked yet."]), issuedAt, provenance:transfer.provenance, sourceEventIds:Object.freeze([practice.id,transfer.id]), policyVersion:RECEIPT_POLICY_VERSION };
    const event:EvidenceEvent = { id:evidenceEventId(`event_${digest(`${id}|issue`).slice(0,32)}`), type:"capability_receipt_issued", actorId:input.actorId, correlationId:input.transferSessionId, transferSessionId:input.transferSessionId, skillId:receipt.skillId, occurredAt:issuedAt, schemaVersion:EVIDENCE_EVENT_SCHEMA_VERSION, policyVersion:RECEIPT_POLICY_VERSION, provenance:receipt.provenance, payload:{receiptId:id,claim:receipt.claim,observedConditions:receipt.observedConditions,unknownConditions:receipt.unknownConditions,sourceEventIds:receipt.sourceEventIds} };
    try {
      await this.persistence.appendCommand({events:[event],idempotencyKey:`receipt:${input.transferSessionId}:${input.idempotencyKey}`,...(input.actorSessionId === undefined ? {} : { actorSessionId: input.actorSessionId })});
      return { replayed: false, receipt };
    } catch (error) {
      // The deterministic receipt event ID is the canonical uniqueness key for
      // this qualifying transfer score + policy. A distinct-key racing request
      // therefore replays the already committed receipt rather than surfacing a
      // transient duplicate-key failure to the learner.
      const committed = (await this.persistence.list(input.actorId))
        .map((item) => receiptFromEvent(item.event))
        .find((candidate): candidate is CapabilityReceipt => !!candidate && candidate.id === id);
      if (committed) return { replayed: true, receipt: committed };
      throw error;
    }
  }
}
export interface LearnerProgress { readonly skillId:SkillId; readonly solvedWithSupport:boolean; readonly demonstratedInChangedSituation:boolean; readonly delayedEvidenceObserved:boolean; readonly historicalEvidence:boolean; }
export const rebuildLearnerProgress=(events:readonly StoredEvidenceEvent[]):readonly LearnerProgress[]=>Object.freeze([...new Set(events.map(x=>x.event.skillId))].map(skillId=>{const e=events.filter(x=>x.event.skillId===skillId).map(x=>x.event);return Object.freeze({skillId,solvedWithSupport:e.some(x=>x.type==="practice_scored"&&x.payload.outcome==="correct"&&e.some(y=>y.type==="intervention_opened"&&y.challengeSessionId===x.challengeSessionId)),demonstratedInChangedSituation:e.some(x=>x.type==="transfer_scored"&&x.payload.outcome==="correct"),delayedEvidenceObserved:e.some(x=>x.type==="delayed_check_completed"),historicalEvidence:e.some(x=>x.provenance!=="live")});}));
export const rebuildHistory=(events:readonly StoredEvidenceEvent[])=>Object.freeze([...events].sort((a,b)=>a.sequence-b.sequence).map(x=>Object.freeze({eventId:x.event.id,type:x.event.type,occurredAt:x.event.occurredAt,provenance:x.event.provenance,historical:x.event.provenance!=="live"})));
