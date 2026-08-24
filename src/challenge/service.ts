import { createHash } from "node:crypto";

import type { InterventionContent, ReviewedTaskPair, TaskContent } from "../content/schema.js";
import type { ReviewedContentRepository } from "../content/repository.js";
import { runtimeContentFromSnapshot, type ReviewedPairSnapshot } from "../content/snapshot.js";
import type { PracticeCompanionTaskContext } from "../assistance/companion.js";
import {
  type ActorId,
  type ChallengeSessionId,
  type InterventionId,
  type SkillId,
  type TaskFamilyId,
  type TaskId,
  type TaskPairId,
  challengeSessionId,
  evidenceEventId,
} from "../domain/ids.js";
import { EVIDENCE_EVENT_SCHEMA_VERSION } from "../domain/policies.js";
import type { EvidenceEvent } from "../evidence/schema.js";
import type { AppendEvidenceCommand, AppendEvidenceResult, SessionSnapshot } from "../persistence/index.js";
import type { ScoreResult, ScoringService, SubmittedAnswer } from "../scoring/service.js";
import { deterministicOutcome, deriveGradingOutcome } from "../grading/aggregation.js";
import type { GradingOutcome } from "../grading/contracts.js";
import { evaluateDeterministic } from "../scoring/service.js";
import { evaluateReviewedRubric, type RubricEvaluatorAdapter } from "../ai/evaluator.js";
import { satisfiesGradingGate } from "../grading/gate-policy.js";

const PRACTICE_LIFECYCLE_POLICY_VERSION = "practice-lifecycle-v1";
const SESSION_STATE_VERSION = 1;

export type PracticeChallengeStage = "ready" | "attempting" | "assisted" | "solved";

export interface PracticeChallengePersistence {
  appendCommand(command: AppendEvidenceCommand): Promise<AppendEvidenceResult>;
  find(sessionId: string): Promise<SessionSnapshot | undefined>;
  findContent(integrityKey: string): Promise<ReviewedPairSnapshot | undefined>;
}

export interface PracticeChallengeView {
  readonly sessionId: ChallengeSessionId;
  readonly skillId: SkillId;
  readonly pairId: TaskPairId;
  readonly pairVersion: string;
  readonly taskId: TaskId;
  readonly taskVersion: string;
  readonly taskFamilyId: TaskFamilyId;
  readonly stage: PracticeChallengeStage;
  readonly attemptCount: number;
  readonly submissionCount: number;
  readonly openedInterventionIds: readonly InterventionId[];
  readonly lastScore?: ScoreResult;
  readonly lastOutcome?: GradingOutcome;
}

export interface PracticeChallengeCommandResult {
  readonly replayed: boolean;
  readonly challenge: PracticeChallengeView;
  readonly score?: ScoreResult;
}

/** Learner-safe projection.  Pair, task-version, rubric and answer keys remain server-only. */
export interface PracticeLearnerView {
  readonly sessionId: ChallengeSessionId;
  readonly context: { readonly label: string };
  readonly task: { readonly prompt: { readonly format: "plain_text" | "markdown"; readonly body: string }; readonly assets: readonly string[]; readonly input: "text" | "written_solution" | "unavailable"; readonly requiresWrittenSolution: boolean };
  readonly progress: { readonly ordinal: number; readonly label: string };
  readonly state: { readonly stage: PracticeChallengeStage; readonly attemptCount: number; readonly submissionCount: number; readonly outcome?: "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" | "UNCERTAIN" };
  readonly assistance: { readonly available: boolean };
  readonly nextAction: "submit" | "continue_practice" | "ready_for_transfer" | "recover";
}

export class PracticeChallengeError extends Error {
  public constructor(
    public readonly code:
      | "SESSION_NOT_FOUND"
      | "ACTOR_MISMATCH"
      | "INVALID_TRANSITION"
      | "INTERVENTION_NOT_AVAILABLE"
      | "CONTENT_VERSION_DRIFT"
      | "AI_UNAVAILABLE"
      | "IDEMPOTENCY_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "PracticeChallengeError";
  }
}

