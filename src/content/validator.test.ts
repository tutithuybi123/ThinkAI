import assert from "node:assert/strict";
import test from "node:test";

import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { validateContentBundle } from "./validator.js";

test("Package A structural fixture satisfies the approved content contract", () => {
  const result = validateContentBundle(packageAStructuralFixture);
  assert.equal(result.valid, true, JSON.stringify(result.issues));
  assert.deepEqual(result.issues, []);
});

test("validator rejects a pair without a declared changed representation/context/route", () => {
  const invalid = {
    ...packageAStructuralFixture,
    taskPairs: [{ ...packageAStructuralFixture.taskPairs[0]!, changeDimensions: [] }],
  };
  const result = validateContentBundle(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_PAIR"));
});

test("validator rejects a transfer task used as an intervention target", () => {
  const invalid = {
    ...packageAStructuralFixture,
    interventions: packageAStructuralFixture.interventions.map((hint, index) =>
      index === 0 ? { ...hint, taskId: packageAStructuralFixture.tasks[1]!.id } : hint,
    ),
  };
  const result = validateContentBundle(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_INTERVENTION"));
});

test("validator rejects content that is not approved and traceable", () => {
  const invalid = {
    ...packageAStructuralFixture,
    skills: [{ ...packageAStructuralFixture.skills[0]!, review: { ...packageAStructuralFixture.skills[0]!.review, status: "draft" as const, reviewerId: "" } }],
  };
  const result = validateContentBundle(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_REVIEW"));
});

test("validator requires exactly three reviewed practice interventions for an active pair", () => {
  const invalid = { ...packageAStructuralFixture, interventions: packageAStructuralFixture.interventions.slice(0, 2) };
  const result = validateContentBundle(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes("exactly three")));
});
