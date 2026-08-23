import assert from "node:assert/strict";
import test from "node:test";
import { actorId, contentRevisionId, microSkillId, skillId, subjectId, taskId, taskPairId, topicId } from "../domain/ids.js";
import { selectFreshTransferPair, selectInitialPair } from "./selection.js";
import { validateContentAggregate } from "./v11-validator.js";
import { createAggregatePairSnapshot, createPublishedPairSnapshot, runtimeContentFromSnapshot } from "./snapshot.js";
import { validateContentBundle } from "./validator.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { assertPublishableContent, assertRevisionBoundContent, publishReviewedAggregate, validatePublishableContent } from "./publication.js";
import { approveRevision, createDraftRevision, submitForReview } from "./lifecycle.js";

const assessment = { expectedResult: "2", gradingShape: { finalAnswerFacet: "required" as const, reasoningFacet: "required" as const, requiredCriterionIds: ["method"], optionalCriterionIds: [] }, criteria: [{ id: "method", description: "method" }], referenceSolutions: [{ format: "plain_text" as const, body: "alternate" }], commonMisconceptions: ["swap"], aiGuidance: { version: "g1", allowedSupportLevels: ["PROMPT"] as const } };
const pair = (id: string, transfer = `task_${id}_transfer`) => { const practiceId = taskId(`task_${id}_practice`); const transferId = taskId(transfer); const evidenceSkillId = skillId("skill_gradient_evidence"); return { id: taskPairId(`pair_${id}`), version: "1", microSkillRevisionId: contentRevisionId("revision_gradient_1"), practiceTask: { id: practiceId, version: "1", role: "practice" as const }, transferTask: { id: transferId, version: "1", role: "transfer" as const }, practiceContent: { id: practiceId, version: "1", skillId: evidenceSkillId, role: "practice" as const, prompt: { format: "plain_text" as const, body: "practice" }, answerSpec: { kind: "written_solution" as const, assessment } }, transferContent: { id: transferId, version: "1", skillId: evidenceSkillId, role: "transfer" as const, prompt: { format: "plain_text" as const, body: "transfer" }, answerSpec: { kind: "exact_text" as const, accepted: ["2"], normalizationVersion: "v1" } }, connectionReveal: { id: "reveal_a", version: "1", pairId: taskPairId(`pair_${id}`), pairVersion: "1", title: "relation", sharedRelation: "same", explanation: { format: "plain_text" as const, body: "same idea" } } }; };
const base = () => ({ subject: { id: subjectId("subject_math"), label: "Toán 10", displayOrder: 1 }, topic: { id: topicId("topic_linear"), subjectId: subjectId("subject_math"), label: "Hàm số bậc nhất", displayOrder: 1 }, microSkill: { id: microSkillId("micro_gradient"), evidenceSkillId: skillId("skill_gradient_evidence"), topicId: topicId("topic_linear"), revisionId: contentRevisionId("revision_gradient_1"), title: "Tìm hệ số góc", displayOrder: 1, prerequisiteMicroSkillIds: [] }, practiceGate:{policyVersion:"practice-gate/v1" as const,strategy:"distinct-correct-count" as const,requiredCorrectCount:1,maxPracticeItems:2}, pairs: [pair("a"), pair("b")] });

test("validates multi-node authored progression and rejects cycles", () => {
  const a = base(); const b = { ...base(), microSkill: { ...base().microSkill, id: microSkillId("micro_intercept"), evidenceSkillId: skillId("skill_intercept_evidence"), revisionId: contentRevisionId("revision_intercept_1"), prerequisiteMicroSkillIds: [a.microSkill.id] }, pairs: [] };
  assert.deepEqual(validateContentAggregate({ microSkills: [a, b] }), []);
  assert.match(validateContentAggregate({ microSkills: [a, { ...b, microSkill: { ...b.microSkill, prerequisiteMicroSkillIds: [a.microSkill.id, a.microSkill.id] } }] })[0]!.code, /DUPLICATE/);
  const cyclic = { ...a, microSkill: { ...a.microSkill, prerequisiteMicroSkillIds: [b.microSkill.id] } };
  assert.match(validateContentAggregate({ microSkills: [cyclic, b] })[0]!.code, /CYCLE/);
});