interface InterventionExposure {
  readonly id: InterventionId;
  readonly version: string;
  readonly openedAt: string;
}

interface StoredOperationResult {
  readonly stage: PracticeChallengeStage;
  readonly attemptCount: number;
  readonly submissionCount: number;
  readonly openedInterventionIds: readonly InterventionId[];
  readonly lastScore?: ScoreResult;
  readonly lastOutcome?: GradingOutcome;
}

interface StoredOperation {
  readonly fingerprint: string;
  readonly result: StoredOperationResult;
}

interface ChallengeState {
  readonly stateVersion: number;
  readonly actorId: ActorId;
  readonly pairId: TaskPairId;
  readonly pairVersion: string;
  readonly skillId: SkillId;
  readonly practiceTaskId: TaskId;
  readonly practiceTaskVersion: string;
  readonly taskFamilyId: TaskFamilyId;
  readonly contentIntegrityKey: string;
  readonly stage: PracticeChallengeStage;
  readonly attemptCount: number;
  readonly submissionCount: number;
  readonly exposures: readonly InterventionExposure[];
  readonly lastScore?: ScoreResult;
  readonly lastOutcome?: GradingOutcome;
  readonly operations: Readonly<Record<string, StoredOperation>>;
}

export interface StartPracticeChallengeCommand {
  readonly sessionId: ChallengeSessionId;
  readonly actorId: ActorId;
  /** A server-selected reviewed pair. Browser routes never supply this field. */
  readonly pairId?: TaskPairId;
  /** Exact server-resolved published material. Never accepted from browser/API input. */
  readonly publishedSnapshot?: ReviewedPairSnapshot;
  readonly idempotencyKey: string;
  readonly actorSessionId?: string;
}

export interface RecordAttemptCommand {
  readonly sessionId: ChallengeSessionId;
  readonly actorId: ActorId;
  readonly idempotencyKey: string;
  readonly actorSessionId?: string;
}

export interface DeclareCannotStartCommand {
  readonly sessionId: ChallengeSessionId;
  readonly actorId: ActorId;
  readonly idempotencyKey: string;
  readonly actorSessionId?: string;
}

export interface OpenReviewedHintCommand {
  readonly sessionId: ChallengeSessionId;
  readonly actorId: ActorId;
  readonly interventionId: InterventionId;
  readonly idempotencyKey: string;
  readonly actorSessionId?: string;
}

export interface SubmitPracticeAnswerCommand {
  readonly sessionId: ChallengeSessionId;
  readonly actorId: ActorId;
  readonly answer: SubmittedAnswer;
  readonly idempotencyKey: string;
  readonly actorSessionId?: string;
}

