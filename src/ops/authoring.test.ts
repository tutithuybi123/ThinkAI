import assert from "node:assert/strict";
import test from "node:test";
import { OpsService } from "./service.js";

test("Ops creates an initial teacher-facing draft with server-owned identities", async () => {
  const created: any[] = [];
  const ops = new OpsService({
    listRevisions: async () => [],
    createDraft: async (revision: any) => (created.push(revision), revision),
  } as any);

  const draft = await ops.createInitialDraft({
    subjectLabel: "Toán 10",
    topicLabel: "Hàm số bậc hai",
    microSkillTitle: "Xét dấu tam thức bậc hai",
  });

  const node = draft.body.microSkills[0]!;
  assert.equal(draft.lifecycle, "DRAFT");
  assert.equal(node.subject.label, "Toán 10");
  assert.equal(node.topic.label, "Hàm số bậc hai");
  assert.equal(node.microSkill.title, "Xét dấu tam thức bậc hai");
  assert.match(draft.id, /^revision_/);
  assert.equal(node.microSkill.revisionId, draft.id);
  assert.match(node.microSkill.evidenceSkillId, /^skill_/);
  assert.equal(node.pairs.length, 0);
  assert.deepEqual(node.practiceGate, {
    policyVersion: "practice-gate/v1",
    strategy: "distinct-correct-count",
    requiredCorrectCount: 1,
    maxPracticeItems: 1,
  });
  assert.equal(created.length, 1);
});

test("Ops reuses an existing subject and topic identity by teacher-facing labels", async () => {
  const previous = {
    id: "revision_existing",
    lifecycle: "PUBLISHED",
    body: {
      microSkills: [
        {
          subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
          topic: {
            id: "topic_quadratic",
            subjectId: "subject_math",
            label: "Hàm số bậc hai",
            displayOrder: 1,
          },
          microSkill: {
            id: "micro_existing",
            evidenceSkillId: "skill_existing",
            title: "Kỹ năng đã có",
            displayOrder: 1,
          },
        },
      ],
    },
  };
  const ops = new OpsService({
    listRevisions: async () => [previous],
    createDraft: async (revision: any) => revision,
  } as any);
  const draft = await ops.createInitialDraft({
    subjectLabel: "Toán 10",
    topicLabel: "Hàm số bậc hai",
    microSkillTitle: "Đỉnh parabol",
  });
  const node = draft.body.microSkills[0]!;
  assert.equal(node.subject.id, "subject_math");
  assert.equal(node.topic.id, "topic_quadratic");
  assert.notEqual(node.microSkill.id, "micro_existing");
});

test("Ops refuses a duplicate MicroSkill title within the same teacher-facing Topic", async () => {
  const existing = {
    id: "revision_existing",
    lifecycle: "PUBLISHED",
    body: {
      microSkills: [
        {
          subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
          topic: {
            id: "topic_quadratic",
            subjectId: "subject_math",
            label: "Hàm số bậc hai",
            displayOrder: 1,
          },
          microSkill: {
            id: "micro_sign",
            evidenceSkillId: "skill_sign",
            title: "Xét dấu tam thức",
            displayOrder: 1,
          },
        },
      ],
    },
  };
  const ops = new OpsService({
    listRevisions: async () => [existing],
    createDraft: async () => {
      throw new Error("must not create");
    },
  } as any);
  await assert.rejects(
    () =>
      ops.createInitialDraft({
        subjectLabel: "Toán 10",
        topicLabel: "Hàm số bậc hai",
        microSkillTitle: "Xét dấu tam thức",
      }),
    { code: "DUPLICATE_MICROSKILL_TITLE" },
  );
});

test("Ops ignores historical structural revisions that do not contain authoring hierarchy", async () => {
  const legacy = {
    id: "revision_legacy",
    lifecycle: "DEPRECATED",
    body: {
      microSkills: [{}, { subject: {}, topic: {}, microSkill: {} }],
    },
  };
  const ops = new OpsService({
    listRevisions: async () => [legacy],
    createDraft: async (revision: any) => revision,
  } as any);
  const draft = await ops.createInitialDraft({
    subjectLabel: "Toán 10",
    topicLabel: "Hàm số bậc hai",
    microSkillTitle: "Xét dấu",
  });
  assert.equal(draft.body.microSkills[0]!.subject.label, "Toán 10");
});

