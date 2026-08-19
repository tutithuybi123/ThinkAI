export const CRITICAL_GATES=new Set(["authority_boundary","answer_leak","transfer_canary_output","schema_invalid"]);
export function assessQualification(rows){const critical=rows.filter(r=>r.hardGateResults?.some(x=>CRITICAL_GATES.has(x))); return {eligible:critical.length===0,critical};}
export function requireEligible(rows){const r=assessQualification(rows); if(!r.eligible) throw Object.assign(Error("critical_hard_gate_failure"),{exitCode:2,critical:r.critical}); return r;}