export interface PracticeChallengeServiceOptions {
  readonly now?: () => Date;
  readonly rubricEvaluator?: RubricEvaluatorAdapter;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNonEmpty(value: string, field: string): void {
  if (!value.trim()) throw new PracticeChallengeError("INVALID_TRANSITION", `${field} must not be empty.`);
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function eventIdFor(sessionId: ChallengeSessionId, operationKey: string, ordinal: number) {
  return evidenceEventId(`event_${hash(`${sessionId}|${operationKey}|${ordinal}`).slice(0, 32)}`);
}

function bodyHash(intervention: InterventionContent): string {
  return hash(`${intervention.version}|${intervention.body.format}|${intervention.body.body}`);
}

function sameVersion(reference: { readonly id: string; readonly version: string }, id: string, version: string): boolean {
  return reference.id === id && reference.version === version;
}

function isScoreResult(value: unknown): value is ScoreResult {
  return isRecord(value)
    && (value.outcome === "correct" || value.outcome === "incorrect" || value.outcome === "invalid")
    && typeof value.scorerVersion === "string"
    && typeof value.answerSpecVersion === "string";
}

function parseState(snapshot: SessionSnapshot): ChallengeState {
  if (snapshot.kind !== "challenge" || !isRecord(snapshot.state)) {
    throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} is not a valid practice challenge.`);
  }
  const state = snapshot.state;
  const stage = state.stage;
  if (state.stateVersion !== SESSION_STATE_VERSION || !["ready", "attempting", "assisted", "solved"].includes(String(stage))) {
    throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} has an unsupported practice state.`);
  }
  const stringFields = ["actorId", "pairId", "pairVersion", "skillId", "practiceTaskId", "practiceTaskVersion", "taskFamilyId", "contentIntegrityKey"] as const;
  if (stringFields.some((field) => typeof state[field] !== "string" || !String(state[field]).trim())
    || !Number.isInteger(state.attemptCount) || !Number.isInteger(state.submissionCount)
    || !Array.isArray(state.exposures) || !isRecord(state.operations)) {
    throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} has malformed persisted state.`);
  }
  const exposures: InterventionExposure[] = [];
  for (const exposure of state.exposures) {
    if (!isRecord(exposure) || typeof exposure.id !== "string" || typeof exposure.version !== "string" || typeof exposure.openedAt !== "string") {
      throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} has malformed hint exposure.`);
    }
    exposures.push({ id: exposure.id as InterventionId, version: exposure.version, openedAt: exposure.openedAt });
  }
  const operations: Record<string, StoredOperation> = {};
  for (const [key, operation] of Object.entries(state.operations)) {
    if (!isRecord(operation) || typeof operation.fingerprint !== "string" || !isRecord(operation.result)) {
      throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} has malformed idempotency state.`);
    }
    const result = operation.result;
    if (!["ready", "attempting", "assisted", "solved"].includes(String(result.stage))
      || !Number.isInteger(result.attemptCount) || !Number.isInteger(result.submissionCount)
      || !Array.isArray(result.openedInterventionIds)
      || (result.lastScore !== undefined && !isScoreResult(result.lastScore))) {
      throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Session ${snapshot.sessionId} has malformed idempotency result.`);
    }
    operations[key] = Object.freeze({
      fingerprint: operation.fingerprint,
      result: Object.freeze({
        stage: result.stage as PracticeChallengeStage,
        attemptCount: result.attemptCount as number,
        submissionCount: result.submissionCount as number,
        openedInterventionIds: Object.freeze(result.openedInterventionIds.map((id) => String(id) as InterventionId)),
        ...(isScoreResult(result.lastScore) ? { lastScore: result.lastScore } : {}),
      }),
    });
  }
  return Object.freeze({
    stateVersion: SESSION_STATE_VERSION,
    actorId: state.actorId as ActorId,
    pairId: state.pairId as TaskPairId,
    pairVersion: state.pairVersion as string,
    skillId: state.skillId as SkillId,
    practiceTaskId: state.practiceTaskId as TaskId,
    practiceTaskVersion: state.practiceTaskVersion as string,
    taskFamilyId: state.taskFamilyId as TaskFamilyId,
    contentIntegrityKey: state.contentIntegrityKey as string,
    stage: stage as PracticeChallengeStage,
    attemptCount: state.attemptCount as number,
    submissionCount: state.submissionCount as number,
    exposures: Object.freeze(exposures),
      ...(isScoreResult(state.lastScore) ? { lastScore: state.lastScore } : {}),
      ...(["CORRECT","PARTIALLY_CORRECT","INCORRECT","UNCERTAIN"].includes(String(state.lastOutcome)) ? { lastOutcome: state.lastOutcome as GradingOutcome } : {}),
    operations: Object.freeze(operations),
  });
}

export class PracticeChallengeService {
  private readonly now: () => Date;
  private readonly rubricEvaluator: RubricEvaluatorAdapter | undefined;

  public constructor(
    private readonly content: ReviewedContentRepository,
    private readonly persistence: PracticeChallengePersistence,
    private readonly scoring: ScoringService,
    options: PracticeChallengeServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.rubricEvaluator = options.rubricEvaluator;
  }

