export type LearnerMicroSkillState = "available" | "current" | "completed" | "unavailable";

export interface LearnerDiscovery {
  readonly subjects: readonly { readonly id: string; readonly label: string; readonly displayOrder: number; readonly topics: readonly { readonly id: string; readonly label: string; readonly displayOrder: number; readonly microSkills: readonly { readonly id: string; readonly revisionId: string; readonly title: string; readonly displayOrder: number; readonly state: LearnerMicroSkillState; readonly unavailableReason?: string }[] }[] }[];
  readonly nextAction: { readonly kind: "none" } | { readonly kind: "start_practice"; readonly microSkillRevisionId: string } | { readonly kind: "resume_practice"; readonly microSkillRevisionId: string; readonly practiceSessionId: string };
  readonly progress: { readonly hasPracticeEvidence: boolean; readonly hasIndependentTransferEvidence: boolean };
}

export type LearnerHome = LearnerDiscovery & { readonly actorId: string };
