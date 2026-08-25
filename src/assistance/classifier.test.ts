import assert from "node:assert/strict";
import test from "node:test";
import { classifyCompanionCandidate } from "./classifier.js";
test("server blocks candidate final answers and owns support classification",()=>{const blocked=classifyCompanionCandidate({reply:"The final answer is 4",proposedSupportLevel:"STRONG_SCAFFOLD"});assert.equal(blocked.responseBlocked,true);assert.equal(blocked.answerRevealAttempted,true);assert.equal(blocked.reply,undefined);assert.equal(classifyCompanionCandidate({reply:"Try rise over run",proposedSupportLevel:"forged"}).supportLevel,"PROMPT");});

test("server blocks Vietnamese and symbolic task-specific answer disclosures",()=>{
  for(const reply of ["Đáp án là x > 5.","Kết quả bài này là f(x) < 0.","Vậy dấu cần điền là > 0.","\n```\n< 0\n```"]){
    const result=classifyCompanionCandidate({reply,proposedSupportLevel:"CONCEPTUAL_HINT"});
    assert.equal(result.responseBlocked,true,reply);
    assert.equal(result.answerRevealAttempted,true,reply);
  }
});
