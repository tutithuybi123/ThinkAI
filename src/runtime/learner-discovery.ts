import type { MicroSkillAggregate } from "../content/v11-validator.js";
import type { SkillId } from "../domain/ids.js";
import type { StoredEvidenceEvent } from "../persistence/index.js";
import { projectLearnerDiscovery, type LearnerDiscoveryView, type LearnerEvidenceSignal, type PublishedDiscoveryNode } from "../learner/discovery.js";

/**
 * Converts reviewed, published hierarchy plus persisted evidence into the learner-safe
 * discovery DTO. `evidenceSkillId` is deliberately consumed here and never emitted.
 */
export function deriveLearnerDiscovery(
  publishedMicroSkills: readonly MicroSkillAggregate[],
  events: readonly StoredEvidenceEvent[],
): LearnerDiscoveryView {
  const nodes = publishedNodes(publishedMicroSkills);
  return projectLearnerDiscovery(nodes, signalsFor(nodes, events));
}

/** Guards the runtime write path: evidence must use the authored stable identity. */
export function assertPublishedEvidenceIdentity(node: MicroSkillAggregate, persistedSkillId: SkillId): void {
  if (node.microSkill.evidenceSkillId !== persistedSkillId) {
    throw Object.assign(new Error("Published content evidence identity does not match the Practice pair."), { code: "CONTENT_INTEGRITY_FAILED" });
  }
}

function publishedNodes(publishedMicroSkills: readonly MicroSkillAggregate[]): readonly PublishedDiscoveryNode[] {
  const nodes = publishedMicroSkills.map((node) => ({
      subject: { id: node.subject.id, label: node.subject.label, displayOrder: node.subject.displayOrder },
      topic: { id: node.topic.id, label: node.topic.label, displayOrder: node.topic.displayOrder },
      microSkill: {
        id: node.microSkill.id,
        evidenceSkillId: node.microSkill.evidenceSkillId,
        revisionId: node.microSkill.revisionId,
        title: node.microSkill.title,
        displayOrder: node.microSkill.displayOrder,
        prerequisiteMicroSkillIds: node.microSkill.prerequisiteMicroSkillIds,
      },
    }));
  const evidenceToMicroSkill = new Map<string, string>();
  for (const node of nodes) {
    const existing = evidenceToMicroSkill.get(node.microSkill.evidenceSkillId);
    if (existing && existing !== node.microSkill.id) {
      throw Object.assign(new Error("Published content has an ambiguous evidence identity."), { code: "CONTENT_INTEGRITY_FAILED" });
    }
    evidenceToMicroSkill.set(node.microSkill.evidenceSkillId, node.microSkill.id);
  }
  return nodes;
}

function signalsFor(nodes: readonly PublishedDiscoveryNode[], events: readonly StoredEvidenceEvent[]): readonly LearnerEvidenceSignal[] {
  const authoredByEvidenceSkill = new Map(nodes.map((node) => [node.microSkill.evidenceSkillId, node.microSkill.id]));
  const signals: LearnerEvidenceSignal[] = [];
  for (const { event } of [...events].sort((left, right) => left.sequence - right.sequence)) {
    const microSkillId = authoredByEvidenceSkill.get(event.skillId);
    if (!microSkillId) continue;
    if (event.type === "challenge_started" && event.challengeSessionId) {
      signals.push({ type: "practice_started", microSkillId, sessionId: event.challengeSessionId });
    }
    if (event.type === "practice_scored" && event.challengeSessionId && event.payload.outcome === "correct") {
      signals.push({ type: "practice_pass", microSkillId, sessionId: event.challengeSessionId });
    }
    if (event.type === "transfer_scored" && event.payload.outcome === "correct") {
      signals.push({ type: "transfer_pass", microSkillId });
    }
  }
  return signals;
}
