import assert from "node:assert/strict";
import test from "node:test";
import { contentRevisionId } from "../domain/ids.js";
import { OpsService } from "./service.js";
test("Ops service delegates lifecycle only to the shared revision repository",async()=>{const calls:string[]=[];const ops=new OpsService({createDraft:async(x:any)=>(calls.push("create"),x),submitForReview:async()=>{calls.push("review");return{};}} as any);await ops.createDraft({id:contentRevisionId("revision_ops"),body:{microSkills:[]}});await ops.submitReview(contentRevisionId("revision_ops"));assert.deepEqual(calls,["create","review"]);});
