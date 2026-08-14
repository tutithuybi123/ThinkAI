import type { ReviewedPairSnapshot } from "../content/snapshot.js";
import type { ActorId, EvidenceEventId, SkillId } from "../domain/ids.js";
import { validateEvidenceEvent, type EvidenceEvent } from "../evidence/schema.js";

export interface StoredEvidenceEvent { readonly sequence: number; readonly event: EvidenceEvent; }
export interface SessionSnapshot { readonly sessionId: string; readonly kind: "challenge" | "transfer"; readonly contentIntegrityKey: string; readonly state: Readonly<Record<string, unknown>>; }
export interface EvidenceProjection { readonly actorId: ActorId; readonly skillId: SkillId; readonly eventCount: number; readonly lastSequence: number; readonly lastOccurredAt: string; }
export interface AppendEvidenceCommand { readonly events: readonly EvidenceEvent[]; readonly idempotencyKey?: string; readonly session?: SessionSnapshot; readonly contentSnapshot?: ReviewedPairSnapshot; }
export interface AppendEvidenceResult { readonly events: readonly StoredEvidenceEvent[]; readonly replayed: boolean; }

export interface EvidenceEventRepository { append(events: readonly EvidenceEvent[]): Promise<readonly StoredEvidenceEvent[]>; list(actorId?: ActorId): Promise<readonly StoredEvidenceEvent[]>; }
export interface SessionSnapshotRepository { save(snapshot: SessionSnapshot): Promise<void>; find(sessionId: string): Promise<SessionSnapshot | undefined>; }
export interface ContentSnapshotRepository { save(snapshot: ReviewedPairSnapshot): Promise<void>; find(integrityKey: string): Promise<ReviewedPairSnapshot | undefined>; }
export interface ProjectionRepository { rebuild(events: readonly StoredEvidenceEvent[]): Promise<readonly EvidenceProjection[]>; list(): Promise<readonly EvidenceProjection[]>; }

