import assert from "node:assert/strict";
import test from "node:test";
import { generatePracticeProcessFeedback } from "./process-feedback.js";
test("Practice Process Feedback is non-authoritative and practice-shaped",async()=>{const feedback=await generatePracticeProcessFeedback({feedback:async x=>({message:`You explained ${x.practiceAnswer}`})},{mode:"practice",practiceAnswer:"my work",assistanceCount:2,taskVersion:"t1",rubricVersion:"r1",evaluatorVersion:"e1"});assert.equal(feedback?.nonAuthoritative,true);assert.equal(feedback?.kind,"practice_process_feedback");});
