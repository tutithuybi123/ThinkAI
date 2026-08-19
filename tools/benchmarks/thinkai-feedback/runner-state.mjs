import { State, recover } from "./checkpoint-fence.mjs";
import { requireEligible } from "./qualification-gates.mjs";
export function resumeJournal(rows){return recover(rows).filter(x=>x.state===State.COMPLETED).map(x=>x.runId);}
export async function executeJob({runId,journal,dispatch}){journal.push({runId,state:State.IN_FLIGHT}); const result=await dispatch(); journal.push({runId,state:State.COMPLETED,result}); return result;}
export function certify(rows){return requireEligible(rows.filter(x=>x.state===State.COMPLETED).map(x=>x.result));}
