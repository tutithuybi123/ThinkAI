import assert from "node:assert/strict";
import test from "node:test";

import { taskId } from "../domain/ids.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { ContentLoadError, loadReviewedContentBundle } from "./loader.js";
import { ReviewedContentRepository } from "./repository.js";

test("production loader rejects structural-only content fixtures", () => {
  assert.throws(() => loadReviewedContentBundle(packageAStructuralFixture), ContentLoadError);
});

test("test-only loader creates a reviewed repository and stable pair snapshot", () => {
  const repository = ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  const snapshot = repository.createPairSnapshot(packageAStructuralFixture.taskPairs[0]!.id);
  assert.equal(snapshot.interventions.length, 3);
  assert.match(snapshot.integrityKey, /pair_fixture@1/);
  assert.doesNotThrow(() => repository.assertSnapshotIntegrity(snapshot));
});

test("repository cannot expose an unsupported task or a changed content snapshot", () => {
  const repository = ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  assert.throws(() => repository.getTask(taskId("task_missing")), /unavailable/);

  const snapshot = repository.createPairSnapshot(packageAStructuralFixture.taskPairs[0]!.id);
  const drifted = {
    ...snapshot,
    integrityKey: `${snapshot.integrityKey}|drift`,
  };
  assert.throws(() => repository.assertSnapshotIntegrity(drifted), /integrity mismatch/);
});

test("loader rejects unsupported answer specification kinds rather than accepting unknown runtime data", () => {
  const invalid = structuredClone(packageAStructuralFixture) as unknown as Record<string, unknown>;
  const tasks = invalid.tasks as Array<Record<string, unknown>>;
  tasks[0]!.answerSpec = { kind: "llm_guess", normalizationVersion: "none" };
  assert.throws(() => loadReviewedContentBundle(invalid, { allowStructuralTestFixture: true }), ContentLoadError);
});

test("loader rejects a task-pair whose content snapshot references mismatched skill content", () => {
  const invalid = {
    ...packageAStructuralFixture,
    tasks: packageAStructuralFixture.tasks.map((task, index) => (index === 1 ? { ...task, familyId: packageAStructuralFixture.taskFamilies[0]!.id } : task)),
  };
  const result = () => ReviewedContentRepository.fromRaw(invalid, { allowStructuralTestFixture: true });
  assert.throws(result, ContentLoadError);
});

test("loader rejects incomplete versioned task and intervention metadata", () => {
  const invalid = {
    ...packageAStructuralFixture,
    tasks: [{ ...packageAStructuralFixture.tasks[0]!, version: "", prompt: { format: "plain_text" as const, body: "" } }, ...packageAStructuralFixture.tasks.slice(1)],
    interventions: [{ ...packageAStructuralFixture.interventions[0]!, version: "", title: "", body: { format: "plain_text" as const, body: "" } }, ...packageAStructuralFixture.interventions.slice(1)],
  };
  assert.throws(() => ReviewedContentRepository.fromRaw(invalid, { allowStructuralTestFixture: true }), ContentLoadError);
});
