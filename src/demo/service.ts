import type { ActorId } from "../domain/ids.js";
import { rebuildEvidenceProjections, type MemoryPersistenceDatabase } from "../persistence/index.js";
import type { PostgresClient } from "../persistence/index.js";
import { validateEvidenceEvent, type EvidenceEvent } from "../evidence/schema.js";

export type DemoProfile = "clean";
export interface DemoResetResult { readonly profile: DemoProfile; readonly resetAt: string; readonly provenance: "seeded_demo"; readonly actorId: ActorId; }
export interface HealthView { readonly status: "ok"; readonly persistence: "available"; readonly ai: "disabled"; }
export interface DemoFixtureBaseline { readonly profile: "clean" | "history"; readonly actorId: ActorId; readonly fixtureVersion: string; readonly events: readonly EvidenceEvent[]; }
export interface DemoFixtureSeed { readonly clean: DemoFixtureBaseline; readonly history: DemoFixtureBaseline; }

/** Reset is deliberately scoped to one synthetic actor; it never replaces the whole store. */
export class DemoService {
  private readonly cleanState;
  private readonly resetOperations = new Map<string, DemoResetResult>();
  public constructor(private readonly database: MemoryPersistenceDatabase, private readonly cleanActor: ActorId, private readonly now = () => new Date(), private readonly fixtureVersion = "demo-fixture-v1") {
    this.cleanState = structuredClone(database.state);
  }
  public reset(input: { readonly resetBy: ActorId; readonly idempotencyKey?: string }): DemoResetResult {
    const operation = input.idempotencyKey ? `demo-reset:${this.cleanActor}:${input.idempotencyKey}` : undefined;
    const replay = operation && this.resetOperations.get(operation); if (replay) return replay;
    const base = this.cleanState;
    const current = structuredClone(this.database.state);
    const actor = this.cleanActor;
    const scopedSessionIds = new Set([...current.sessions.values(), ...base.sessions.values()]
      .filter((session) => (session.state as Record<string, unknown>).actorId === actor)
      .map((session) => session.sessionId));
    current.events = current.events.filter((stored) => stored.event.actorId !== actor);
    current.sessions = new Map([...current.sessions].filter(([, session]) => (session.state as Record<string, unknown>).actorId !== actor));
    current.idempotency = new Map([...current.idempotency].filter(([key]) => !scopedSessionIds.has(key.split(":")[1] ?? "")));
    const baselineEvents = base.events.filter((stored) => stored.event.actorId === actor);
    current.events.push(...baselineEvents);
    current.events.sort((left, right) => left.sequence - right.sequence);
    for (const [id, session] of base.sessions) if ((session.state as Record<string, unknown>).actorId === actor) current.sessions.set(id, session);
    current.projections = [...rebuildEvidenceProjections(current.events)];
    current.demoResetAudit.push(Object.freeze({ actorId: actor, resetBy: input.resetBy, fixtureVersion: this.fixtureVersion, occurredAt: this.now().toISOString() }));
    this.database.state = current;
    const result = Object.freeze({ profile: "clean" as const, resetAt: this.now().toISOString(), provenance: "seeded_demo" as const, actorId: actor });
    if (operation) this.resetOperations.set(operation, result);
    return result;
  }
  public health(): HealthView { return Object.freeze({ status: "ok", persistence: "available", ai: "disabled" }); }
}

