import assert from "node:assert/strict";
import test from "node:test";
import {OpenAICompatibleCompanionAdapter,OpenAICompatibleProvider,providerConfigFromEnvironment} from "./openai-compatible.js";
test("provider selection is explicit and configuration-driven",()=>{assert.deepEqual(providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter",TOKENROUTER_BASE_URL:"https://router",TOKENROUTER_API_KEY:"secret",THINKAI_AI_MODEL:"fixed-model"}),{provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"});assert.throws(()=>providerConfigFromEnvironment({THINKAI_AI_PROVIDER:"tokenrouter"}),/Qualified/);});

test("provider transport failures are a safe unavailable boundary",async()=>{const provider=new OpenAICompatibleProvider({provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"},async()=>new Response("temporarily unavailable",{status:503}));await assert.rejects(provider.complete({system:"system",user:"user"}),(error:unknown)=>typeof error==="object"&&error!==null&&(error as {code?:unknown}).code==="AI_UNAVAILABLE");});
test("provider retries one transient 503 before accepting a completion",async()=>{let attempts=0;const provider=new OpenAICompatibleProvider({provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"},async()=>{attempts+=1;return attempts===1?new Response("temporarily unavailable",{status:503}):new Response(JSON.stringify({choices:[{message:{content:"ok"}}]}));});assert.equal((await provider.complete({system:"system",user:"user"})).text,"ok");assert.equal(attempts,2);});
test("provider retries one transient transport failure before accepting a completion",async()=>{let attempts=0;const provider=new OpenAICompatibleProvider({provider:"tokenrouter",baseUrl:"https://router",apiKey:"secret",model:"fixed-model"},async()=>{attempts+=1;if(attempts===1)throw new DOMException("timed out","AbortError");return new Response(JSON.stringify({choices:[{message:{content:"ok"}}]}));});assert.equal((await provider.complete({system:"system",user:"user"})).text,"ok");assert.equal(attempts,2);});

test("Companion provider request carries only bound learner-safe task guidance", async () => {
  let body: { messages?: Array<{ role?: string; content?: string }> } | undefined;
  const provider = new OpenAICompatibleProvider({ provider: "tokenrouter", baseUrl: "https://router", apiKey: "secret", model: "fixed-model" }, async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ model: "fixed-model", choices: [{ message: { content: "Hãy xác định vùng của điểm." } }] }), { status: 200, headers: { "content-type": "application/json" } });
  });
  await new OpenAICompatibleCompanionAdapter(provider).reply({ learnerMessage: "Em bắt đầu thế nào?", guidanceVersion: "guidance-a", taskContext: { practiceTaskId: "task-a", practiceTaskVersion: "1", prompt: "Xét dấu f(x).", commonMisconceptions: ["Đừng bỏ qua hệ số đầu."], allowedSupportLevels: ["PROMPT", "CONCEPTUAL_HINT"] } });
  const system = body?.messages?.find((message) => message.role === "system")?.content ?? "";
  const learnerContext = body?.messages?.find((message) => message.role === "user")?.content ?? "";
  assert.doesNotMatch(system, /Xét dấu f\(x\)|Đừng bỏ qua hệ số đầu/);
  assert.match(learnerContext, /Xét dấu f\(x\)/);
  assert.match(learnerContext, /Đừng bỏ qua hệ số đầu/);
  assert.match(learnerContext, /Allowed levels/);
  const serialized = JSON.stringify(body);
  assert.doesNotMatch(serialized, /transfer-task-prompt/i);
  assert.doesNotMatch(serialized, /hidden-reference-solution|hidden-expected-answer|transfer-task-prompt/i);
});