test("ContentBundle validates the authored graph as a containing aggregate", () => {
  const a = base(); const b = { ...base(), microSkill: { ...base().microSkill, id: microSkillId("micro_intercept"), evidenceSkillId: skillId("skill_intercept_evidence"), revisionId: contentRevisionId("revision_intercept_1"), prerequisiteMicroSkillIds: [a.microSkill.id] }, pairs: [] };
  assert.equal(validateContentBundle({ ...packageAStructuralFixture, contentAggregate: { microSkills: [a, b] } }).valid, true);
  assert.equal(validateContentBundle({ ...packageAStructuralFixture, contentAggregate: { microSkills: [{ ...a, microSkill: { ...a.microSkill, prerequisiteMicroSkillIds: [microSkillId("micro_unknown")] } }] } }).valid, false);
});

test("aggregate snapshot deep-freezes the selected pair and authored identity", () => {
  const aggregate = base(); const selected = aggregate.pairs[0]!;
  const snapshot = createAggregatePairSnapshot(aggregate, selected);
  aggregate.pairs.reverse();
  assert.equal(snapshot.microSkillRevisionId, aggregate.microSkill.revisionId);
  assert.equal(snapshot.pair.id, selected.id);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.pair), true);
  assert.equal(snapshot.authoredAggregate.pairs[0]!.id, selected.id);
  (aggregate.microSkill as { title?: string }).title = "later draft edit";
  assert.equal((snapshot.authoredAggregate.microSkill as { title?: string }).title, "Tìm hệ số góc");
  assert.equal((snapshot.pair.practiceContent.answerSpec as { assessment: { aiGuidance: { version: string } } }).assessment.aiGuidance.version, "g1");
  assert.equal(Object.isFrozen(snapshot.pair.practiceContent), true);
  assert.throws(() => ((snapshot.pair.practiceContent.answerSpec as unknown as { assessment: { referenceSolutions: unknown[] } }).assessment.referenceSolutions.push("blocked")));
  const forged = { ...selected, practiceTask: { ...selected.practiceTask, id: taskId("task_forged") } };
  const canonical = createAggregatePairSnapshot(aggregate, forged);
  assert.notEqual(canonical.pair.practiceTask.id, taskId("task_forged"));
});

test("server-owned pair policies are deterministic and never reuse exposed transfer material", () => {
  const aggregate = base(); const actor = actorId("actor_learner");
  assert.equal(selectInitialPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, eligiblePairs: aggregate.pairs }).id, selectInitialPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, eligiblePairs: aggregate.pairs }).id);
  const fresh = selectFreshTransferPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, independentAttemptOrdinal: 1, eligiblePairs: aggregate.pairs, exposedPairs: [{ pairId: aggregate.pairs[0]!.id, pairVersion: "1" }], exposedTransferTasks: [] });
  assert.equal(fresh.kind, "PAIR_SELECTED"); if (fresh.kind === "PAIR_SELECTED") assert.notEqual(fresh.pair.id, aggregate.pairs[0]!.id);
  assert.deepEqual(selectFreshTransferPair({ actorId: actor, microSkillRevisionId: aggregate.microSkill.revisionId, independentAttemptOrdinal: 1, eligiblePairs: aggregate.pairs, exposedPairs: [], exposedTransferTasks: aggregate.pairs.map((x) => ({ taskId: x.transferTask.id, version: x.transferTask.version })) }), { kind: "NO_FRESH_TRANSFER_AVAILABLE" });
});

test("draft aggregates may be incomplete but publication requires a complete pair bank", () => {
  assert.ok(validateContentAggregate({ microSkills: [{ ...base(), pairs: [] } ] }).length === 0);
  assert.deepEqual(validatePublishableContent({ microSkills: [{ ...base(), pairs: [] }] }), ["EMPTY_PUBLISHED_PAIR_BANK","INSUFFICIENT_PRACTICE_PAIR_BANK"]);
  assert.deepEqual(validatePublishableContent({ microSkills: [base()] }), []);
  assert.throws(() => assertPublishableContent({ microSkills: [{ ...base(), pairs: [] }] }), /EMPTY_PUBLISHED_PAIR_BANK/);
  const draft = createDraftRevision({ id: contentRevisionId("revision_publish_1"), body: { microSkills: [{ ...base(), pairs: [] }] } });
  assert.throws(() => publishReviewedAggregate(approveRevision(submitForReview(draft))), /EMPTY_PUBLISHED_PAIR_BANK/);
});

