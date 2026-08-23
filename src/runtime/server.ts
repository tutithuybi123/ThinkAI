import { readFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import { createHash } from "node:crypto";

import { PostgresSyntheticSessionRegistry, SignedSessionService, type SessionAuthenticator } from "../auth/session.js";
import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, challengeSessionId, transferSessionId, type ActorId } from "../domain/ids.js";
import { rebuildHistory, rebuildLearnerProgress, CapabilityReceiptService } from "../receipts/service.js";
import { DeterministicScoringService } from "../scoring/service.js";
import { PracticeChallengeService } from "../challenge/service.js";
import { TransferService } from "../transfer/service.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "../persistence/index.js";
import { PostgresDemoService } from "../demo/service.js";
import type { DemoFixtureSeed } from "../demo/service.js";
import { runMigrations } from "../persistence/migrations.js";
import { PostgresContentRevisionRepository } from "../content/postgres-repository.js";
import { OpsService } from "../ops/service.js";
import { CONTENT_CONTRACT_VERSION } from "../domain/policies.js";
import { LivePracticeCompanion } from "../ai/live-companion.js";
import { LivePracticeProcessFeedback } from "../ai/live-process-feedback.js";
import { LiveRubricEvaluator } from "../ai/live-rubric-evaluator.js";
import { assistanceEvidence } from "../assistance/evidence.js";
import type { AssistanceRecord } from "../assistance/contracts.js";
import { evidenceEventId, type ChallengeSessionId } from "../domain/ids.js";
import { assertPublishedEvidenceIdentity, deriveLearnerDiscovery } from "./learner-discovery.js";
import { derivePracticeNextAction } from "../challenge/practice-gate.js";
import { selectFreshPracticePair } from "../content/selection.js";
import { startFreshIndependentAttempt } from "../transfer/fresh-attempt.js";
import { createPublishedPairSnapshot } from "../content/snapshot.js";

export interface RuntimeConfiguration {
  readonly databaseUrl: string;
  readonly sessionSecret: string;
  readonly contentPath?: string;
  readonly demoSeedPath?: string;
  /** SHA-256 of the approved demo seed JSON bytes, set outside source control. */
  readonly demoSeedSha256?: string;
  /** Expected reviewed fixture version for both clean and historical seed data. */
  readonly demoSeedVersion?: string;
  /** Test-only: permits the labelled structural fixture for HTTP acceptance. */
  readonly allowStructuralTestContent?: boolean;
  /** Optional deployment-only secret that enables issuing presenter/auditor demo cookies. */
  readonly staffBootstrapSecret?: string;
  readonly cleanDemoActorId: ActorId;
  readonly historyDemoActorId: ActorId;
  /** Test composition seam; production resolves the live provider from environment. */
  readonly companion?: { respond(input: { learnerMessage: string; guidanceVersion: string; messageId: string; taskContext: import("../assistance/companion.js").PracticeCompanionTaskContext }): Promise<{ delivery?: string; record: unknown; provider: string; model: string }> };
}