  public async start(command: StartPracticeChallengeCommand): Promise<PracticeChallengeCommandResult> {
    requireNonEmpty(command.idempotencyKey, "idempotencyKey");
    const existing = await this.persistence.find(command.sessionId);
    const published = command.publishedSnapshot ? runtimeContentFromSnapshot(command.publishedSnapshot) : undefined;
    const pair = published?.pair ?? (command.pairId === undefined ? this.content.selectApprovedPair() : this.content.getReviewedPair(command.pairId));
    const fingerprint = JSON.stringify({ action: "start", actorId: command.actorId, pairId: pair.id, pairVersion: pair.version });
    if (existing) return this.replayExisting(command.sessionId, command.actorId, existing, command.idempotencyKey, fingerprint);

    const task = published?.practiceTask ?? this.content.getTask(pair.practiceTaskId);
    this.assertApprovedPractice(pair, task);
    const snapshot = command.publishedSnapshot ?? this.content.createPairSnapshot(pair.id);
    const state: ChallengeState = Object.freeze({
      stateVersion: SESSION_STATE_VERSION,
      actorId: command.actorId,
      pairId: pair.id,
      pairVersion: pair.version,
      skillId: pair.skillId,
      practiceTaskId: task.id,
      practiceTaskVersion: task.version,
      taskFamilyId: task.familyId,
      contentIntegrityKey: snapshot.integrityKey,
      stage: "ready",
      attemptCount: 0,
      submissionCount: 0,
      exposures: Object.freeze([]),
      operations: Object.freeze({}),
    });
    const result = this.resultFor(state);
    const next = this.withOperation(state, command.idempotencyKey, fingerprint, result);
    const event = this.event(command.sessionId, command.idempotencyKey, 0, next, task, "challenge_started", {
      pairId: pair.id,
      pairVersion: pair.version,
      contentIntegrityKey: snapshot.integrityKey,
    });
    await this.persistence.appendCommand({
      events: [event],
      idempotencyKey: `practice:${command.sessionId}:${command.idempotencyKey}`,
      contentSnapshot: snapshot,
      session: this.session(command.sessionId, next),
      ...(command.actorSessionId === undefined ? {} : { actorSessionId: command.actorSessionId }),
    });
    return { replayed: false, challenge: this.view(command.sessionId, next) };
  }

  public async recordAttempt(command: RecordAttemptCommand): Promise<PracticeChallengeCommandResult> {
    return this.recordAttemptKind(command, "attempt");
  }

  public async declareCannotStart(command: DeclareCannotStartCommand): Promise<PracticeChallengeCommandResult> {
    return this.recordAttemptKind(command, "cannot_start");
  }

  public async openReviewedHint(command: OpenReviewedHintCommand): Promise<PracticeChallengeCommandResult> {
    const loaded = await this.load(command.sessionId, command.actorId);
    requireNonEmpty(command.idempotencyKey, "idempotencyKey");
    const fingerprint = JSON.stringify({ action: "open_hint", interventionId: command.interventionId });
    const replay = this.replay(loaded, command.sessionId, command.actorId, command.idempotencyKey, fingerprint);
    if (replay) return replay;
    if ((loaded.state.stage !== "attempting" && loaded.state.stage !== "assisted") || loaded.state.attemptCount < 1) {
      throw new PracticeChallengeError("INVALID_TRANSITION", "A reviewed hint is available only after an attempt or cannot-start declaration.");
    }
    const intervention = loaded.interventions.find((candidate) => candidate.id === command.interventionId);
    const snapshotReference = loaded.snapshot.interventions.find((candidate) => candidate.id === command.interventionId);
    if (!intervention || !snapshotReference || !sameVersion(snapshotReference, intervention.id, intervention.version) || intervention.review.status !== "approved") {
      throw new PracticeChallengeError("INTERVENTION_NOT_AVAILABLE", `Reviewed hint ${command.interventionId} is not available for this challenge.`);
    }
    const next = this.withOperation(Object.freeze({
      ...loaded.state,
      stage: "assisted" as const,
      exposures: Object.freeze([...loaded.state.exposures, Object.freeze({ id: intervention.id, version: intervention.version, openedAt: this.timestamp() })]),
    }), command.idempotencyKey, fingerprint);
    const event = this.event(command.sessionId, command.idempotencyKey, 0, next, loaded.task, "intervention_opened", {
      interventionId: intervention.id,
      interventionVersion: intervention.version,
      exposureTags: intervention.exposureTags,
      precedingAttemptOrdinal: loaded.state.attemptCount,
      exactContentHash: bodyHash(intervention),
    });
    await this.persist(command.sessionId, command.idempotencyKey, next, [event], command.actorSessionId);
    return { replayed: false, challenge: this.view(command.sessionId, next) };
  }