test("malformed aggregate data fails closed instead of throwing", () => {
  assert.doesNotThrow(() => assert.notEqual(validateContentAggregate({ microSkills: [{ microSkill: { prerequisiteMicroSkillIds: "bad" }, pairs: [] }] } as unknown).length, 0));
});

test("publication rejects a body whose executable micro-skill identity is not the revision identity", () => {
  const revision = contentRevisionId("revision_bound_identity");
  const node = base();
  assert.throws(() => assertRevisionBoundContent(revision, { microSkills: [node] }), /REVISION_IDENTITY_MISMATCH/);
  const bound = { ...node, microSkill: { ...node.microSkill, revisionId: revision }, pairs: node.pairs.map(item => ({ ...item, microSkillRevisionId: revision })) };
  assert.doesNotThrow(() => assertRevisionBoundContent(revision, { microSkills: [bound] }));
});

test("a published aggregate pair carries its exact executable content without a bootstrap repository", () => {
  const aggregate = base();
  const selected = aggregate.pairs[0]!;
  const snapshot = createPublishedPairSnapshot(aggregate, selected);
  const runtime = runtimeContentFromSnapshot(snapshot);
  assert.equal(runtime.pair.id, selected.id);
  assert.equal(runtime.practiceTask.id, selected.practiceContent.id);
  assert.equal(runtime.transferTask.id, selected.transferContent.id);
  assert.equal(runtime.practiceTask.skillId, aggregate.microSkill.evidenceSkillId);
});

test("published snapshots with reused pair versions retain distinct executable identities", () => {
  const original = base();
  const revised = {
    ...base(),
    microSkill: { ...base().microSkill, evidenceSkillId: skillId("skill_gradient_revised") },
    pairs: base().pairs.map(item => ({
      ...item,
      practiceContent: { ...item.practiceContent, skillId: skillId("skill_gradient_revised") },
      transferContent: { ...item.transferContent, skillId: skillId("skill_gradient_revised") },
    })),
  };
  assert.notEqual(createPublishedPairSnapshot(original, original.pairs[0]!).integrityKey, createPublishedPairSnapshot(revised, revised.pairs[0]!).integrityKey);
});

test("requires reviewed learner-facing labels for the published hierarchy", () => {
  const node = base();
  assert.equal(validateContentAggregate({ microSkills: [node] }).length, 0);
  assert.notEqual(validateContentAggregate({ microSkills: [{ ...node, subject: { id: node.subject.id, displayOrder: node.subject.displayOrder } }] }).length, 0);
});

test("requires a valid server-only evidence skill identity instead of guessing from the authored id", () => {
  const node = base();
  assert.notEqual(String(node.microSkill.id), String(node.microSkill.evidenceSkillId));
  assert.equal(validateContentAggregate({ microSkills: [node] }).length, 0);
  assert.equal(validateContentAggregate({ microSkills: [{ ...node, microSkill: { ...node.microSkill, evidenceSkillId: "micro_gradient" } }] }).some((issue) => issue.code === "INVALID_EVIDENCE_SKILL_ID"), true);
  assert.equal(validateContentAggregate({ microSkills: [{ ...node, microSkill: { ...node.microSkill, evidenceSkillId: undefined } }] }).some((issue) => issue.code === "MISSING_EVIDENCE_SKILL_ID"), true);
});

test("fails publication validation when a reviewed pair writes evidence for another skill", () => {
  const node = base();
  const mismatched = { ...node, pairs: [{ ...node.pairs[0]!, practiceContent: { ...node.pairs[0]!.practiceContent, skillId: skillId("skill_other_evidence") } }] };
  assert.equal(validateContentAggregate({ microSkills: [mismatched] }).some((issue) => issue.code === "EVIDENCE_SKILL_PAIR_MISMATCH"), true);
});

test("rejects duplicate reviewed pair versions before a draft can be published", () => {
  const node = base();
  assert.equal(validateContentAggregate({ microSkills: [{ ...node, pairs: [node.pairs[0]!, node.pairs[0]!] }] }).some((issue) => issue.code === "DUPLICATE_PAIR_VERSION"), true);
});
