import assert from "node:assert/strict";
import test from "node:test";
import { validateRubricFacetEvaluation } from "./rubric-validation.js";

const shape={finalAnswerFacet:"required" as const,reasoningFacet:"required" as const,requiredCriterionIds:["method"],optionalCriterionIds:["notation"]};
const valid={finalAnswer:"correct",reasoning:"correct",criteria:[{id:"method",status:"correct"}],errors:[],confidence:"low",evaluatorVersion:"eval-v1"};
test("accepts complete known rubric facets without granting an outcome",()=>assert.deepEqual(validateRubricFacetEvaluation(valid,shape,["method","notation"]),[]));
test("fails closed for unknown, missing, duplicate, and uncertain required criteria",()=>{assert.ok(validateRubricFacetEvaluation({...valid,criteria:[{id:"unknown",status:"correct"}]},shape,["method","notation"]).length);assert.ok(validateRubricFacetEvaluation({...valid,criteria:[]},shape,["method","notation"]).length);assert.ok(validateRubricFacetEvaluation({...valid,criteria:[{id:"method",status:"correct"},{id:"method",status:"correct"}]},shape,["method"]).length);assert.ok(validateRubricFacetEvaluation({...valid,criteria:[{id:"method",status:"uncertain"}]},shape,["method"]).length);});
test("malformed evaluator evidence and confidence fail closed",()=>{assert.ok(validateRubricFacetEvaluation({...valid,confidence:"certain"} as unknown,shape,["method"]).length);assert.ok(validateRubricFacetEvaluation({criteria:"nope"} as unknown,shape,["method"]).length);});
