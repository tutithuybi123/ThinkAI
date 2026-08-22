export type LearnerMicroSkillState = "available" | "current" | "completed" | "unavailable";

export interface PublishedDiscoveryNode {
  readonly subject: { readonly id: string; readonly label: string; readonly displayOrder: number };
  readonly topic: { readonly id: string; readonly label: string; readonly displayOrder: number };
  /** Server-only bridge from authored hierarchy to persisted evidence. */
  readonly microSkill: { readonly id: string; readonly evidenceSkillId: string; readonly revisionId: string; readonly title: string; readonly displayOrder: number; readonly prerequisiteMicroSkillIds: readonly string[] };
}

export type LearnerEvidenceSignal =
  | { readonly type: "practice_started"; readonly microSkillId: string; readonly sessionId: string }
  | { readonly type: "practice_pass"; readonly microSkillId: string; readonly sessionId: string }
  | { readonly type: "transfer_pass"; readonly microSkillId: string };

export interface LearnerMicroSkillView {
  readonly id: string;
  readonly revisionId: string;
  readonly title: string;
  readonly displayOrder: number;
  readonly state: LearnerMicroSkillState;
  readonly unavailableReason?: string;
}

export interface LearnerDiscoveryView {
  readonly subjects: readonly { readonly id: string; readonly label: string; readonly displayOrder: number; readonly topics: readonly { readonly id: string; readonly label: string; readonly displayOrder: number; readonly microSkills: readonly LearnerMicroSkillView[] }[] }[];
  readonly nextAction: { readonly kind: "none" } | { readonly kind: "start_practice"; readonly microSkillRevisionId: string } | { readonly kind: "resume_practice"; readonly microSkillRevisionId: string; readonly practiceSessionId: string };
  readonly progress: { readonly hasPracticeEvidence: boolean; readonly hasIndependentTransferEvidence: boolean };
}

const unavailableReason = "Hoàn thành micro-skill trước để tiếp tục.";

export function projectLearnerDiscovery(nodes: readonly PublishedDiscoveryNode[], signals: readonly LearnerEvidenceSignal[]): LearnerDiscoveryView {
  const completed = new Set(signals.filter((signal) => signal.type === "transfer_pass").map((signal) => signal.microSkillId));
  const passedPractice = new Set(signals.filter((signal) => signal.type === "practice_pass").map((signal) => `${signal.microSkillId}:${signal.sessionId}`));
  const resumable = new Map<string, string>();
  for (const signal of signals) {
    if (signal.type === "practice_started" && !passedPractice.has(`${signal.microSkillId}:${signal.sessionId}`) && !completed.has(signal.microSkillId)) resumable.set(signal.microSkillId, signal.sessionId);
  }
  const sorted = [...nodes].sort((left, right) => left.subject.displayOrder - right.subject.displayOrder || left.topic.displayOrder - right.topic.displayOrder || left.microSkill.displayOrder - right.microSkill.displayOrder);
  const views = new Map<string, LearnerMicroSkillView>();
  for (const node of sorted) {
    const state: LearnerMicroSkillState = resumable.has(node.microSkill.id)
      ? "current"
      : completed.has(node.microSkill.id)
        ? "completed"
        : node.microSkill.prerequisiteMicroSkillIds.every((id) => completed.has(id))
          ? "available"
          : "unavailable";
    views.set(node.microSkill.id, Object.freeze({ id: node.microSkill.id, revisionId: node.microSkill.revisionId, title: node.microSkill.title, displayOrder: node.microSkill.displayOrder, state, ...(state === "unavailable" ? { unavailableReason } : {}) }));
  }
  const subjects = new Map<string, { id: string; label: string; displayOrder: number; topics: Map<string, { id: string; label: string; displayOrder: number; microSkills: LearnerMicroSkillView[] }> }>();
  for (const node of sorted) {
    const subject = subjects.get(node.subject.id) ?? { id: node.subject.id, label: node.subject.label, displayOrder: node.subject.displayOrder, topics: new Map() };
    subjects.set(node.subject.id, subject);
    const topic = subject.topics.get(node.topic.id) ?? { id: node.topic.id, label: node.topic.label, displayOrder: node.topic.displayOrder, microSkills: [] };
    subject.topics.set(node.topic.id, topic);
    topic.microSkills.push(views.get(node.microSkill.id)!);
  }
  const grouped = Object.freeze([...subjects.values()].sort((left, right) => left.displayOrder - right.displayOrder).map((subject) => Object.freeze({ id: subject.id, label: subject.label, displayOrder: subject.displayOrder, topics: Object.freeze([...subject.topics.values()].sort((left, right) => left.displayOrder - right.displayOrder).map((topic) => Object.freeze({ id: topic.id, label: topic.label, displayOrder: topic.displayOrder, microSkills: Object.freeze([...topic.microSkills]) }))) })));
  const current = sorted.find((node) => views.get(node.microSkill.id)?.state === "current");
  const next = sorted.find((node) => views.get(node.microSkill.id)?.state === "available");
  const nextAction = current ? Object.freeze({ kind: "resume_practice" as const, microSkillRevisionId: current.microSkill.revisionId, practiceSessionId: resumable.get(current.microSkill.id)! }) : next ? Object.freeze({ kind: "start_practice" as const, microSkillRevisionId: next.microSkill.revisionId }) : Object.freeze({ kind: "none" as const });
  return Object.freeze({ subjects: grouped, nextAction, progress: Object.freeze({ hasPracticeEvidence: signals.some((signal) => signal.type === "practice_started" || signal.type === "practice_pass"), hasIndependentTransferEvidence: signals.some((signal) => signal.type === "transfer_pass") }) });
}
