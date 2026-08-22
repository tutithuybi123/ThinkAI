import type { PracticeGate } from "../content/v11-validator.js";

export type PracticeNextAction="CONTINUE_PRACTICE"|"READY_FOR_TRANSFER"|"PRACTICE_RECOVERY";
/** Pure server policy over exact, authoritative score records; callers never accept browser counts. */
export function derivePracticeNextAction(gate:PracticeGate, evidence:readonly {pairId:string;pairVersion:string;taskId:string;taskVersion:string;outcome:"CORRECT"|"PARTIALLY_CORRECT"|"INCORRECT"|"UNCERTAIN"}[]):PracticeNextAction { const correct=new Set(evidence.filter(x=>x.outcome==="CORRECT").map(x=>`${x.pairId}|${x.pairVersion}|${x.taskId}|${x.taskVersion}`)); if(correct.size>=gate.requiredCorrectCount)return "READY_FOR_TRANSFER"; return evidence.length>=gate.maxPracticeItems?"PRACTICE_RECOVERY":"CONTINUE_PRACTICE"; }
