import assert from "node:assert/strict";
import test from "node:test";
import { classifyCompanionCandidate } from "./classifier.js";
test("server blocks candidate final answers and owns support classification",()=>{const blocked=classifyCompanionCandidate({reply:"The final answer is 4",proposedSupportLevel:"STRONG_SCAFFOLD"});assert.equal(blocked.responseBlocked,true);assert.equal(blocked.answerRevealAttempted,true);assert.equal(blocked.reply,undefined);assert.equal(classifyCompanionCandidate({reply:"Try rise over run",proposedSupportLevel:"forged"}).supportLevel,"PROMPT");});
