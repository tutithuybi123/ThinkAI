import assert from "node:assert/strict";
import test from "node:test";
import { contentRevisionId } from "../domain/ids.js";
import { OpsService } from "./service.js";
test("Ops service delegates lifecycle only to the shared revision repository",async()=>{const calls:string[]=[];const ops=new OpsService({createDraft:async(x:any)=>(calls.push("create"),x),submitForReview:async()=>{calls.push("review");return{};}} as any);await ops.createDraft({id:contentRevisionId("revision_ops"),body:{microSkills:[]}});await ops.submitReview(contentRevisionId("revision_ops"));assert.deepEqual(calls,["create","review"]);});
test("Ops overview and edit use the same repository and only its draft edit boundary",async()=>{const calls:string[]=[];const repository={listRevisions:async()=>{calls.push("list");return[]},editDraft:async(id:any,body:any)=>{calls.push(`edit:${id}`);return {id,body,lifecycle:"DRAFT"}}};const ops=new OpsService(repository as any);await ops.list();await ops.editDraft(contentRevisionId("revision_ops_edit"),{microSkills:[]});assert.deepEqual(calls,["list","edit:revision_ops_edit"]);});
