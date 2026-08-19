import { assessQualification } from "./qualification-gates.mjs";
import { writeFile, access } from "node:fs/promises";
export function certifyResults(rows,{P0=0,P1=0}={}){const gate=assessQualification(rows);const providerFailures=rows.filter(r=>r.requestStatus==="error");const eligible=gate.eligible;const status=eligible&&P0===0&&P1===0?"PASS":"FAIL";return {status,eligible,hardGateViolations:gate.critical,providerFailures,P0,P1};}
export async function writeFreeze(path,certification){if(certification.status!=="PASS"||!certification.eligible||certification.P0!==0||certification.P1!==0)throw Object.assign(Error("freeze_refused"),{exitCode:2});await writeFile(path,JSON.stringify({version:"thinkai-feedback-bench-v1",certification},null,2),{flag:"wx"});}