export interface ProductionRuntime {
  readonly auth: SessionAuthenticator;
  readonly practice: PracticeChallengeService;
  readonly transfer: TransferService;
  readonly receipts: CapabilityReceiptService;
  readonly demo: PostgresDemoService;
  readonly contentRevisions: PostgresContentRevisionRepository;
  readonly ops: OpsService;
  readonly companion?: { respond(input: { learnerMessage: string; guidanceVersion: string; messageId: string; taskContext: import("../assistance/companion.js").PracticeCompanionTaskContext }): Promise<{ delivery?: string; record: unknown; provider: string; model: string }> };
  practiceCompanion(actor:ActorId,sessionId:ChallengeSessionId,input:{message:string;idempotencyKey:string;actorSessionId:string}):Promise<{delivery?:string}>;
  practiceLearnerView(actor:ActorId,sessionId:ChallengeSessionId):Promise<unknown>;
  advancePractice(actor:ActorId,sessionId:ChallengeSessionId,idempotencyKey:string):Promise<unknown>;
  practiceProcessFeedback(actor:ActorId,sessionId:ChallengeSessionId):Promise<{message?:string}>;
  startPublishedPractice(actor:ActorId,revisionId:string,idempotencyKey:string):Promise<unknown>;
  startPublishedTransfer(actor:ActorId,practiceSessionId:ChallengeSessionId,idempotencyKey:string,actorSessionId:string):Promise<unknown>;
  retryPublishedTransfer(actor:ActorId,transferSessionId:string,idempotencyKey:string,actorSessionId:string):Promise<unknown>;
  issueReceiptForTransfer(actor:ActorId,transferSessionId:string,idempotencyKey:string,actorSessionId:string):Promise<unknown>;
  readonly sessionBootstrap: {
    issueLearner(profile: "clean" | "history"): Promise<{ token: string; actorId: ActorId; role: "learner" }>;
    issueStaff(input: { readonly role: "presenter" | "auditor"; readonly secret: string }): Promise<{ token: string; actorId: ActorId; role: "presenter" | "auditor" }>;
  };
  /** Reset revocation is performed atomically by PostgresDemoService. */
  onDemoReset?(actor: ActorId): Promise<void>;
  home(actor: ActorId): Promise<unknown>;
  skills(actor: ActorId): Promise<unknown>;
  progress(actor: ActorId): Promise<unknown>;
  audit(auditor: ActorId, receiptId: string): Promise<unknown>;
  health(): Promise<{ status: "ok"; persistence: "available"; ai: "disabled"|"configured" }>;
  close(): Promise<void>;
}

/**
 * Explicit, server-only composition root. It never falls back to the structural
 * fixture: an approved teacher-reviewed bundle must be supplied as JSON at startup.
 */
