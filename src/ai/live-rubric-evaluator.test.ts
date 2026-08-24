import assert from "node:assert/strict";
import test from "node:test";
import { LiveRubricEvaluator } from "./live-rubric-evaluator.js";

test("live evaluator sends only the learner solution and concise reviewed facets to the provider", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = { ...process.env };
  const requests: { messages?: Array<{ role?: string; content?: string }> }[] = [];
  try {
    process.env.THINKAI_AI_PROVIDER = "tokenrouter";
    process.env.TOKENROUTER_BASE_URL = "https://router.example";
    process.env.TOKENROUTER_API_KEY = "secret";
    process.env.THINKAI_AI_MODEL = "fixed-model";
    let calls = 0;
    globalThis.fetch = async (_url, init) => {
      calls += 1;
      requests.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ criterionId: calls === 1 ? "criterion_a" : "criterion_b", status: "correct", confidence: "high" }) } }] }));
    };
    const result = await new LiveRubricEvaluator().evaluate({ taskVersion: "1", rubricVersion: "guidance/v1", rawText: "Lập luận hợp lệ.", expectedResult: "f(3) < 0", criteria: [{ id: "criterion_a", description: "Nêu quan hệ dấu đúng." }, { id: "criterion_b", description: "Suy ra kết luận đúng." }], shape: { finalAnswerFacet: "not_applicable", reasoningFacet: "required", requiredCriterionIds: ["criterion_a", "criterion_b"], optionalCriterionIds: [] } } as never) as { criteria?: unknown; evaluatorVersion?: unknown; reasoning?: unknown };
    const users = requests.map((request) => request.messages?.find((message) => message.role === "user")?.content ?? "");
    assert.match(users[0] ?? "", /Bài làm: Lập luận hợp lệ\./);
    assert.match(users[0] ?? "", /criterion_a/);
    assert.match(users[0] ?? "", /Nêu quan hệ dấu đúng/);
    assert.doesNotMatch(users.join("\n"), /expectedResult|gradingShape|taskVersion|rubricVersion/);
    assert.match(users[1] ?? "", /\"criterionId\":\"criterion_b\"/);
    assert.deepEqual(result.criteria, [{ id: "criterion_a", status: "correct" }, { id: "criterion_b", status: "correct" }]);
    assert.equal(result.reasoning, "correct");
    assert.equal(result.evaluatorVersion, "fixed-model");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnvironment;
  }
});