  public async submit(command: SubmitPracticeAnswerCommand): Promise<PracticeChallengeCommandResult> {
    const loaded = await this.load(command.sessionId, command.actorId);
    requireNonEmpty(command.idempotencyKey, "idempotencyKey");
    const fingerprint = JSON.stringify({ action: "submit", answer: command.answer });
    const replay = this.replay(loaded, command.sessionId, command.actorId, command.idempotencyKey, fingerprint);
    if (replay) return replay;
    if (loaded.state.stage !== "attempting" && loaded.state.stage !== "assisted") {
      throw new PracticeChallengeError("INVALID_TRANSITION", "A practice answer can be submitted only after an attempt or reviewed hint.");
    }
    const score = this.scoring.score(loaded.task, command.answer);
    const gradingOutcome = await this.grade(loaded.task, command.answer, score);
    const stage: PracticeChallengeStage = satisfiesGradingGate(gradingOutcome) ? "solved" : loaded.state.exposures.length > 0 ? "assisted" : "attempting";
    const base: ChallengeState = Object.freeze({
      ...loaded.state,
      stage,
      submissionCount: loaded.state.submissionCount + 1,
      lastScore: score,
      lastOutcome: gradingOutcome,
    });
    const next = this.withOperation(base, command.idempotencyKey, fingerprint, this.resultFor(base));
    const submitted = this.event(command.sessionId, command.idempotencyKey, 0, next, loaded.task, "answer_submitted", {
      answerKind: this.answerKind(command.answer),
      ordinal: next.submissionCount,
    });
    const scored = this.event(command.sessionId, command.idempotencyKey, 1, next, loaded.task, "practice_scored", {
      outcome: score.outcome,
      gradingOutcome,
      pairId: loaded.state.pairId,
      pairVersion: loaded.state.pairVersion,
      answerSpecVersion: score.answerSpecVersion,
      ...(score.normalizedAnswer === undefined ? {} : { normalizedAnswer: score.normalizedAnswer }),
      ...(score.reasonCode === undefined ? {} : { reasonCode: score.reasonCode }),
    }, score.scorerVersion);
    await this.persist(command.sessionId, command.idempotencyKey, next, [submitted, scored], command.actorSessionId);
    return { replayed: false, challenge: this.view(command.sessionId, next), score };
  }

  public async resume(sessionId: ChallengeSessionId, actorId: ActorId): Promise<PracticeChallengeView> {
    const loaded = await this.load(sessionId, actorId);
    return this.view(sessionId, loaded.state);
  }

  /** Resolves only the immutable Practice task snapshot bound to this session. */
  public async companionContext(sessionId: ChallengeSessionId, actorId: ActorId): Promise<{ readonly guidanceVersion: string; readonly taskContext: PracticeCompanionTaskContext }> {
    const loaded = await this.load(sessionId, actorId);
    if (loaded.task.answerSpec.kind !== "written_solution") throw new PracticeChallengeError("AI_UNAVAILABLE", "Task-authored Practice guidance is unavailable.");
    const assessment = loaded.task.answerSpec.assessment;
    const guidance = assessment.aiGuidance as unknown as { version?: unknown; allowedSupportLevels?: unknown };
    const misconceptions = assessment.commonMisconceptions as unknown;
    const allowed = guidance.allowedSupportLevels;
    if (typeof guidance.version !== "string" || !guidance.version.trim() || !Array.isArray(misconceptions) || !misconceptions.every((item) => typeof item === "string") || !Array.isArray(allowed) || allowed.length === 0 || new Set(allowed).size !== allowed.length || !allowed.every((item) => ["PROMPT", "CONCEPTUAL_HINT", "STRATEGIC_HINT", "STRONG_SCAFFOLD"].includes(String(item)))) throw new PracticeChallengeError("AI_UNAVAILABLE", "Task-authored Practice guidance is unavailable.");
    return Object.freeze({
      guidanceVersion: assessment.aiGuidance.version,
      taskContext: Object.freeze({
        practiceTaskId: String(loaded.task.id), practiceTaskVersion: loaded.task.version,
        prompt: loaded.task.prompt.body, commonMisconceptions: Object.freeze([...misconceptions]),
        allowedSupportLevels: Object.freeze([...allowed] as PracticeCompanionTaskContext["allowedSupportLevels"]),
      }),
    });
  }

