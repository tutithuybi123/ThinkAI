import { hostname } from "node:os";
import { open, readFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const localHost = hostname();
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
function parse(text) { let x; try { x=JSON.parse(text); } catch { throw Error("lock_malformed_fail_closed"); } if (!Number.isInteger(x.pid)||typeof x.runId!=="string"||typeof x.hostname!=="string"||typeof x.createdAt!=="string"||typeof x.ownerToken!=="string"||!x.ownerToken) throw Error("lock_malformed_fail_closed"); return x; }
export async function acquireBenchmarkLock(path, runId) {
  const owner={version:1,pid:process.pid,runId,hostname:localHost,createdAt:new Date().toISOString(),ownerToken:randomUUID()};
  try { const h=await open(path,"wx"); await h.writeFile(JSON.stringify(owner)); return lease(path,owner,h); }
  catch(e) { if(e.code!=="EEXIST") throw e; const prior=parse(await readFile(path,"utf8")); if(prior.hostname!==localHost||alive(prior.pid)) throw Error(`lock_owned_by_live_process:${prior.runId}`); const claim=`${path}.reclaim-${owner.ownerToken}`; try { await rename(path,claim); } catch { return acquireBenchmarkLock(path,runId); } try { return await acquireBenchmarkLock(path,runId); } finally { await unlink(claim).catch(()=>{}); } }
}
function lease(path,owner,handle){ return {owner,release:async()=>{ await handle.close(); let current; try{current=parse(await readFile(path,"utf8"));}catch{return;} if(current.ownerToken===owner.ownerToken) await unlink(path).catch(()=>{}); }}; }
