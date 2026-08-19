#!/usr/bin/env node
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { acquireBenchmarkLock } from "./benchmark-lock.mjs";
import { State, recover } from "./checkpoint-fence.mjs";
import { buildResponsesRequest, feedbackSchema, hash, loadBenchmarkEnv, normalizeResponsesPayload, sendResponses, validateFeedback } from "./codex-responses.mjs";
import { certifyResults } from "./certification.mjs";

const here=import.meta.dirname, mode=process.argv[2]??"matrix", root=resolve(here,"private/cockpit-qualification");
const envFile=resolve(process.cwd(),".env.benchmark.local"), {env,missing}=loadBenchmarkEnv(await readFile(envFile,"utf8")); if(missing.length) throw Error(`BENCHMARK CONFIG MISSING: ${missing.join(",")}`);
const data=JSON.parse(await readFile(resolve(here,"thinkai-feedback-eval.json"),"utf8")); await mkdir(root,{recursive:true}); const journalPath=resolve(root,`${mode}.journal.jsonl`), lock=await acquireBenchmarkLock(`${journalPath}.lock`,mode);
const append=async row=>appendFile(journalPath,`${JSON.stringify(row)}\n`);
let journal=[]; try{journal=(await readFile(journalPath,"utf8")).trim().split("\n").filter(Boolean).map(JSON.parse);}catch(e){if(e.code!=="ENOENT") throw e;}
const state=new Map(recover(journal).map(x=>[x.runId,x]));
const models=(process.env.THINKAI_BENCH_QUAL_MODELS??"gpt-5.4-mini").split(","), count=Number(process.env.THINKAI_BENCH_STRESS_CALLS??1);
const jobs=models.flatMap(model=>Array.from({length:count},(_,index)=>({model,index,case:data.cases[index%data.cases.length]})));
async function run(job){const runId=`${mode}:${job.model}:high:${job.case.id}:${job.index}`, prior=state.get(runId); if(prior?.state===State.COMPLETED||prior?.state===State.UNKNOWN_AFTER_CRASH||prior?.state===State.TERMINAL_FAILURE)return; const inflight={runId,state:State.IN_FLIGHT,at:new Date().toISOString()}; await append(inflight); state.set(runId,inflight); try{const raw=await sendResponses({env,body:buildResponsesRequest({model:job.model,input:JSON.stringify(job.case.input),instructions:"Return bounded ThinkAI feedback JSON only.",reasoningEffort:"high",maxOutputTokens:180,jsonSchema:feedbackSchema}),timeoutMs:15000}); const result=normalizeResponsesPayload(raw,{provider:"cockpit-responses",requestedModel:job.model,caseId:job.case.id,runId,configuration:{datasetSha256:hash(JSON.stringify(data))},latencyMs:0,expectStructured:true}); result.hardGateResults=validateFeedback(result.structuredOutput); await append({runId,state:State.COMPLETED,result,at:new Date().toISOString()}); state.set(runId,{runId,state:State.COMPLETED,result});}catch(error){const terminal={runId,state:State.TERMINAL_FAILURE,error:{status:error.status??null,message:String(error.message).slice(0,160)},at:new Date().toISOString()}; await append(terminal); state.set(runId,terminal);}}
try{for(const job of jobs)await run(job); const rows=[...state.values()].filter(x=>x.state===State.COMPLETED).map(x=>x.result).concat([...state.values()].filter(x=>x.state===State.TERMINAL_FAILURE).map(x=>({requestStatus:"error",hardGateResults:[],error:x.error}))); const certification=certifyResults(rows); console.log(JSON.stringify({mode,certification})); if(certification.status!=="PASS")process.exitCode=2;}finally{await lock.release();}