  public async learnerView(sessionId: ChallengeSessionId, actorId: ActorId): Promise<PracticeLearnerView> {
    const loaded = await this.load(sessionId, actorId);
    const score = loaded.state.lastScore;
    const outcome = loaded.state.lastOutcome ?? (score === undefined ? undefined : deterministicOutcome(score));
    const input = loaded.task.answerSpec.kind === "written_solution" ? "written_solution"
      : loaded.task.answerSpec.kind === "choice" ? "unavailable" : "text";
    const nextAction = outcome === "CORRECT" ? "ready_for_transfer" : loaded.state.stage === "solved" ? "recover" : "submit";
    return Object.freeze({
      sessionId,
      context: { label: "Bài luyện" },
      task: Object.freeze({ prompt: loaded.task.prompt, assets: Object.freeze([...loaded.task.assetRefs]), input, requiresWrittenSolution: loaded.task.answerSpec.kind === "written_solution" }),
      progress: { ordinal: Math.max(1, loaded.state.submissionCount + 1), label: "Bài luyện hiện tại" },
      state: Object.freeze({ stage: loaded.state.stage, attemptCount: loaded.state.attemptCount, submissionCount: loaded.state.submissionCount, ...(outcome === undefined ? {} : { outcome }) }),
      assistance: { available: true },
      nextAction,
    });
  }

  private async grade(task:TaskContent, answer:SubmittedAnswer, score:ScoreResult):Promise<GradingOutcome>{
    if(task.answerSpec.kind!=="written_solution")return deterministicOutcome(score);
    const assessment=task.answerSpec.assessment;
    if(!this.rubricEvaluator)return "UNCERTAIN";
    const rawText=typeof answer==="string"?answer:answer.kind==="text"?answer.value:"";
    const evidence=await evaluateReviewedRubric(this.rubricEvaluator,{taskVersion:task.version,rubricVersion:assessment.aiGuidance.version,rawText,expectedResult:assessment.expectedResult,criteria:assessment.criteria,shape:assessment.gradingShape,criterionIds:assessment.criteria.map(x=>x.id),provenance:{adapterId:"runtime",modelVersion:"configured",schemaVersion:"rubric-facets/v1"}});
    return deriveGradingOutcome({deterministic:evaluateDeterministic(task,answer,this.scoring),rubric:evidence.status==="valid"?evidence.facets:undefined,shape:assessment.gradingShape,criterionIds:assessment.criteria.map(x=>x.id),contentVersion:task.version,taskVersion:task.version,rubricVersion:assessment.aiGuidance.version}).outcome;
  }

  private async recordAttemptKind(command: RecordAttemptCommand | DeclareCannotStartCommand, kind: "attempt" | "cannot_start"): Promise<PracticeChallengeCommandResult> {
    const loaded = await this.load(command.sessionId, command.actorId);
    requireNonEmpty(command.idempotencyKey, "idempotencyKey");
    const fingerprint = JSON.stringify({ action: kind });
    const replay = this.replay(loaded, command.sessionId, command.actorId, command.idempotencyKey, fingerprint);
    if (replay) return replay;
    if (loaded.state.stage !== "ready" && loaded.state.stage !== "attempting" && loaded.state.stage !== "assisted") {
      throw new PracticeChallengeError("INVALID_TRANSITION", "The practice challenge is already solved.");
    }
    const next = this.withOperation(Object.freeze({
      ...loaded.state,
      stage: loaded.state.stage === "assisted" ? "assisted" as const : "attempting" as const,
      attemptCount: loaded.state.attemptCount + 1,
    }), command.idempotencyKey, fingerprint);
    const events: EvidenceEvent[] = [this.event(command.sessionId, command.idempotencyKey, 0, next, loaded.task, "attempt_submitted", { kind, ordinal: next.attemptCount })];
    if (kind === "cannot_start") events.push(this.event(command.sessionId, command.idempotencyKey, 1, next, loaded.task, "unable_to_start_declared", { ordinal: next.attemptCount }));
    await this.persist(command.sessionId, command.idempotencyKey, next, events, command.actorSessionId);
    return { replayed: false, challenge: this.view(command.sessionId, next) };
  }