function clone<T>(value: T): T { return structuredClone(value); }
function fingerprint(command: AppendEvidenceCommand): string { return JSON.stringify({ events: command.events, session: command.session, contentSnapshot: command.contentSnapshot }); }
function jsonObject(value: unknown, label: string): Record<string, unknown> {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${label} must be a JSON object.`);
  return parsed as Record<string, unknown>;
}
function optionalString(value: unknown): string | undefined { return typeof value === "string" ? value : undefined; }
function hydrateEvent(row: Record<string, unknown>): StoredEvidenceEvent {
  const event = {
    id: String(row.id) as EvidenceEventId, type: String(row.type) as EvidenceEvent["type"], actorId: String(row.actor_id) as ActorId,
    correlationId: String(row.correlation_id), skillId: String(row.skill_id) as SkillId, occurredAt: new Date(String(row.occurred_at)).toISOString(),
    schemaVersion: Number(row.schema_version), provenance: String(row.provenance) as EvidenceEvent["provenance"], payload: jsonObject(row.payload, "Evidence payload"),
    ...(optionalString(row.challenge_session_id) ? { challengeSessionId: optionalString(row.challenge_session_id) as EvidenceEvent["challengeSessionId"] } : {}),
    ...(optionalString(row.transfer_session_id) ? { transferSessionId: optionalString(row.transfer_session_id) as EvidenceEvent["transferSessionId"] } : {}),
    ...(optionalString(row.task_id) ? { taskId: optionalString(row.task_id) as EvidenceEvent["taskId"] } : {}),
    ...(optionalString(row.task_version) ? { taskVersion: optionalString(row.task_version) } : {}),
    ...(optionalString(row.task_family_id) ? { taskFamilyId: optionalString(row.task_family_id) as EvidenceEvent["taskFamilyId"] } : {}),
    ...(optionalString(row.scorer_version) ? { scorerVersion: optionalString(row.scorer_version) } : {}),
    ...(optionalString(row.policy_version) ? { policyVersion: optionalString(row.policy_version) } : {}),
  } as EvidenceEvent;
  const issues = validateEvidenceEvent(event); if (issues.length) throw new Error(`Stored evidence event ${event.id} is invalid.`);
  return Object.freeze({ sequence: Number(row.sequence), event: Object.freeze(event) });
}
function hydrateContentSnapshot(value: unknown, integrityKey: string): ReviewedPairSnapshot {
  const snapshot = jsonObject(value, "Content snapshot") as unknown as ReviewedPairSnapshot;
  if (snapshot.integrityKey !== integrityKey || !snapshot.pair || !snapshot.practiceTask || !snapshot.transferTask || !Array.isArray(snapshot.interventions)) throw new Error(`Stored content snapshot ${integrityKey} is invalid.`);
  return clone(snapshot);
}

export function rebuildEvidenceProjections(events: readonly StoredEvidenceEvent[]): readonly EvidenceProjection[] {
  const projections = new Map<string, EvidenceProjection>();
  for (const stored of [...events].sort((a, b) => a.sequence - b.sequence)) {
    const { event, sequence } = stored;
    const key = `${event.actorId}:${event.skillId}`;
    const previous = projections.get(key);
    projections.set(key, Object.freeze({ actorId: event.actorId, skillId: event.skillId, eventCount: (previous?.eventCount ?? 0) + 1, lastSequence: sequence, lastOccurredAt: event.occurredAt }));
  }
  return Object.freeze([...projections.values()]);
}

interface DatabaseState { events: StoredEvidenceEvent[]; sessions: Map<string, SessionSnapshot>; content: Map<string, ReviewedPairSnapshot>; idempotency: Map<string, { fingerprint: string; result: AppendEvidenceResult }>; projections: EvidenceProjection[]; nextSequence: number; }
export class MemoryPersistenceDatabase {
  public state: DatabaseState = { events: [], sessions: new Map(), content: new Map(), idempotency: new Map(), projections: [], nextSequence: 1 };
}

/** Transactional reference implementation used by tests and local isolated execution. */
export class TransactionalEvidencePersistence implements EvidenceEventRepository {
  public constructor(private readonly database = new MemoryPersistenceDatabase()) {}
  public async appendCommand(command: AppendEvidenceCommand): Promise<AppendEvidenceResult> {
    const state = clone(this.database.state);
    const requestFingerprint = fingerprint(command);
    if (command.idempotencyKey) {
      const prior = state.idempotency.get(command.idempotencyKey);
      if (prior) {
        if (prior.fingerprint !== requestFingerprint) throw new Error(`Idempotency key ${command.idempotencyKey} was reused for a different command.`);
        return { ...clone(prior.result), replayed: true };
      }
    }
    for (const event of command.events) {
      const issues = validateEvidenceEvent(event);
      if (issues.length) throw new Error(`Invalid evidence event ${event.id}: ${issues.map((issue) => issue.path).join(", ")}`);
      if (state.events.some((stored) => stored.event.id === event.id)) throw new Error(`Evidence event ${event.id} already exists; events are append-only.`);
    }
    if (command.contentSnapshot) state.content.set(command.contentSnapshot.integrityKey, clone(command.contentSnapshot));
    if (command.session) {
      if (!state.content.has(command.session.contentIntegrityKey)) throw new Error(`Session ${command.session.sessionId} references an unknown content snapshot.`);
      state.sessions.set(command.session.sessionId, clone(command.session));
    }
    const stored = command.events.map((event) => Object.freeze({ sequence: state.nextSequence++, event: clone(event) }));
    state.events.push(...stored);
    state.projections = [...rebuildEvidenceProjections(state.events)];
    const result: AppendEvidenceResult = Object.freeze({ events: Object.freeze(stored), replayed: false });
    if (command.idempotencyKey) state.idempotency.set(command.idempotencyKey, { fingerprint: requestFingerprint, result });
    this.database.state = state;
    return clone(result);
  }
  public async append(events: readonly EvidenceEvent[]): Promise<readonly StoredEvidenceEvent[]> { return (await this.appendCommand({ events })).events; }
  public async list(actorId?: ActorId): Promise<readonly StoredEvidenceEvent[]> { return clone(this.database.state.events.filter((item) => !actorId || item.event.actorId === actorId)); }
  public async save(snapshot: SessionSnapshot): Promise<void> { await this.appendCommand({ events: [], session: snapshot }); }
  public async find(sessionId: string): Promise<SessionSnapshot | undefined> { const value = this.database.state.sessions.get(sessionId); return value && clone(value); }
  public async findContent(integrityKey: string): Promise<ReviewedPairSnapshot | undefined> { const value = this.database.state.content.get(integrityKey); return value && clone(value); }
  public async saveContent(snapshot: ReviewedPairSnapshot): Promise<void> { await this.appendCommand({ events: [], contentSnapshot: snapshot }); }
  public async rebuild(events: readonly StoredEvidenceEvent[]): Promise<readonly EvidenceProjection[]> { const rebuilt = rebuildEvidenceProjections(events); this.database.state.projections = [...rebuilt]; return clone(rebuilt); }
  public async listProjections(): Promise<readonly EvidenceProjection[]> { return clone(this.database.state.projections); }
  // Interface-compatible aliases avoid conflating snapshot lookup with event lookup at callers.
  public async findSnapshot(integrityKey: string): Promise<ReviewedPairSnapshot | undefined> { return this.findContent(integrityKey); }
}

export interface PostgresQueryResult<Row extends Record<string, unknown> = Record<string, unknown>> { readonly rows: readonly Row[]; }
export interface PostgresTransaction { query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: readonly unknown[]): Promise<PostgresQueryResult<Row>>; }
export interface PostgresClient extends PostgresTransaction { transaction<T>(work: (transaction: PostgresTransaction) => Promise<T>): Promise<T>; }

/** PostgreSQL repositories use an injected driver adapter, keeping this domain package driver-neutral. */
export class PostgresEvidenceRepository implements EvidenceEventRepository {
  public constructor(private readonly client: PostgresClient) {}
  public async append(events: readonly EvidenceEvent[]): Promise<readonly StoredEvidenceEvent[]> {
    return this.client.transaction(async (tx) => {
      const result: StoredEvidenceEvent[] = [];
      for (const event of events) {
        const issues = validateEvidenceEvent(event); if (issues.length) throw new Error(`Invalid evidence event ${event.id}.`);
        const row = await tx.query<{ sequence: string }>(`INSERT INTO evidence_events (id,type,actor_id,correlation_id,challenge_session_id,transfer_session_id,skill_id,task_id,task_version,task_family_id,occurred_at,schema_version,scorer_version,policy_version,provenance,payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb) RETURNING sequence`, [event.id,event.type,event.actorId,event.correlationId,event.challengeSessionId ?? null,event.transferSessionId ?? null,event.skillId,event.taskId ?? null,event.taskVersion ?? null,event.taskFamilyId ?? null,event.occurredAt,event.schemaVersion,event.scorerVersion ?? null,event.policyVersion ?? null,event.provenance,JSON.stringify(event.payload)]);
        result.push(Object.freeze({ sequence: Number(row.rows[0]?.sequence), event: clone(event) }));
      }
      return Object.freeze(result);
    });
  }
  public async list(actorId?: ActorId): Promise<readonly StoredEvidenceEvent[]> {
    const result = await this.client.query(`SELECT sequence,id,type,actor_id,correlation_id,challenge_session_id,transfer_session_id,skill_id,task_id,task_version,task_family_id,occurred_at,schema_version,scorer_version,policy_version,provenance,payload FROM evidence_events${actorId ? " WHERE actor_id = $1" : ""} ORDER BY sequence ASC`, actorId ? [actorId] : []);
    return Object.freeze(result.rows.map(hydrateEvent));
  }
}

export class PostgresSessionSnapshotRepository implements SessionSnapshotRepository {
  public constructor(private readonly client: PostgresClient) {}
  public async save(snapshot: SessionSnapshot): Promise<void> {
    await this.client.query(`INSERT INTO session_snapshots (session_id,session_kind,content_integrity_key,snapshot) VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT (session_id) DO UPDATE SET snapshot = EXCLUDED.snapshot, recorded_at = now()`, [snapshot.sessionId, snapshot.kind, snapshot.contentIntegrityKey, JSON.stringify(snapshot.state)]);
  }
  public async find(sessionId: string): Promise<SessionSnapshot | undefined> {
    const result = await this.client.query<{ session_id: string; session_kind: string; content_integrity_key: string; snapshot: unknown }>("SELECT session_id,session_kind,content_integrity_key,snapshot FROM session_snapshots WHERE session_id = $1", [sessionId]);
    const row = result.rows[0]; if (!row) return undefined;
    if (row.session_kind !== "challenge" && row.session_kind !== "transfer") throw new Error(`Stored session ${sessionId} has an invalid kind.`);
    return Object.freeze({ sessionId: row.session_id, kind: row.session_kind, contentIntegrityKey: row.content_integrity_key, state: Object.freeze(jsonObject(row.snapshot, "Session snapshot")) });
  }
}

export class PostgresContentSnapshotRepository implements ContentSnapshotRepository {
  public constructor(private readonly client: PostgresClient) {}
  public async save(snapshot: ReviewedPairSnapshot): Promise<void> {
    await this.client.query(`INSERT INTO content_snapshots (integrity_key,snapshot) VALUES ($1,$2::jsonb) ON CONFLICT (integrity_key) DO NOTHING`, [snapshot.integrityKey, JSON.stringify(snapshot)]);
  }
  public async find(integrityKey: string): Promise<ReviewedPairSnapshot | undefined> {
    const result = await this.client.query<{ integrity_key: string; snapshot: unknown }>("SELECT integrity_key,snapshot FROM content_snapshots WHERE integrity_key = $1", [integrityKey]);
    const row = result.rows[0]; return row ? hydrateContentSnapshot(row.snapshot, row.integrity_key) : undefined;
  }
}

export class PostgresProjectionRepository implements ProjectionRepository {
  public constructor(private readonly client: PostgresClient) {}
  public async rebuild(events: readonly StoredEvidenceEvent[]): Promise<readonly EvidenceProjection[]> {
    const projections = rebuildEvidenceProjections(events);
    await this.client.transaction(async (tx) => {
      await tx.query("DELETE FROM evidence_projections");
      for (const projection of projections) await tx.query(`INSERT INTO evidence_projections (actor_id,skill_id,event_count,last_sequence,last_occurred_at) VALUES ($1,$2,$3,$4,$5)`, [projection.actorId, projection.skillId, projection.eventCount, projection.lastSequence, projection.lastOccurredAt]);
    });
    return projections;
  }
  public async list(): Promise<readonly EvidenceProjection[]> {
    const result = await this.client.query<{ actor_id: string; skill_id: string; event_count: number | string; last_sequence: number | string; last_occurred_at: string | Date }>("SELECT actor_id,skill_id,event_count,last_sequence,last_occurred_at FROM evidence_projections ORDER BY actor_id, skill_id");
    return Object.freeze(result.rows.map((row) => Object.freeze({ actorId: row.actor_id as ActorId, skillId: row.skill_id as SkillId, eventCount: Number(row.event_count), lastSequence: Number(row.last_sequence), lastOccurredAt: new Date(row.last_occurred_at).toISOString() })));
  }
}

/** Atomic PostgreSQL write path. A supplied idempotency key protects retries of one whole command. */
export class PostgresTransactionalEvidencePersistence {
  public constructor(private readonly client: PostgresClient) {}
  public async appendCommand(command: AppendEvidenceCommand): Promise<AppendEvidenceResult> {
    const requestFingerprint = fingerprint(command);
    return this.client.transaction(async (tx) => {
      if (command.idempotencyKey) {
        const prior = await tx.query<{ request_fingerprint: string; result: AppendEvidenceResult }>("SELECT request_fingerprint, result FROM idempotency_records WHERE operation_key = $1 FOR UPDATE", [command.idempotencyKey]);
        if (prior.rows[0]) {
          if (prior.rows[0].request_fingerprint !== requestFingerprint) throw new Error(`Idempotency key ${command.idempotencyKey} was reused for a different command.`);
          return { ...prior.rows[0].result, replayed: true };
        }
      }
      if (command.contentSnapshot) await tx.query("INSERT INTO content_snapshots (integrity_key,snapshot) VALUES ($1,$2::jsonb) ON CONFLICT (integrity_key) DO NOTHING", [command.contentSnapshot.integrityKey, JSON.stringify(command.contentSnapshot)]);
      if (command.session) await tx.query("INSERT INTO session_snapshots (session_id,session_kind,content_integrity_key,snapshot) VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT (session_id) DO UPDATE SET snapshot = EXCLUDED.snapshot, recorded_at = now()", [command.session.sessionId, command.session.kind, command.session.contentIntegrityKey, JSON.stringify(command.session.state)]);
      const stored: StoredEvidenceEvent[] = [];
      for (const event of command.events) {
        const issues = validateEvidenceEvent(event); if (issues.length) throw new Error(`Invalid evidence event ${event.id}.`);
        const row = await tx.query<{ sequence: string }>(`INSERT INTO evidence_events (id,type,actor_id,correlation_id,challenge_session_id,transfer_session_id,skill_id,task_id,task_version,task_family_id,occurred_at,schema_version,scorer_version,policy_version,provenance,payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb) RETURNING sequence`, [event.id,event.type,event.actorId,event.correlationId,event.challengeSessionId ?? null,event.transferSessionId ?? null,event.skillId,event.taskId ?? null,event.taskVersion ?? null,event.taskFamilyId ?? null,event.occurredAt,event.schemaVersion,event.scorerVersion ?? null,event.policyVersion ?? null,event.provenance,JSON.stringify(event.payload)]);
        stored.push(Object.freeze({ sequence: Number(row.rows[0]?.sequence), event: clone(event) }));
      }
      for (const projection of rebuildEvidenceProjections(stored)) await tx.query(`INSERT INTO evidence_projections (actor_id,skill_id,event_count,last_sequence,last_occurred_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (actor_id,skill_id) DO UPDATE SET event_count = evidence_projections.event_count + EXCLUDED.event_count, last_sequence = EXCLUDED.last_sequence, last_occurred_at = EXCLUDED.last_occurred_at`, [projection.actorId, projection.skillId, projection.eventCount, projection.lastSequence, projection.lastOccurredAt]);
      const result: AppendEvidenceResult = Object.freeze({ events: Object.freeze(stored), replayed: false });
      if (command.idempotencyKey) await tx.query("INSERT INTO idempotency_records (operation_key,request_fingerprint,result) VALUES ($1,$2,$3::jsonb)", [command.idempotencyKey, requestFingerprint, JSON.stringify(result)]);
      return result;
    });
  }
}

export function isSameEvidenceEventId(left: EvidenceEventId, right: EvidenceEventId): boolean { return left === right; }
