import assert from "node:assert/strict";
import test from "node:test";
import { actorId, contentRevisionId, taskId, taskPairId } from "../domain/ids.js";
import { selectFreshPracticePair } from "./selection.js";

const pair=(id:string)=>({id:taskPairId(id),version:"1",microSkillRevisionId:contentRevisionId("revision_practice"),practiceTask:{id:taskId(`task_${id}_practice`),version:"1",role:"practice" as const},transferTask:{id:taskId(`task_${id}_transfer`),version:"1",role:"transfer" as const}});
test("fresh Practice selection fails closed when every pair has been exposed",()=>{
  const pairs=[pair("pair_one"),pair("pair_two")];
  const selected=selectFreshPracticePair({ actorId:actorId("actor_practice"), microSkillRevisionId:contentRevisionId("revision_practice"), ordinal:2, eligiblePairs:pairs, exposedPairs:pairs.map(x=>({pairId:x.id,pairVersion:x.version})) });
  assert.deepEqual(selected,{kind:"NO_FRESH_PRACTICE_AVAILABLE"});
});
