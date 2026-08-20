import assert from "node:assert/strict";
import test from "node:test";

import { contentRevisionId, microSkillId, subjectId, topicId } from "../domain/ids.js";
import { approveRevision, createDraftRevision, deprecateRevision, editRevision, publishRevision, submitForReview } from "./lifecycle.js";

const body = Object.freeze({
  subject: { id: subjectId("subject_math"), title: "Mathematics", displayOrder: 1 },
  topic: { id: topicId("topic_linear"), subjectId: subjectId("subject_math"), title: "Linear relations", displayOrder: 1 },
  microSkill: { id: microSkillId("micro_gradient"), topicId: topicId("topic_linear"), title: "Find gradient", displayOrder: 1, prerequisiteMicroSkillIds: [] },
});

test("lifecycle permits only reviewed transitions and deprecation preserves the body", () => {
  const draft = createDraftRevision({ id: contentRevisionId("revision_gradient_1"), body });
  assert.throws(() => approveRevision(draft), /in-review/i);
  assert.throws(() => publishRevision(draft), /approved/i);
  const published = publishRevision(approveRevision(submitForReview(draft)));
  const deprecated = deprecateRevision(published);
  assert.equal(deprecated.lifecycle, "DEPRECATED");
  assert.equal(deprecated.bodyHash, published.bodyHash);
  assert.throws(() => publishRevision(deprecated), /approved/i);
});

test("only a draft body can be edited and review freezes its exact body", () => {
  const draft = createDraftRevision({ id: contentRevisionId("revision_gradient_1"), body });
  const edited = editRevision(draft, { ...body, microSkill: { ...body.microSkill, title: "Find a gradient" } });
  const reviewed = submitForReview(edited);

  assert.equal(reviewed.lifecycle, "IN_REVIEW");
  assert.throws(() => editRevision(reviewed, body), /immutable/i);
  assert.equal(reviewed.body.microSkill.title, "Find a gradient");
});

test("revision owns a recursively immutable body independent from its source", () => {
  const source = { nested: { list: ["one"], guidance: { version: "v1" } } };
  const reviewed = submitForReview(createDraftRevision({ id: contentRevisionId("revision_deep_1"), body: source }));
  source.nested.list.push("later"); source.nested.guidance.version = "v2";
  assert.deepEqual(reviewed.body, { nested: { list: ["one"], guidance: { version: "v1" } } });
  assert.throws(() => (reviewed.body.nested.list as string[]).push("blocked"));
  assert.throws(() => { (reviewed.body.nested.guidance as { version: string }).version = "blocked"; });
  assert.equal(reviewed.bodyHash, createDraftRevision({ id: contentRevisionId("revision_deep_2"), body: { nested: { list: ["one"], guidance: { version: "v1" } } } }).bodyHash);
});

test("approval and publication preserve the reviewed body hash and later changes fork a new draft", () => {
  const reviewed = submitForReview(createDraftRevision({ id: contentRevisionId("revision_gradient_1"), body }));
  const approved = approveRevision(reviewed);
  const published = publishRevision(approved);
  const successor = editRevision(published, { ...body, microSkill: { ...body.microSkill, title: "Changed" } }, contentRevisionId("revision_gradient_2"));

  assert.equal(approved.bodyHash, reviewed.bodyHash);
  assert.equal(published.bodyHash, reviewed.bodyHash);
  assert.equal(successor.lifecycle, "DRAFT");
  assert.equal(successor.id, contentRevisionId("revision_gradient_2"));
  assert.equal(published.body.microSkill.title, "Find gradient");
});
