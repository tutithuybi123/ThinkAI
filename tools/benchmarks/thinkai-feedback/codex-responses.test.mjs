import assert from "node:assert/strict";
import { assertUniqueRunIds, normalizeResponsesPayload, redactedHeaders, retryTransient, statelessToolReplayInput, validateFeedback } from "./codex-responses.mjs";

assert.deepEqual(redactedHeaders({ Authorization: "Bearer secret", Cookie: "x", "x-openai-actor-authorization": "cockpit-tools" }), { Authorization: "[REDACTED]", Cookie: "[REDACTED]", "x-openai-actor-authorization": "cockpit-tools" });
const normalized = normalizeResponsesPayload({ id: "resp_1", model: "gpt-5.6-sol", status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "{\"summary\":\"Tốt\",\"whatWasUseful\":\"Có bước làm\",\"nextStep\":\"Kiểm tra dấu\",\"feedbackType\":\"inspect_step\",\"shouldWithholdSolution\":true}" }] }], usage: { input_tokens: 12, output_tokens: 8 } }, { provider: "cockpit-responses", requestedModel: "gpt-5.6-sol", caseId: "C01", runId: "r1", configuration: { reasoningEffort: "high" }, latencyMs: 20 });
assert.equal(normalized.textOutput.includes("summary"), true);
assert.deepEqual(validateFeedback(normalized.structuredOutput), []);
let attempts = 0;
const retried = await retryTransient(async () => { attempts++; if (attempts < 2) throw Object.assign(new Error("temporary"), { status: 503 }); return "ok"; }, { maxAttempts: 2, baseDelayMs: 0 });
assert.equal(retried.value, "ok"); assert.equal(retried.attempts, 2);
assert.throws(() => assertUniqueRunIds([{runId:"same"},{runId:"same"}]), /duplicate_or_missing_run_id/);
assert.deepEqual(statelessToolReplayInput([{ type: "reasoning", id: "rs_1" }, { type: "function_call", call_id: "call_1", name: "submit_feedback", arguments: "{}" }], "call_1", { accepted: true }), [{ type: "reasoning", id: "rs_1" }, { type: "function_call", call_id: "call_1", name: "submit_feedback", arguments: "{}" }, { type: "function_call_output", call_id: "call_1", output: "{\"accepted\":true}" }]);
console.log("codex Responses adapter tests passed");
