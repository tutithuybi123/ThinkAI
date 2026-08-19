import assert from "node:assert/strict";
import { configurationCoverage, summary, validate } from "./run.mjs";

assert.deepEqual(validate({ message: "Kiểm tra lại phép chia." }, { forbiddenAnswerTokens: ["x=4"] }), []);
assert.ok(validate({ message: "Đáp án là x=4." }, { forbiddenAnswerTokens: ["x=4"] }).includes("serious_answer_leak"));
assert.ok(validate({ message: "Một. Hai. Ba." }, {}).includes("too_many_sentences"));
const report = summary([{ success: false, response: null, issues: ["request_failure"], latencyMs: 4000, httpStatus: 0, cost: null }]);
assert.equal(report.schemaValidRate, 0);
assert.equal(report.localPolicyValidRate, 0);
const routed = [{ modelRequested: "openai/gpt-5-mini", modelReturned: "openai/gpt-5-mini", provider: "provider-a" }];
assert.equal(configurationCoverage(routed, 1, true, { created: 1 }).completeFullScopeConfiguration, true);
assert.equal(configurationCoverage([{ ...routed[0], modelReturned: "other/model" }], 1, true, { created: 1 }).completeFullScopeConfiguration, false);
assert.equal(configurationCoverage(routed, 1, true, { created: null }).completeFullScopeConfiguration, false);
console.log("thinkai benchmark evaluator tests passed");
