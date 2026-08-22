import assert from "node:assert/strict";
import test from "node:test";
import { actorId, challengeSessionId } from "../domain/ids.js";
import { SignedSessionService } from "../auth/session.js";
import { apiServicesFromRuntime, handleHttp } from "./http.js";

test("production API composition exposes server-owned Practice view, continuation and feedback",async()=>{
 const actor=actorId("actor_runtime_api");const auth=new SignedSessionService("0123456789abcdef0123456789abcdef");const token=auth.issue({actorId:actor,role:"learner",sessionId:"session_runtime_api",ttlMs:60000});const session=challengeSessionId("challenge_runtime_api");
 const runtime={auth,practice:{},transfer:{},receipts:{},demo:{},contentRevisions:{},ops:{},home:async()=>({}),skills:async()=>({}),progress:async()=>({}),audit:async()=>({}),health:async()=>({status:"ok",persistence:"available",ai:"disabled"}),close:async()=>{},startPublishedPractice:async()=>({}),practiceCompanion:async()=>({}),practiceLearnerView:async()=>({sessionId:session,nextAction:"CONTINUE_PRACTICE"}),advancePractice:async()=>({nextAction:"READY_FOR_TRANSFER"}),practiceProcessFeedback:async()=>({message:"Hãy kiểm tra lại bước biến đổi."}),sessionBootstrap:{issueLearner:async()=>({token:"",actorId:actor,role:"learner" as const}),issueStaff:async()=>({token:"",actorId:actor,role:"presenter" as const})}} as any;
 const services=apiServicesFromRuntime(runtime); const headers={authorization:`Bearer ${token}`,"Idempotency-Key":"runtime-api"};
 assert.equal((await handleHttp(runtime,{method:"GET",path:`/api/v1/challenges/${session}`,headers})).status,200);
 assert.equal((await handleHttp(runtime,{method:"GET",path:`/api/v1/challenges/${session}/process-feedback`,headers})).status,200);
 assert.equal((await handleHttp(runtime,{method:"POST",path:`/api/v1/challenges/${session}/next`,headers,body:{}})).status,200);
 assert.equal(typeof services.advancePractice,"function");
});
