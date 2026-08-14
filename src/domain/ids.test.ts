import assert from "node:assert/strict";
import test from "node:test";

import { skillId, taskId } from "./ids.js";

test("ID constructors enforce the frozen entity prefixes", () => {
  assert.equal(skillId("skill_demo"), "skill_demo");
  assert.throws(() => taskId("skill_wrong"), /Expected task_/);
});
