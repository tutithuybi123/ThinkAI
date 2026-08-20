import assert from "node:assert/strict";
import test from "node:test";
import { satisfiesGradingGate } from "./gate-policy.js";
test("only correct crosses the server grading gate",()=>{assert.equal(satisfiesGradingGate("CORRECT"),true);for(const x of ["PARTIALLY_CORRECT","INCORRECT","UNCERTAIN"] as const)assert.equal(satisfiesGradingGate(x),false);});