export async function createProductionRuntime(config: RuntimeConfiguration): Promise<ProductionRuntime> {
  const bootstrapConfigured=!!(config.contentPath||config.demoSeedPath||config.demoSeedSha256||config.demoSeedVersion);
  if(bootstrapConfigured&&(!config.contentPath||!config.demoSeedPath||!config.demoSeedSha256||!config.demoSeedVersion))throw new Error("Content bootstrap fields must be supplied together.");
  const [rawContentText, rawSeedText] = bootstrapConfigured ? await Promise.all([readFile(config.contentPath!,"utf8"),readFile(config.demoSeedPath!,"utf8")]) : [undefined,undefined];
  if(rawSeedText&&createHash("sha256").update(rawSeedText,"utf8").digest("hex")!==config.demoSeedSha256)throw new Error("Configured demo seed digest does not match the supplied approved seed.");
  const rawSeed=rawSeedText?JSON.parse(rawSeedText) as DemoFixtureSeed:undefined;
  if(rawSeed&&(rawSeed.clean.fixtureVersion!==config.demoSeedVersion||rawSeed.history.fixtureVersion!==config.demoSeedVersion))throw new Error("Configured demo seed version does not match the supplied approved seed.");
  const content=rawContentText?ReviewedContentRepository.fromRaw(JSON.parse(rawContentText) as unknown,config.allowStructuralTestContent?{allowStructuralTestFixture:true}:{}) : new ReviewedContentRepository({contractVersion:CONTENT_CONTRACT_VERSION,fixtureProvenance:"teacher_reviewed",skills:[],taskFamilies:[],tasks:[],taskPairs:[],interventions:[]});
  const client = NodePostgresClient.fromConnectionString(config.databaseUrl);
  await runMigrations(client);
  const persistence = new PostgresTransactionalEvidencePersistence(client);
  const contentRevisions = new PostgresContentRevisionRepository(client);
  const ops = new OpsService(contentRevisions);
  const companion = config.companion ?? (process.env.NODE_ENV === "production" ? new LivePracticeCompanion() : undefined);
  const processFeedback = process.env.NODE_ENV === "production" ? new LivePracticeProcessFeedback() : undefined;
  const rubricEvaluator = process.env.NODE_ENV === "production" ? new LiveRubricEvaluator() : undefined;
  const scoring = new DeterministicScoringService();
  const signer = new SignedSessionService(config.sessionSecret);
  const auth = new PostgresSyntheticSessionRegistry(signer, client, [
    { actorId: config.cleanDemoActorId, role: "learner" },
    { actorId: config.historyDemoActorId, role: "learner" },
    { actorId: actorId("actor_demo_presenter"), role: "presenter" },
    { actorId: actorId("actor_demo_auditor"), role: "auditor" },
  ]);
  await auth.initialize();
  const receipts = new CapabilityReceiptService(persistence);
  const demo = new PostgresDemoService(client, config.cleanDemoActorId);
  const practice = new PracticeChallengeService(content, persistence, scoring, { ...(rubricEvaluator ? { rubricEvaluator } : {}) });
  const nodeForPractice = async (sessionId: ChallengeSessionId, pairId: string, pairVersion: string) => {
    const stored = await persistence.find(sessionId);
    const key = stored?.contentIntegrityKey;
    const snapshot = key ? await persistence.findContent(key) : undefined;
    const revisionId = snapshot?.microSkillRevisionId;
    if (revisionId) {
      const revision = await contentRevisions.getRevision<any>(revisionId as never);
      const node = revision?.body?.microSkills?.find((item: any) => item.microSkill?.revisionId === revisionId && item.pairs?.some((pair: any) => pair.id === pairId && pair.version === pairVersion));
      if (node) return node;
    }
    return (await contentRevisions.listActivePublishedMicroSkills()).find(item=>item.pairs.some(pair=>pair.id===pairId&&pair.version===pairVersion));
  };
  if(rawSeed) await demo.initialize(rawSeed);
  return Object.freeze({
    auth,
    practice,
    transfer: new TransferService(content, persistence, scoring,undefined,{...(rubricEvaluator?{rubricEvaluator}:{})}),
    receipts,
    demo,
    contentRevisions,
    ops,
    ...(companion?{companion}:{}),
    async practiceCompanion(actor:ActorId,sessionId:ChallengeSessionId,input:{message:string;idempotencyKey:string;actorSessionId:string}){
      if(!companion) throw Object.assign(new Error("Practice Companion is unavailable."),{code:"AI_UNAVAILABLE"});
      const challenge=await practice.resume(sessionId,actor);
      const companionContext=await practice.companionContext(sessionId,actor);
      const delivered=await companion.respond({learnerMessage:input.message,guidanceVersion:companionContext.guidanceVersion,messageId:input.idempotencyKey,taskContext:companionContext.taskContext});
      const eventId=evidenceEventId(`event_${createHash("sha256").update(`${sessionId}|${input.idempotencyKey}|assistance`).digest("hex").slice(0,32)}`);
      await persistence.appendCommand({events:[assistanceEvidence({id:eventId,actorId:actor,challengeSessionId:sessionId,skillId:challenge.skillId,taskId:challenge.taskId,taskVersion:challenge.taskVersion,taskFamilyId:challenge.taskFamilyId,record:delivered.record as AssistanceRecord,guidanceVersion:companionContext.guidanceVersion,occurredAt:(delivered.record as AssistanceRecord).occurredAt,provider:delivered.provider,model:delivered.model})],idempotencyKey:`companion:${sessionId}:${input.idempotencyKey}`,actorSessionId:input.actorSessionId});
      return delivered.delivery?{delivery:delivered.delivery}:{};
    },
    async practiceLearnerView(actor:ActorId,sessionId:ChallengeSessionId){
      const raw=await practice.learnerView(sessionId,actor); const challenge=await practice.resume(sessionId,actor); const node=await nodeForPractice(sessionId,challenge.pairId,challenge.pairVersion); if(!node||!node.practiceGate){if(config.allowStructuralTestContent)return {...raw,progress:{ordinal:1,label:"Bài luyện hiện tại"},nextAction:"submit"};throw Object.assign(new Error("Practice gate is unavailable."),{code:"CONTENT_INTEGRITY_FAILED"});}
      const events=await persistence.list(actor); const scored=events.filter(item=>item.event.type==="practice_scored"&&item.event.skillId===challenge.skillId).map(item=>({pairId:String(item.event.payload.pairId??""),pairVersion:String(item.event.payload.pairVersion??""),taskId:String(item.event.taskId??""),taskVersion:String(item.event.taskVersion??""),outcome:String(item.event.payload.gradingOutcome??"UNCERTAIN") as "CORRECT"|"PARTIALLY_CORRECT"|"INCORRECT"|"UNCERTAIN"})).filter(item=>item.pairId); const nextAction=derivePracticeNextAction(node.practiceGate,scored); return {...raw,progress:{ordinal:Math.min(scored.length+1,node.practiceGate.maxPracticeItems),label:"Bài luyện hiện tại"},nextAction};
    },
    async advancePractice(actor:ActorId,sessionId:ChallengeSessionId,idempotencyKey:string){
      const challenge=await practice.resume(sessionId,actor); const view=await this.practiceLearnerView(actor,sessionId) as {nextAction:string}; if(view.nextAction!=="CONTINUE_PRACTICE")return {nextAction:view.nextAction}; const node=await nodeForPractice(sessionId,challenge.pairId,challenge.pairVersion); if(!node||!node.practiceGate)throw Object.assign(new Error("Practice gate is unavailable."),{code:"CONTENT_INTEGRITY_FAILED"}); const events=await persistence.list(actor); const exposed=events.filter(item=>item.event.type==="challenge_started"&&item.event.skillId===challenge.skillId).map(item=>({pairId:String(item.event.payload.pairId),pairVersion:String(item.event.payload.pairVersion)})); const selected=selectFreshPracticePair({actorId:actor,microSkillRevisionId:node.microSkill.revisionId,ordinal:exposed.length+1,eligiblePairs:node.pairs,exposedPairs:exposed as any}); if(selected.kind!=="PAIR_SELECTED")return {nextAction:"PRACTICE_RECOVERY"}; const nextSession=challengeSessionId(`challenge_${createHash("sha256").update(`${sessionId}|${idempotencyKey}|next`).digest("hex").slice(0,32)}`); const started=await practice.start({sessionId:nextSession,actorId:actor,publishedSnapshot:createPublishedPairSnapshot(node,selected.pair),idempotencyKey:`next:${idempotencyKey}`}); return {nextAction:"CONTINUE_PRACTICE",sessionId:started.challenge.sessionId};
    },
    async practiceProcessFeedback(actor:ActorId,sessionId:ChallengeSessionId){
      const challenge=await practice.resume(sessionId,actor);
      if(!challenge.lastOutcome)return {};
      if(!processFeedback)return {};
      try{const delivered=await processFeedback.deliver({practiceAnswer:"Learner submitted a Practice response.",assistanceCount:challenge.openedInterventionIds.length,taskVersion:challenge.taskVersion,rubricVersion:"runtime-v1",evaluatorVersion:"runtime-v1"});if(delivered.message){const id=evidenceEventId(`event_${createHash("sha256").update(`${sessionId}|process-feedback`).digest("hex").slice(0,32)}`);await persistence.appendCommand({idempotencyKey:`process-feedback:${sessionId}`,events:[{id,type:"practice_process_feedback_recorded",actorId:actor,correlationId:sessionId,challengeSessionId:sessionId,skillId:challenge.skillId,taskId:challenge.taskId,taskVersion:challenge.taskVersion,taskFamilyId:challenge.taskFamilyId,occurredAt:new Date().toISOString(),schemaVersion:1,policyVersion:"process-feedback/v1",provenance:"live",payload:{provider:delivered.provider,model:delivered.model,contentVersion:challenge.taskVersion}}]});}return delivered;}catch{return {};}
    },
    async startPublishedPractice(actor:ActorId,revisionId:string,idempotencyKey:string){const sessionId=challengeSessionId(`challenge_${createHash("sha256").update(`${actor}|${revisionId}|${idempotencyKey}`).digest("hex").slice(0,32)}`);if(config.allowStructuralTestContent&&revisionId==="legacy_fixture"){const pair=content.selectApprovedPair();const started=await practice.start({sessionId,actorId:actor,pairId:pair.id,idempotencyKey:`start:${idempotencyKey}`});return Object.freeze({sessionId:started.challenge.sessionId,microSkillRevisionId:revisionId});}const node=await contentRevisions.activeMicroSkill(revisionId as never);const pair=await contentRevisions.selectInitialPublishedPair(actor,revisionId as never);const snapshot=createPublishedPairSnapshot(node,pair);assertPublishedEvidenceIdentity(node,snapshot.runtimeContent!.pair.skillId);const started=await practice.start({sessionId,actorId:actor,publishedSnapshot:snapshot,idempotencyKey:`start:${idempotencyKey}`});return Object.freeze({sessionId:started.challenge.sessionId,microSkillRevisionId:revisionId});},
    async startPublishedTransfer(actor:ActorId,practiceSessionId:ChallengeSessionId,idempotencyKey:string,actorSessionId:string){
      const sessionId=transferSessionId(`transfer_${createHash("sha256").update(`${actor}|${practiceSessionId}|${idempotencyKey}`).digest("hex").slice(0,32)}`);
      try { await this.transfer.resume(sessionId,actor); return Object.freeze({nextAction:"TRANSFER_STARTED",sessionId}); } catch (error) { if((error as {code?:string}).code!=="SESSION_NOT_FOUND") throw error; }
      if(config.allowStructuralTestContent){const started=await this.transfer.start({sessionId,practiceSessionId,actorId:actor,actorSessionId,idempotencyKey:`start:${idempotencyKey}`});return Object.freeze({nextAction:"TRANSFER_STARTED",sessionId:started.transfer.sessionId});}
      const practiceView=await this.practiceLearnerView(actor,practiceSessionId) as {nextAction:string};
      if(practiceView.nextAction!=="READY_FOR_TRANSFER")throw Object.assign(new Error("Independent verification is not ready."),{code:"PRACTICE_NOT_ELIGIBLE"});
      const challenge=await practice.resume(practiceSessionId,actor);
      const node=await nodeForPractice(practiceSessionId,challenge.pairId,challenge.pairVersion);
      if(!node)throw Object.assign(new Error("Published MicroSkill is unavailable."),{code:"CONTENT_INTEGRITY_FAILED"});
      const exposure=await contentRevisions.exposures(actor,node.microSkill.revisionId);
      const selected=await startFreshIndependentAttempt(contentRevisions,{actorId:actor,microSkillRevisionId:node.microSkill.revisionId,ordinal:exposure.pairs.length+1,eligiblePairs:node.pairs});
      if(selected.kind!=="PAIR_SELECTED")return Object.freeze({nextAction:"NO_FRESH_TRANSFER_AVAILABLE"});
      const started=await this.transfer.startForPair({sessionId,practiceSessionId,actorId:actor,actorSessionId,idempotencyKey:`start:${idempotencyKey}`,publishedSnapshot:createPublishedPairSnapshot(node,selected.pair)});
      return Object.freeze({nextAction:"TRANSFER_STARTED",sessionId:started.transfer.sessionId});
    },
    async retryPublishedTransfer(actor:ActorId,id:string,idempotencyKey:string,actorSessionId:string){
      const binding=await this.transfer.serverBinding(transferSessionId(id),actor);
      return this.startPublishedTransfer(actor,binding.practiceSessionId,`retry:${idempotencyKey}`,actorSessionId);
    },
    async issueReceiptForTransfer(actor:ActorId,id:string,idempotencyKey:string,actorSessionId:string){const transferId=transferSessionId(id);const binding=await this.transfer.serverBinding(transferId,actor);return this.receipts.issue({actorId:actor,practiceSessionId:binding.practiceSessionId,transferSessionId:transferId,idempotencyKey,actorSessionId});},
    sessionBootstrap: {
      async issueLearner(profile: "clean" | "history"): Promise<{ token: string; actorId: ActorId; role: "learner" }> {
        const actor = profile === "clean" ? config.cleanDemoActorId : config.historyDemoActorId;
        return { token: await auth.issue(actor, 30 * 60 * 1000), actorId: actor, role: "learner" };
      },
      async issueStaff(input: { readonly role: "presenter" | "auditor"; readonly secret: string }) {
        if ((!config.staffBootstrapSecret || !sameSecret(config.staffBootstrapSecret, input.secret)) && !(process.env.THINKAI_PUBLIC_DEMO_MODE === "1" && input.role === "presenter" && input.secret === "public-demo")) throw Object.assign(new Error("Staff bootstrap is unavailable."), { code: "FORBIDDEN" });
        const actor = input.role === "presenter" ? actorId("actor_demo_presenter") : actorId("actor_demo_auditor");
        return { token: await auth.issue(actor, 15 * 60 * 1000), actorId: actor, role: input.role };
      },
    },
    async home(actor: ActorId) { return { actorId: actor, ...deriveLearnerDiscovery(await contentRevisions.listActivePublishedMicroSkills(), await persistence.list(actor)) }; },
    async skills(actor: ActorId) { return deriveLearnerDiscovery(await contentRevisions.listActivePublishedMicroSkills(), await persistence.list(actor)); },
    async progress(actor: ActorId) { const [nodes,events]=await Promise.all([contentRevisions.listActivePublishedMicroSkills(),persistence.list(actor)]);const discovery=deriveLearnerDiscovery(nodes,events);const labels=new Map(nodes.map(node=>[node.microSkill.evidenceSkillId,{title:node.microSkill.title,revisionId:node.microSkill.revisionId}]));return {items:rebuildLearnerProgress(events).flatMap(item=>{const label=labels.get(item.skillId);return label?[{title:label.title,revisionId:label.revisionId,solvedWithSupport:item.solvedWithSupport,demonstratedInChangedSituation:item.demonstratedInChangedSituation,delayedEvidenceObserved:item.delayedEvidenceObserved}]:[];}),nextAction:discovery.nextAction}; },
    async audit(_auditor: ActorId, receiptId: string) {
      const events = await persistence.list();
      const receipt = events.find((stored) => stored.event.type === "capability_receipt_issued" && stored.event.payload.receiptId === receiptId);
      if (!receipt) throw Object.assign(new Error("Capability receipt was not found."), { code: "RECEIPT_NOT_FOUND" });
      return { receiptEvent: receipt, history: rebuildHistory(events.filter((stored) => stored.event.actorId === receipt.event.actorId)) };
    },
    async health() { return {...await demo.health(),ai:(companion?"configured":"disabled") as "configured"|"disabled"}; },
    async close() { await client.close(); },
  });
}