/** PostgreSQL implementation used by the production composition root. */
export class PostgresDemoService {
  public constructor(private readonly client: PostgresClient, private readonly cleanActor: ActorId, private readonly fixtureVersion = "demo-fixture-v1") {}
  public async initialize(seed: DemoFixtureSeed): Promise<void> {
    if (seed.clean.actorId !== this.cleanActor || seed.clean.profile !== "clean" || seed.history.profile !== "history") throw new Error("Demo fixture profiles do not match the configured synthetic actors.");
    for (const baseline of [seed.clean, seed.history]) for (const event of baseline.events) {
      if (event.actorId !== baseline.actorId || validateEvidenceEvent(event).length > 0) throw new Error(`Invalid ${baseline.profile} demo fixture event.`);
    }
    await this.client.transaction(async (tx) => {
      for (const baseline of [seed.clean, seed.history]) {
        const digest = baselineDigest(baseline);
        const existing = await tx.query<{ actor_id: string; fixture_version: string; fixture_digest: string }>("SELECT actor_id,fixture_version,fixture_digest FROM demo_fixture_baselines WHERE profile = $1 FOR UPDATE", [baseline.profile]);
        if (!existing.rows[0]) {
          await tx.query("INSERT INTO demo_fixture_baselines (profile,actor_id,fixture_version,fixture_digest,events) VALUES ($1,$2,$3,$4,$5::jsonb)", [baseline.profile, baseline.actorId, baseline.fixtureVersion, digest, JSON.stringify(baseline.events)]);
        } else if (existing.rows[0].actor_id !== baseline.actorId || existing.rows[0].fixture_version !== baseline.fixtureVersion || existing.rows[0].fixture_digest !== digest) {
          throw Object.assign(new Error(`Demo baseline ${baseline.profile} differs from its registered immutable source.`), { code: "DEMO_BASELINE_DRIFT" });
        }
      }
      const historyExists = await tx.query<{ exists: boolean }>("SELECT EXISTS(SELECT 1 FROM evidence_events WHERE actor_id = $1) AS exists", [seed.history.actorId]);
      if (!historyExists.rows[0]?.exists) for (const event of seed.history.events) await insertFixtureEvent(tx, event);
    });
  }
  public async reset(input: { readonly resetBy: ActorId; readonly idempotencyKey: string }): Promise<DemoResetResult> {
    const occurredAt = new Date().toISOString();
    return this.client.transaction(async (tx) => {
      // Shares the actor fence used by PostgresTransactionalEvidencePersistence.
      // A mutation authenticated before reset either completes before this reset,
      // or observes the revoked current_session_id before it can append facts.
      await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`actor-session:${this.cleanActor}`]);
      const operationKey = `demo-reset:${this.cleanActor}:${input.idempotencyKey}`;
      const fingerprint = JSON.stringify({ action: "demo_reset", actorId: this.cleanActor, resetBy: input.resetBy });
      await tx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [operationKey]);
      const previous = await tx.query<{ request_fingerprint: string; result: DemoResetResult }>("SELECT request_fingerprint,result FROM idempotency_records WHERE operation_key = $1 FOR UPDATE", [operationKey]);
      if (previous.rows[0]) {
        if (previous.rows[0].request_fingerprint !== fingerprint) throw Object.assign(new Error("Reset idempotency key was reused for a different request."), { code: "IDEMPOTENCY_CONFLICT" });
        return Object.freeze({ ...previous.rows[0].result });
      }
      const baseline = await tx.query<{ fixture_version: string; events: unknown }>("SELECT fixture_version,events FROM demo_fixture_baselines WHERE profile = 'clean' AND actor_id = $1 FOR UPDATE", [this.cleanActor]);
      if (!baseline.rows[0]) throw new Error("Clean demo baseline is not initialized.");
      const baselineEvents = Array.isArray(baseline.rows[0].events) ? baseline.rows[0].events as EvidenceEvent[] : [];
      for (const event of baselineEvents) if (event.actorId !== this.cleanActor || validateEvidenceEvent(event).length > 0) throw new Error("Stored clean demo baseline is invalid.");
      const sessions = await tx.query<{ session_id: string }>("SELECT session_id FROM session_snapshots WHERE snapshot->>'actorId' = $1 FOR UPDATE", [this.cleanActor]);
      const ids = sessions.rows.map((row) => row.session_id);
      if (ids.length > 0) {
        await tx.query("DELETE FROM idempotency_records WHERE split_part(operation_key, ':', 2) = ANY($1::text[])", [ids]);
        await tx.query("DELETE FROM session_snapshots WHERE session_id = ANY($1::text[])", [ids]);
      }
      // Receipts reference qualifying evidence by foreign key. They are a
      // disposable synthetic-demo projection, so remove only this actor's
      // receipts before replacing the clean actor's evidence baseline.
      await tx.query("DELETE FROM capability_receipts WHERE actor_id = $1", [this.cleanActor]);
      await tx.query("DELETE FROM evidence_events WHERE actor_id = $1", [this.cleanActor]);
      await tx.query("DELETE FROM evidence_projections WHERE actor_id = $1", [this.cleanActor]);
      for (const event of baselineEvents) await insertFixtureEvent(tx, event);
      await tx.query("UPDATE synthetic_actor_sessions SET current_session_id = NULL, generation = generation + 1, updated_at = now() WHERE actor_id = $1", [this.cleanActor]);
      const activeFixtureVersion = baseline.rows[0].fixture_version;
      await tx.query("INSERT INTO demo_reset_audit (actor_id,reset_by,fixture_version,occurred_at) VALUES ($1,$2,$3,$4)", [this.cleanActor, input.resetBy, activeFixtureVersion, occurredAt]);
      const result: DemoResetResult = Object.freeze({ profile: "clean", resetAt: occurredAt, provenance: "seeded_demo", actorId: this.cleanActor });
      await tx.query("INSERT INTO idempotency_records (operation_key,request_fingerprint,result) VALUES ($1,$2,$3::jsonb)", [operationKey, fingerprint, JSON.stringify(result)]);
      return result;
    });
  }
  public async health(): Promise<HealthView> { await this.client.query("SELECT 1 AS ok"); return Object.freeze({ status: "ok", persistence: "available", ai: "disabled" }); }
}

function baselineDigest(baseline: DemoFixtureBaseline): string {
  return createHash("sha256").update(JSON.stringify({ profile: baseline.profile, actorId: baseline.actorId, fixtureVersion: baseline.fixtureVersion, events: baseline.events }), "utf8").digest("hex");
}

async function insertFixtureEvent(tx: { query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: readonly unknown[]): Promise<unknown> }, event: EvidenceEvent): Promise<void> {
  await tx.query(`INSERT INTO evidence_events (id,type,actor_id,correlation_id,challenge_session_id,transfer_session_id,skill_id,task_id,task_version,task_family_id,occurred_at,schema_version,scorer_version,policy_version,provenance,payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb)`, [event.id,event.type,event.actorId,event.correlationId,event.challengeSessionId ?? null,event.transferSessionId ?? null,event.skillId,event.taskId ?? null,event.taskVersion ?? null,event.taskFamilyId ?? null,event.occurredAt,event.schemaVersion,event.scorerVersion ?? null,event.policyVersion ?? null,event.provenance,JSON.stringify(event.payload)]);
}
import { createHash } from "node:crypto";
