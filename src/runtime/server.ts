import { readFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import { createHash } from "node:crypto";

import { PostgresSyntheticSessionRegistry, SignedSessionService, type SessionAuthenticator } from "../auth/session.js";
import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, challengeSessionId, type ActorId } from "../domain/ids.js";
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
import { assistanceEvidence } from "../assistance/evidence.js";
import type { AssistanceRecord } from "../assistance/contracts.js";
import { evidenceEventId, type ChallengeSessionId } from "../domain/ids.js";
import { assertPublishedEvidenceIdentity, deriveLearnerDiscovery } from "./learner-discovery.js";
import { derivePracticeNextAction } from "../challenge/practice-gate.js";
import { selectFreshPracticePair } from "../content/selection.js";

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
}

export interface ProductionRuntime {
  readonly auth: SessionAuthenticator;
  readonly practice: PracticeChallengeService;
  readonly transfer: TransferService;
  readonly receipts: CapabilityReceiptService;
  readonly demo: PostgresDemoService;
  readonly contentRevisions: PostgresContentRevisionRepository;
  readonly ops: OpsService;
  readonly companion?: LivePracticeCompanion;
  practiceCompanion(actor:ActorId,sessionId:ChallengeSessionId,input:{message:string;idempotencyKey:string;actorSessionId:string}):Promise<{delivery?:string}>;
  practiceLearnerView(actor:ActorId,sessionId:ChallengeSessionId):Promise<unknown>;
  advancePractice(actor:ActorId,sessionId:ChallengeSessionId,idempotencyKey:string):Promise<unknown>;
  practiceProcessFeedback(actor:ActorId,sessionId:ChallengeSessionId):Promise<{message?:string}>;
  startPublishedPractice(actor:ActorId,revisionId:string,idempotencyKey:string):Promise<unknown>;
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
  const companion = process.env.NODE_ENV === "production" ? new LivePracticeCompanion() : undefined;
  const processFeedback = process.env.NODE_ENV === "production" ? new LivePracticeProcessFeedback() : undefined;
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
  const practice = new PracticeChallengeService(content, persistence, scoring);
  if(rawSeed) await demo.initialize(rawSeed);
  return Object.freeze({
    auth,
    practice,
    transfer: new TransferService(content, persistence, scoring),
    receipts,
    demo,
    contentRevisions,
    ops,
    ...(companion?{companion}:{}),
    async practiceCompanion(actor:ActorId,sessionId:ChallengeSessionId,input:{message:string;idempotencyKey:string;actorSessionId:string}){
      if(!companion) throw Object.assign(new Error("Practice Companion is unavailable."),{code:"AI_UNAVAILABLE"});
      const challenge=await practice.resume(sessionId,actor);
      const delivered=await companion.respond({learnerMessage:input.message,guidanceVersion:"runtime-v1",messageId:input.idempotencyKey});
      const eventId=evidenceEventId(`event_${createHash("sha256").update(`${sessionId}|${input.idempotencyKey}|assistance`).digest("hex").slice(0,32)}`);
      await persistence.appendCommand({events:[assistanceEvidence({id:eventId,actorId:actor,challengeSessionId:sessionId,skillId:challenge.skillId,taskId:challenge.taskId,taskVersion:challenge.taskVersion,taskFamilyId:challenge.taskFamilyId,record:delivered.record as AssistanceRecord,guidanceVersion:"runtime-v1",occurredAt:(delivered.record as AssistanceRecord).occurredAt,provider:delivered.provider,model:delivered.model})],idempotencyKey:`companion:${sessionId}:${input.idempotencyKey}`,actorSessionId:input.actorSessionId});
      return delivered.delivery?{delivery:delivered.delivery}:{};
    },
    async practiceLearnerView(actor:ActorId,sessionId:ChallengeSessionId){
      const raw=await practice.learnerView(sessionId,actor); const challenge=await practice.resume(sessionId,actor); const nodes=await contentRevisions.listActivePublishedMicroSkills(); const node=nodes.find(item=>item.pairs.some(pair=>pair.id===challenge.pairId&&pair.version===challenge.pairVersion)); if(!node||!node.practiceGate)throw Object.assign(new Error("Practice gate is unavailable."),{code:"CONTENT_INTEGRITY_FAILED"});
      const events=await persistence.list(actor); const scored=events.filter(item=>item.event.type==="practice_scored"&&item.event.skillId===challenge.skillId).map(item=>({pairId:String(item.event.payload.pairId??""),pairVersion:String(item.event.payload.pairVersion??""),taskId:String(item.event.taskId??""),taskVersion:String(item.event.taskVersion??""),outcome:String(item.event.payload.gradingOutcome??"UNCERTAIN") as "CORRECT"|"PARTIALLY_CORRECT"|"INCORRECT"|"UNCERTAIN"})).filter(item=>item.pairId); const nextAction=derivePracticeNextAction(node.practiceGate,scored); return {...raw,progress:{ordinal:Math.min(scored.length+1,node.practiceGate.maxPracticeItems),label:"Bài luyện hiện tại"},nextAction};
    },
    async advancePractice(actor:ActorId,sessionId:ChallengeSessionId,idempotencyKey:string){
      const challenge=await practice.resume(sessionId,actor); const view=await this.practiceLearnerView(actor,sessionId) as {nextAction:string}; if(view.nextAction!=="CONTINUE_PRACTICE")return {nextAction:view.nextAction}; const node=(await contentRevisions.listActivePublishedMicroSkills()).find(item=>item.pairs.some(pair=>pair.id===challenge.pairId&&pair.version===challenge.pairVersion)); if(!node||!node.practiceGate)throw Object.assign(new Error("Practice gate is unavailable."),{code:"CONTENT_INTEGRITY_FAILED"}); const events=await persistence.list(actor); const exposed=events.filter(item=>item.event.type==="challenge_started"&&item.event.skillId===challenge.skillId).map(item=>({pairId:String(item.event.payload.pairId),pairVersion:String(item.event.payload.pairVersion)})); const selected=selectFreshPracticePair({actorId:actor,microSkillRevisionId:node.microSkill.revisionId,ordinal:exposed.length+1,eligiblePairs:node.pairs,exposedPairs:exposed as any}); if(selected.kind!=="PAIR_SELECTED")return {nextAction:"PRACTICE_RECOVERY"}; const nextSession=challengeSessionId(`challenge_${createHash("sha256").update(`${sessionId}|${idempotencyKey}|next`).digest("hex").slice(0,32)}`); const started=await practice.start({sessionId:nextSession,actorId:actor,pairId:selected.pair.id,idempotencyKey:`next:${idempotencyKey}`}); return {nextAction:"CONTINUE_PRACTICE",sessionId:started.challenge.sessionId};
    },
    async practiceProcessFeedback(actor:ActorId,sessionId:ChallengeSessionId){
      const challenge=await practice.resume(sessionId,actor);
      if(!challenge.lastOutcome)return {};
      if(!processFeedback)return {};
      try{const delivered=await processFeedback.deliver({practiceAnswer:"Learner submitted a Practice response.",assistanceCount:challenge.openedInterventionIds.length,taskVersion:challenge.taskVersion,rubricVersion:"runtime-v1",evaluatorVersion:"runtime-v1"});if(delivered.message){const id=evidenceEventId(`event_${createHash("sha256").update(`${sessionId}|process-feedback`).digest("hex").slice(0,32)}`);await persistence.appendCommand({idempotencyKey:`process-feedback:${sessionId}`,events:[{id,type:"practice_process_feedback_recorded",actorId:actor,correlationId:sessionId,challengeSessionId:sessionId,skillId:challenge.skillId,taskId:challenge.taskId,taskVersion:challenge.taskVersion,taskFamilyId:challenge.taskFamilyId,occurredAt:new Date().toISOString(),schemaVersion:1,policyVersion:"process-feedback/v1",provenance:"live",payload:{provider:delivered.provider,model:delivered.model,contentVersion:challenge.taskVersion}}]});}return delivered;}catch{return {};}
    },
    async startPublishedPractice(actor:ActorId,revisionId:string,idempotencyKey:string){const sessionId=challengeSessionId(`challenge_${createHash("sha256").update(`${actor}|${revisionId}|${idempotencyKey}`).digest("hex").slice(0,32)}`);if(config.allowStructuralTestContent&&revisionId==="legacy_fixture"){const pair=content.selectApprovedPair();const started=await practice.start({sessionId,actorId:actor,pairId:pair.id,idempotencyKey:`start:${idempotencyKey}`});return Object.freeze({sessionId:started.challenge.sessionId,microSkillRevisionId:revisionId});}const node=await contentRevisions.activeMicroSkill(revisionId as never);const pair=await contentRevisions.selectInitialPublishedPair(actor,revisionId as never);const legacyPair=content.getReviewedPair(pair.id as never);const practiceTask=content.getTask(legacyPair.practiceTaskId);const transferTask=content.getTask(legacyPair.transferTaskId);assertPublishedEvidenceIdentity(node,legacyPair.skillId);if(legacyPair.version!==pair.version||legacyPair.practiceTaskId!==pair.practiceTask.id||legacyPair.transferTaskId!==pair.transferTask.id||practiceTask.version!==pair.practiceTask.version||transferTask.version!==pair.transferTask.version)throw Object.assign(new Error("Published content cannot be resolved by the Practice runtime."),{code:"CONTENT_INTEGRITY_FAILED"});const started=await practice.start({sessionId,actorId:actor,pairId:pair.id,idempotencyKey:`start:${idempotencyKey}`});return Object.freeze({sessionId:started.challenge.sessionId,microSkillRevisionId:revisionId});},
    sessionBootstrap: {
      async issueLearner(profile: "clean" | "history"): Promise<{ token: string; actorId: ActorId; role: "learner" }> {
        const actor = profile === "clean" ? config.cleanDemoActorId : config.historyDemoActorId;
        return { token: await auth.issue(actor, 30 * 60 * 1000), actorId: actor, role: "learner" };
      },
      async issueStaff(input: { readonly role: "presenter" | "auditor"; readonly secret: string }) {
        if (!config.staffBootstrapSecret || !sameSecret(config.staffBootstrapSecret, input.secret)) throw Object.assign(new Error("Staff bootstrap is unavailable."), { code: "FORBIDDEN" });
        const actor = input.role === "presenter" ? actorId("actor_demo_presenter") : actorId("actor_demo_auditor");
        return { token: await auth.issue(actor, 15 * 60 * 1000), actorId: actor, role: input.role };
      },
    },
    async home(actor: ActorId) { return { actorId: actor, ...deriveLearnerDiscovery(await contentRevisions.listActivePublishedMicroSkills(), await persistence.list(actor)) }; },
    async skills(actor: ActorId) { return deriveLearnerDiscovery(await contentRevisions.listActivePublishedMicroSkills(), await persistence.list(actor)); },
    async progress(actor: ActorId) { return rebuildLearnerProgress(await persistence.list(actor)); },
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
