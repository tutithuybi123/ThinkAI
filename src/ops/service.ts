import { randomUUID } from "node:crypto";
import {
  contentRevisionId,
  microSkillId,
  skillId,
  subjectId,
  taskId,
  taskPairId,
  topicId,
  type ContentRevisionId,
} from "../domain/ids.js";
import type {
  AuthoredReviewedPair,
  ContentAggregate,
  MicroSkillAggregate,
} from "../content/v11-validator.js";
import {
  createDraftRevision,
  type ContentRevision,
} from "../content/lifecycle.js";
import { validatePublishableContent } from "../content/publication.js";
import { PostgresContentRevisionRepository } from "../content/postgres-repository.js";
export interface InitialDraftInput {
  readonly subjectLabel: string;
  readonly topicLabel: string;
  readonly microSkillTitle: string;
}

const normalized = (value: string): string => value.trim().replace(/\s+/g, " ");
const identityPart = (): string => randomUUID().replace(/-/g, "").slice(0, 16);

/** Creates only authoring identity. Tasks remain deliberately empty until the teacher authors them. */
export class OpsService {
  constructor(private readonly content: PostgresContentRevisionRepository) {}
  async createInitialDraft(
    input: InitialDraftInput,
  ): Promise<ContentRevision<ContentAggregate>> {
    const subjectLabel = normalized(input.subjectLabel),
      topicLabel = normalized(input.topicLabel),
      microSkillTitle = normalized(input.microSkillTitle);
    if (!subjectLabel || !topicLabel || !microSkillTitle)
      throw Object.assign(
        new Error("Subject, Topic and MicroSkill labels are required."),
        { code: "AUTHORING_LABEL_REQUIRED" },
      );
    const revisions = await this.list();
    const nodes = revisions
      .flatMap((revision) => revision.body.microSkills ?? [])
      .filter(
        (node): node is MicroSkillAggregate =>
          !!node &&
          typeof node === "object" &&
          !!node.subject &&
          !!node.topic &&
          !!node.microSkill &&
          typeof node.subject.label === "string" &&
          typeof node.topic.label === "string" &&
          typeof node.microSkill.title === "string",
      );
    const existingSubject = nodes.find(
      (node) => normalized(node.subject.label) === subjectLabel,
    )?.subject;
    const subject = existingSubject ?? {
      id: subjectId(`subject_${identityPart()}`),
      label: subjectLabel,
      displayOrder:
        Math.max(0, ...nodes.map((node) => node.subject.displayOrder ?? 0)) + 1,
    };
    const existingTopic = nodes.find(
      (node) =>
        node.subject.id === subject.id &&
        normalized(node.topic.label) === topicLabel,
    )?.topic;
    const topic = existingTopic ?? {
      id: topicId(`topic_${identityPart()}`),
      subjectId: subject.id,
      label: topicLabel,
      displayOrder:
        Math.max(
          0,
          ...nodes
            .filter((node) => node.subject.id === subject.id)
            .map((node) => node.topic.displayOrder ?? 0),
        ) + 1,
    };
    if (
      nodes.some(
        (candidate) =>
          candidate.topic.id === topic.id &&
          normalized(candidate.microSkill?.title ?? "") === microSkillTitle,
      )
    )
      throw Object.assign(
        new Error("A MicroSkill with this title already exists in the Topic."),
        { code: "DUPLICATE_MICROSKILL_TITLE" },
      );
    const revisionId = contentRevisionId(`revision_${identityPart()}`);
    const node: MicroSkillAggregate = {
      subject,
      topic,
      microSkill: {
        id: microSkillId(`micro_${identityPart()}`),
        evidenceSkillId: skillId(`skill_${identityPart()}`),
        topicId: topic.id,
        revisionId,
        title: microSkillTitle,
        displayOrder:
          Math.max(
            0,
            ...nodes
              .filter((candidate) => candidate.topic.id === topic.id)
              .map((candidate) => candidate.microSkill?.displayOrder ?? 0),
          ) + 1,
        prerequisiteMicroSkillIds: [],
      },
      pairs: [],
      practiceGate: {
        policyVersion: "practice-gate/v1",
        strategy: "distinct-correct-count",
        requiredCorrectCount: 1,
        maxPracticeItems: 1,
      },
    };
    return this.createDraft({ id: revisionId, body: { microSkills: [node] } });
  }
  async addPairDraft(
    id: ContentRevisionId,
  ): Promise<ContentRevision<ContentAggregate>> {
    const revision = await this.get(id);
    if (!revision)
      throw Object.assign(new Error("Draft revision is unavailable."), {
        code: "REVISION_UNAVAILABLE",
      });
    if (revision.lifecycle !== "DRAFT")
      throw Object.assign(new Error("Only draft revisions can be changed."), {
        code: "REVISION_IMMUTABLE",
      });
    const node = revision.body.microSkills[0];
    if (!node)
      throw Object.assign(new Error("Draft has no MicroSkill."), {
        code: "MALFORMED_CONTENT_AGGREGATE",
      });
    const suffix = identityPart(),
      pairId = `pair_${suffix}`,
      practiceId = `task_practice_${suffix}`,
      transferId = `task_transfer_${suffix}`;
    const pair: AuthoredReviewedPair = {
      id: taskPairId(pairId),
      version: "1",
      microSkillRevisionId: id,
      practiceTask: { id: taskId(practiceId), version: "1", role: "practice" },
      transferTask: { id: taskId(transferId), version: "1", role: "transfer" },
      practiceContent: {
        id: practiceId,
        version: "1",
        skillId: node.microSkill.evidenceSkillId,
        role: "practice" as const,
        prompt: { format: "plain_text" as const, body: "" },
        answerSpec: {
          kind: "exact_text" as const,
          accepted: [],
          normalizationVersion: "answer/v1",
        },
      },
      transferContent: {
        id: transferId,
        version: "1",
        skillId: node.microSkill.evidenceSkillId,
        role: "transfer" as const,
        prompt: { format: "plain_text" as const, body: "" },
        answerSpec: {
          kind: "exact_text" as const,
          accepted: [],
          normalizationVersion: "answer/v1",
        },
      },
      connectionReveal: {
        id: `reveal_${suffix}`,
        version: "1",
        pairId,
        pairVersion: "1",
        title: "",
        sharedRelation: "",
        explanation: { format: "plain_text" as const, body: "" },
      },
    };
    const body: ContentAggregate = {
      microSkills: revision.body.microSkills.map((candidate, index) =>
        index === 0
          ? { ...candidate, pairs: [...candidate.pairs, pair] }
          : candidate,
      ),
    };
    return this.editDraft(id, body);
  }
  async createNextDraft(
    id: ContentRevisionId,
  ): Promise<ContentRevision<ContentAggregate>> {
    const source = await this.get(id);
    if (!source)
      throw Object.assign(new Error("Revision is unavailable."), {
        code: "REVISION_UNAVAILABLE",
      });
    const nextId = contentRevisionId(`revision_${identityPart()}`);
    const body: ContentAggregate = {
      microSkills: source.body.microSkills.map((node) => ({
        ...node,
        microSkill: { ...node.microSkill, revisionId: nextId },
        pairs: node.pairs.map((pair) => ({
          ...pair,
          microSkillRevisionId: nextId,
        })),
      })),
    };
    return this.createDraft({ id: nextId, body });
  }
  async createDraft(input: {
    id: ContentRevisionId;
    body: ContentAggregate;
  }): Promise<ContentRevision<ContentAggregate>> {
    const draft = createDraftRevision(input);
    return this.content.createDraft(draft);
  }
  editDraft(id: ContentRevisionId, body: ContentAggregate) {
    return this.content.editDraft(id, body);
  }
  list() {
    return this.content.listRevisions<ContentAggregate>();
  }
  submitReview(id: ContentRevisionId) {
    return this.content.submitForReview<ContentAggregate>(id);
  }
  approve(id: ContentRevisionId) {
    return this.content.approve<ContentAggregate>(id);
  }
  publish(id: ContentRevisionId) {
    return this.content.publish(id);
  }
  deprecate(id: ContentRevisionId) {
    return this.content.deprecate<ContentAggregate>(id);
  }
  get(id: ContentRevisionId) {
    return this.content.getRevision<ContentAggregate>(id);
  }
  async readiness(
    id: ContentRevisionId,
  ): Promise<{ readonly ready: boolean; readonly issues: readonly string[] }> {
    const revision = await this.get(id);
    if (!revision)
      throw Object.assign(new Error("Revision is unavailable."), {
        code: "REVISION_UNAVAILABLE",
      });
    const issues = validatePublishableContent(revision.body);
    return { ready: issues.length === 0, issues };
  }
}