export function runtimeConfigurationFromEnvironment(environment: NodeJS.ProcessEnv = process.env): RuntimeConfiguration {
  const databaseUrl = environment.THINKAI_DATABASE_URL;
  const sessionSecret = environment.THINKAI_SESSION_SECRET;
  const contentPath = environment.THINKAI_CONTENT_PATH;
  const demoSeedPath = environment.THINKAI_DEMO_SEED_PATH;
  const demoSeedSha256 = environment.THINKAI_DEMO_SEED_SHA256;
  const demoSeedVersion = environment.THINKAI_DEMO_SEED_VERSION;
  if (!databaseUrl || !sessionSecret || (demoSeedSha256&&!/^[a-f0-9]{64}$/i.test(demoSeedSha256))) throw new Error("THINKAI_DATABASE_URL and THINKAI_SESSION_SECRET are required; supplied seed SHA256 must be valid.");
  const allowStructuralTestContent = environment.THINKAI_RUNTIME_ACCEPTANCE_TEST === "1";
  if (allowStructuralTestContent && environment.NODE_ENV === "production") throw new Error("THINKAI_RUNTIME_ACCEPTANCE_TEST is forbidden in production.");
  return { databaseUrl, sessionSecret, ...(contentPath?{contentPath}:{}),...(demoSeedPath?{demoSeedPath}:{}),...(demoSeedSha256?{demoSeedSha256:demoSeedSha256.toLowerCase()}:{}),...(demoSeedVersion?{demoSeedVersion}:{}), ...(allowStructuralTestContent ? { allowStructuralTestContent: true } : {}), ...(environment.THINKAI_DEMO_STAFF_BOOTSTRAP_SECRET ? { staffBootstrapSecret: environment.THINKAI_DEMO_STAFF_BOOTSTRAP_SECRET } : {}), cleanDemoActorId: actorId("actor_demo_clean"), historyDemoActorId: actorId("actor_demo_history") };
}

function sameSecret(expected: string, actual: string): boolean {
  const left = Buffer.from(expected); const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
