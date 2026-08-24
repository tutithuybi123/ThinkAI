import assert from "node:assert/strict";
import test from "node:test";
import { LiveRubricEvaluator } from "./live-rubric-evaluator.js";

test("live evaluator sends only the learner solution and concise reviewed facets to the provider", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = { ...process.env };
  let request: { messages?: Array<{ role?: string; content?: string }> } | undefined;
  try {
    process.env.THINKAI_AI_PROVIDER = "tokenrouter";
    process.env.TOKENROUTER_BASE_URL = "https://router.example";
    process.env.TOKENROUTER_API_KEY = "secret";
    process.env.THINKAI_AI_MODEL = "fixed-model";
    globalThis.fetch = async (_url, init) => {
      request = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ finalAnswer: "correct", reasoning: "correct", criteria: [{ id: "criterion_a", status: "correct" }], errors: [], confidence: "high", evaluatorVersion: "fixed-model" }) } }] }));
    };
    await new LiveRubricEvaluator().evaluate({ taskVersion: "1", rubricVersion: "guidance/v1", rawText: "Lập luận hợp lệ.", expectedResult: "f(3) < 0", criteria: [{ id: "criterion_a", description: "Nêu quan hệ dấu đúng." }], shape: { finalAnswerFacet: "not_applicable", reasoningFacet: "required", requiredCriterionIds: ["criterion_a"], optionalCriterionIds: [] } } as never);
    const user = request?.messages?.find((message) => message.role === "user")?.content ?? "";
    assert.match(user, /Bài làm: Lập luận hợp lệ\./);
    assert.match(user, /criterion_a/);
    assert.match(user, /Nêu quan hệ dấu đúng/);
    assert.doesNotMatch(user, /expectedResult|gradingShape|taskVersion|rubricVersion/);
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnvironment;
  }
});
