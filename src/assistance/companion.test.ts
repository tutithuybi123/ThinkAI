import assert from "node:assert/strict";
import test from "node:test";
import { PracticeCompanionService } from "./companion.js";
const context={practiceTaskId:"practice",practiceTaskVersion:"1",prompt:"Find the slope.",commonMisconceptions:[],allowedSupportLevels:["PROMPT","CONCEPTUAL_HINT"] as const};
test("provider candidates are classified before delivery and never set score policy",async()=>{const safe=new PracticeCompanionService({reply:async()=>({reply:"Consider the slope",proposedSupportLevel:"CONCEPTUAL_HINT"})},()=>new Date("2026-08-20T00:00:00Z"));const result=await safe.respond({learnerMessage:"help",guidanceVersion:"g1",messageId:"m1",taskContext:context});assert.equal(result.delivery,"Consider the slope");assert.equal(result.record.supportLevel,"CONCEPTUAL_HINT");const blocked=new PracticeCompanionService({reply:async()=>({reply:"The final answer is 4",proposedSupportLevel:"STRONG_SCAFFOLD"})});const hidden=await blocked.respond({learnerMessage:"help",guidanceVersion:"g1",messageId:"m2",taskContext:context});assert.equal(hidden.delivery,undefined);assert.equal(hidden.record.answerRevealAttempted,true);assert.equal(hidden.record.responseBlocked,true);});

test("passes exact session-bound authored guidance to the provider while server caps support", async () => {
  let received: unknown;
  const service = new PracticeCompanionService({ reply: async (input) => {
    received = input;
    return { reply: "Hãy xác định điểm đang xét thuộc khoảng nào.", proposedSupportLevel: "STRONG_SCAFFOLD" };
  }});

  const result = await service.respond({
    learnerMessage: "Em bắt đầu thế nào?", guidanceVersion: "guidance-revision-a",
    messageId: "message-guidance-a",
    taskContext: {
      practiceTaskId: "practice-a", practiceTaskVersion: "1",
      prompt: "Xét dấu của f(x).", commonMisconceptions: ["Không so sánh x với hai nghiệm."],
      allowedSupportLevels: ["PROMPT", "CONCEPTUAL_HINT"],
    },
  } as any);

  assert.deepEqual(received, {
    learnerMessage: "Em bắt đầu thế nào?", guidanceVersion: "guidance-revision-a",
    taskContext: {
      practiceTaskId: "practice-a", practiceTaskVersion: "1",
      prompt: "Xét dấu của f(x).", commonMisconceptions: ["Không so sánh x với hai nghiệm."],
      allowedSupportLevels: ["PROMPT", "CONCEPTUAL_HINT"],
    },
  });
  assert.equal(result.record.supportLevel, "PROMPT");
});
