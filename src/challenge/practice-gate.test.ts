import assert from "node:assert/strict";
import test from "node:test";
import { derivePracticeNextAction } from "./practice-gate.js";
const gate={policyVersion:"practice-gate/v1" as const,strategy:"distinct-correct-count" as const,requiredCorrectCount:2,maxPracticeItems:3};
const correct={pairId:"p",pairVersion:"1",taskId:"t",taskVersion:"1",outcome:"CORRECT" as const};
test("Practice gate counts only distinct authoritative correct evidence",()=>{assert.equal(derivePracticeNextAction(gate,[correct,correct]),"CONTINUE_PRACTICE");assert.equal(derivePracticeNextAction(gate,[correct,{...correct,pairId:"p2",taskId:"t2"}]),"READY_FOR_TRANSFER");assert.equal(derivePracticeNextAction(gate,[{...correct,outcome:"UNCERTAIN"},{...correct,outcome:"INCORRECT"},{...correct,outcome:"PARTIALLY_CORRECT"}]),"PRACTICE_RECOVERY");});