  private async load(sessionId: ChallengeSessionId, actorId: ActorId): Promise<{ state: ChallengeState; snapshot: ReviewedPairSnapshot; task: TaskContent; interventions: readonly InterventionContent[] }> {
    const stored = await this.persistence.find(sessionId);
    if (!stored) throw new PracticeChallengeError("SESSION_NOT_FOUND", `Practice challenge ${sessionId} was not found.`);
    const state = parseState(stored);
    if (state.actorId !== actorId) throw new PracticeChallengeError("ACTOR_MISMATCH", "This practice challenge belongs to another learner.");
    const snapshot = await this.persistence.findContent(state.contentIntegrityKey);
    if (!snapshot) throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", `Practice challenge ${sessionId} has no persisted content snapshot.`);
    let published: ReturnType<typeof runtimeContentFromSnapshot> | undefined;
    try { published = runtimeContentFromSnapshot(snapshot); } catch (error) {
      if (snapshot.runtimeContent) throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", error instanceof Error ? error.message : "Persisted content snapshot is invalid.");
      try { this.content.assertSnapshotIntegrity(snapshot); } catch (legacyError) { throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", legacyError instanceof Error ? legacyError.message : "Current content no longer matches this challenge."); }
    }
    const pair = published?.pair ?? this.content.getReviewedPair(state.pairId);
    const task = published?.practiceTask ?? this.content.getTask(state.practiceTaskId);
    this.assertApprovedPractice(pair, task);
    if (!sameVersion(snapshot.pair, pair.id, pair.version)
      || !sameVersion(snapshot.practiceTask, task.id, task.version)
      || state.pairVersion !== pair.version
      || state.practiceTaskVersion !== task.version
      || state.skillId !== pair.skillId
      || state.taskFamilyId !== task.familyId) {
      throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", "Current reviewed content differs from the challenge content snapshot.");
    }
    const interventions = published?.interventions ?? this.content.getInterventionsForPracticeTask(task.id);
    return { state, snapshot, task, interventions };
  }

  private async replayExisting(sessionId: ChallengeSessionId, actorId: ActorId, snapshot: SessionSnapshot, idempotencyKey: string, fingerprint: string): Promise<PracticeChallengeCommandResult> {
    const state = parseState(snapshot);
    if (state.actorId !== actorId) throw new PracticeChallengeError("ACTOR_MISMATCH", "This practice challenge belongs to another learner.");
    const replay = this.replay({ state }, sessionId, actorId, idempotencyKey, fingerprint);
    if (!replay) throw new PracticeChallengeError("INVALID_TRANSITION", `Practice challenge ${sessionId} already exists.`);
    return replay;
  }

  private replay(loaded: { state: ChallengeState }, sessionId: ChallengeSessionId, actorId: ActorId, idempotencyKey: string, fingerprint: string): PracticeChallengeCommandResult | undefined {
    const existing = loaded.state.operations[idempotencyKey];
    if (!existing) return undefined;
    if (existing.fingerprint !== fingerprint) {
      throw new PracticeChallengeError("IDEMPOTENCY_CONFLICT", `Idempotency key ${idempotencyKey} was reused for another practice command.`);
    }
    const state: ChallengeState = Object.freeze({
      ...loaded.state,
      stage: existing.result.stage,
      attemptCount: existing.result.attemptCount,
      submissionCount: existing.result.submissionCount,
      exposures: Object.freeze(existing.result.openedInterventionIds.map((id) => ({ id, version: "replayed", openedAt: "replayed" }))),
      ...(existing.result.lastScore === undefined ? {} : { lastScore: existing.result.lastScore }),
      ...(existing.result.lastOutcome === undefined ? {} : { lastOutcome: existing.result.lastOutcome }),
    });
    return {
      replayed: true,
      challenge: this.view(sessionId, state),
      ...(existing.result.lastScore === undefined ? {} : { score: existing.result.lastScore }),
    };
  }

  private withOperation(state: ChallengeState, idempotencyKey: string, fingerprint: string, result = this.resultFor(state)): ChallengeState {
    return Object.freeze({ ...state, operations: Object.freeze({ ...state.operations, [idempotencyKey]: Object.freeze({ fingerprint, result }) }) });
  }

  private resultFor(state: ChallengeState): StoredOperationResult {
    return Object.freeze({
      stage: state.stage,
      attemptCount: state.attemptCount,
      submissionCount: state.submissionCount,
      openedInterventionIds: Object.freeze(state.exposures.map((exposure) => exposure.id)),
      ...(state.lastScore === undefined ? {} : { lastScore: state.lastScore }),
      ...(state.lastOutcome === undefined ? {} : { lastOutcome: state.lastOutcome }),
    });
  }

  private view(sessionId: ChallengeSessionId, state: ChallengeState): PracticeChallengeView {
    return Object.freeze({
      sessionId,
      skillId: state.skillId,
      pairId: state.pairId,
      pairVersion: state.pairVersion,
      taskId: state.practiceTaskId,
      taskVersion: state.practiceTaskVersion,
      taskFamilyId: state.taskFamilyId,
      stage: state.stage,
      attemptCount: state.attemptCount,
      submissionCount: state.submissionCount,
      openedInterventionIds: Object.freeze(state.exposures.map((exposure) => exposure.id)),
      ...(state.lastScore === undefined ? {} : { lastScore: state.lastScore }),
      ...(state.lastOutcome === undefined ? {} : { lastOutcome: state.lastOutcome }),
    });
  }

  private event(
    sessionId: ChallengeSessionId,
    operationKey: string,
    ordinal: number,
    state: ChallengeState,
    task: TaskContent,
    type: EvidenceEvent["type"],
    payload: Record<string, unknown>,
    scorerVersion?: string,
  ): EvidenceEvent {
    return Object.freeze({
      id: eventIdFor(sessionId, operationKey, ordinal),
      type,
      actorId: state.actorId,
      correlationId: sessionId,
      challengeSessionId: sessionId,
      skillId: state.skillId,
      taskId: task.id,
      taskVersion: task.version,
      taskFamilyId: task.familyId,
      occurredAt: this.timestamp(),
      schemaVersion: EVIDENCE_EVENT_SCHEMA_VERSION,
      policyVersion: PRACTICE_LIFECYCLE_POLICY_VERSION,
      ...(scorerVersion === undefined ? {} : { scorerVersion }),
      provenance: "live",
      payload,
    });
  }

  private session(sessionId: ChallengeSessionId, state: ChallengeState): SessionSnapshot {
    return Object.freeze({ sessionId, kind: "challenge", contentIntegrityKey: state.contentIntegrityKey, state: state as unknown as Readonly<Record<string, unknown>> });
  }

  private async persist(sessionId: ChallengeSessionId, idempotencyKey: string, state: ChallengeState, events: readonly EvidenceEvent[], actorSessionId?: string): Promise<void> {
    await this.persistence.appendCommand({ events, idempotencyKey: `practice:${sessionId}:${idempotencyKey}`, session: this.session(sessionId, state), ...(actorSessionId === undefined ? {} : { actorSessionId }) });
  }

  private timestamp(): string {
    return this.now().toISOString();
  }

  private answerKind(answer: SubmittedAnswer): string {
    if (typeof answer === "string") return "text";
    return answer.kind;
  }

  private assertApprovedPractice(pair: ReviewedTaskPair, task: TaskContent): void {
    if (pair.review.status !== "approved" || task.review.status !== "approved" || task.role !== "practice" || pair.practiceTaskId !== task.id) {
      throw new PracticeChallengeError("CONTENT_VERSION_DRIFT", "Only approved practice content may start or resume a challenge.");
    }
  }
}
