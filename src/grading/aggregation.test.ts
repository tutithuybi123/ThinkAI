import assert from "node:assert/strict";
import test from "node:test";
import { deriveGradingOutcome } from "./aggregation.js";
const input={deterministic:{applicability:"not_applicable" as const},shape:{finalAnswerFacet:"required" as const,reasoningFacet:"required" as const,requiredCriterionIds:["m"],optionalCriterionIds:[]},criterionIds:["m"],contentVersion:"c",taskVersion:"t",rubricVersion:"r",rubric:{finalAnswer:"correct",reasoning:"correct",criteria:[{id:"m",status:"correct"}],errors:[],confidence:"low",evaluatorVersion:"e"}};
test("server derives correct only from valid complete facets",()=>assert.equal(deriveGradingOutcome(input).outcome,"CORRECT"));
test("unavailable or conflicting evidence fails closed",()=>{assert.equal(deriveGradingOutcome({...input,rubric:undefined}).outcome,"UNCERTAIN");assert.equal(deriveGradingOutcome({...input,deterministic:{applicability:"applicable",score:{outcome:"incorrect",scorerVersion:"s",answerSpecVersion:"a"}}}).outcome,"UNCERTAIN");});
