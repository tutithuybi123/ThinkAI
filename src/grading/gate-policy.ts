import type { GradingOutcome } from "./contracts.js";
/** Only server-derived CORRECT may satisfy a Practice or Transfer grading gate. */
export const satisfiesGradingGate=(outcome:GradingOutcome):boolean=>outcome==="CORRECT";
