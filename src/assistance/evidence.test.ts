import assert from "node:assert/strict";
import test from "node:test";
import { actorId,challengeSessionId,evidenceEventId,skillId,taskFamilyId,taskId } from "../domain/ids.js";
import { assistanceEvidence } from "./evidence.js";
test("assistance evidence is server-authored and version-bound",()=>{const event=assistanceEvidence({id:evidenceEventId("event_assist"),actorId:actorId("actor_assist"),challengeSessionId:challengeSessionId("challenge_assist"),skillId:skillId("skill_assist"),taskId:taskId("task_assist"),taskVersion:"1",taskFamilyId:taskFamilyId("family_assist"),guidanceVersion:"g1",occurredAt:"2026-08-20T00:00:00Z",record:{supportLevel:"PROMPT",messageId:"m",occurredAt:"2026-08-20T00:00:00Z",answerRevealAttempted:false,answerRevealed:false,responseBlocked:false}});assert.equal(event.type,"practice_assistance_recorded");assert.equal(event.payload.guidanceVersion,"g1");});