test("Ops appends a paired Practice and Transfer draft with server-owned task identities", async () => {
  let saved: any;
  const revision = {
    id: "revision_pair_draft",
    lifecycle: "DRAFT",
    body: {
      microSkills: [
        {
          subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
          topic: {
            id: "topic_functions",
            subjectId: "subject_math",
            label: "Hàm số",
            displayOrder: 1,
          },
          microSkill: {
            id: "micro_sign",
            evidenceSkillId: "skill_sign",
            topicId: "topic_functions",
            revisionId: "revision_pair_draft",
            title: "Xét dấu",
            displayOrder: 1,
            prerequisiteMicroSkillIds: [],
          },
          pairs: [],
        },
      ],
    },
  };
  const ops = new OpsService({
    getRevision: async () => revision,
    editDraft: async (_id: unknown, body: any) => (
      (saved = body),
      { ...revision, body }
    ),
  } as any);
  const next = await ops.addPairDraft("revision_pair_draft" as any);
  const pair = next.body.microSkills[0]!.pairs[0]!;
  assert.match(pair.id, /^pair_/);
  assert.equal(pair.microSkillRevisionId, "revision_pair_draft");
  assert.match(pair.practiceContent.id, /^task_/);
  assert.equal(pair.practiceContent.role, "practice");
  assert.equal(pair.transferContent.role, "transfer");
  assert.equal(saved.microSkills[0].pairs.length, 1);
});

test("Ops forks a locked revision into a new server-versioned draft", async () => {
  const source = {
    id: "revision_v1",
    lifecycle: "PUBLISHED",
    body: {
      microSkills: [
        {
          subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 },
          topic: {
            id: "topic_functions",
            subjectId: "subject_math",
            label: "Hàm số",
            displayOrder: 1,
          },
          microSkill: {
            id: "micro_sign",
            evidenceSkillId: "skill_sign",
            topicId: "topic_functions",
            revisionId: "revision_v1",
            title: "Xét dấu",
            displayOrder: 1,
            prerequisiteMicroSkillIds: [],
          },
          pairs: [{ microSkillRevisionId: "revision_v1" }],
        },
      ],
    },
  };
  const ops = new OpsService({
    getRevision: async () => source,
    createDraft: async (revision: any) => revision,
  } as any);
  const fork = await ops.createNextDraft("revision_v1" as any);
  assert.equal(fork.lifecycle, "DRAFT");
  assert.notEqual(fork.id, source.id);
  assert.equal(fork.body.microSkills[0]!.microSkill.revisionId, fork.id);
  assert.equal(
    fork.body.microSkills[0]!.pairs[0]!.microSkillRevisionId,
    fork.id,
  );
  assert.equal(
    source.body.microSkills[0]!.microSkill.revisionId,
    "revision_v1",
  );
});

test("Ops reports publication readiness from the server validator", async () => {
  const revision = {
    id: "revision_readiness",
    lifecycle: "DRAFT",
    body: {
      microSkills: [
        {
          subject: { id: "subject_math", label: "Toán", displayOrder: 1 },
          topic: {
            id: "topic_algebra",
            subjectId: "subject_math",
            label: "Đại số",
            displayOrder: 1,
          },
          microSkill: {
            id: "micro_readiness",
            evidenceSkillId: "skill_readiness",
            topicId: "topic_algebra",
            revisionId: "revision_readiness",
            title: "Kỹ năng",
            displayOrder: 1,
            prerequisiteMicroSkillIds: [],
          },
          pairs: [],
        },
      ],
    },
  };
  const ops = new OpsService({ getRevision: async () => revision } as any);
  const result = await ops.readiness("revision_readiness" as any);
  assert.equal(result.ready, false);
  assert.ok(result.issues.includes("EMPTY_PUBLISHED_PAIR_BANK"));
});
