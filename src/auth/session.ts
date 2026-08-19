import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { ActorId } from "../domain/ids.js";
import type { PostgresClient } from "../persistence/index.js";

export type SessionRole = "learner" | "presenter" | "auditor";

export interface AuthenticatedActor {
  readonly actorId: ActorId;
  readonly role: SessionRole;
  readonly sessionId: string;
  readonly expiresAt: string;
}
export interface SessionAuthenticator { verify(token: string | undefined): AuthenticatedActor | Promise<AuthenticatedActor>; }

interface SessionPayload extends AuthenticatedActor { readonly version: 1; }

export class SessionAuthError extends Error {
  public constructor(public readonly code: "UNAUTHORIZED" | "SESSION_TAMPERED" | "SESSION_EXPIRED", message: string) {
    super(message);
    this.name = "SessionAuthError";
  }
}

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
const decode = (value: string): unknown => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

/** Server-only HMAC session codec for the synthetic competition accounts (ADR-008). */
export class SignedSessionService {
  public constructor(private readonly secret: string, private readonly now = () => new Date()) {
    if (secret.length < 32) throw new Error("Session signing secret must be at least 32 characters.");
  }

  public issue(input: Omit<AuthenticatedActor, "expiresAt"> & { readonly ttlMs: number }): string {
    const payload: SessionPayload = Object.freeze({ ...input, expiresAt: new Date(this.now().getTime() + input.ttlMs).toISOString(), version: 1 });
    const body = encode(payload);
    return `${body}.${this.sign(body)}`;
  }

  public verify(token: string | undefined): AuthenticatedActor {
    if (!token || token.length > 4096) throw new SessionAuthError("UNAUTHORIZED", "A valid actor session is required.");
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra) throw new SessionAuthError("SESSION_TAMPERED", "The actor session is malformed.");
    const expected = this.sign(body);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) throw new SessionAuthError("SESSION_TAMPERED", "The actor session signature is invalid.");
    let parsed: unknown;
    try { parsed = decode(body); } catch { throw new SessionAuthError("SESSION_TAMPERED", "The actor session payload is invalid."); }
    if (!parsed || typeof parsed !== "object") throw new SessionAuthError("SESSION_TAMPERED", "The actor session payload is invalid.");
    const value = parsed as Record<string, unknown>;
    if (value.version !== 1 || typeof value.actorId !== "string" || typeof value.sessionId !== "string" || !["learner", "presenter", "auditor"].includes(String(value.role)) || typeof value.expiresAt !== "string") throw new SessionAuthError("SESSION_TAMPERED", "The actor session payload is invalid.");
    if (Date.parse(value.expiresAt) <= this.now().getTime()) throw new SessionAuthError("SESSION_EXPIRED", "The actor session has expired.");
    return Object.freeze({ actorId: value.actorId as ActorId, role: value.role as SessionRole, sessionId: value.sessionId, expiresAt: value.expiresAt });
  }

  private sign(body: string): string { return createHmac("sha256", this.secret).update(body).digest("base64url"); }
}

export interface SyntheticAccount { readonly actorId: ActorId; readonly role: SessionRole; }

/**
 * The signer is deliberately not an account directory.  Runtime code uses this
 * registry so a valid HMAC is still rejected unless its actor, role and current
 * session nonce belong to a configured synthetic competition account.
 */
export class SyntheticSessionRegistry implements SessionAuthenticator {
  private readonly accounts = new Map<ActorId, SyntheticAccount>();
  private readonly activeSessions = new Map<ActorId, string>();

  public constructor(private readonly signer: SignedSessionService, accounts: readonly SyntheticAccount[]) {
    for (const account of accounts) {
      if (this.accounts.has(account.actorId)) throw new Error(`Duplicate synthetic actor ${account.actorId}.`);
      this.accounts.set(account.actorId, Object.freeze({ ...account }));
    }
  }

  public issue(actorId: ActorId, ttlMs: number): string {
    const account = this.accounts.get(actorId);
    if (!account) throw new SessionAuthError("UNAUTHORIZED", "Unknown synthetic actor.");
    const sessionId = `synthetic_${randomUUID()}`;
    this.activeSessions.set(actorId, sessionId);
    return this.signer.issue({ actorId: account.actorId, role: account.role, sessionId, ttlMs });
  }

  public verify(token: string | undefined): AuthenticatedActor {
    const actor = this.signer.verify(token);
    const account = this.accounts.get(actor.actorId);
    if (!account || account.role !== actor.role || this.activeSessions.get(actor.actorId) !== actor.sessionId) {
      throw new SessionAuthError("UNAUTHORIZED", "The actor session is not active for this synthetic account.");
    }
    return actor;
  }

  /** Invalidation is scoped to one account, used after an authorized demo reset. */
  public rotate(actorId: ActorId): void { if (this.accounts.has(actorId)) this.activeSessions.delete(actorId); }
}

/** PostgreSQL-backed synthetic registry used by the production runtime. */
export class PostgresSyntheticSessionRegistry implements SessionAuthenticator {
  private readonly accounts = new Map<ActorId, SyntheticAccount>();
  public constructor(private readonly signer: SignedSessionService, private readonly client: PostgresClient, accounts: readonly SyntheticAccount[]) {
    for (const account of accounts) {
      if (this.accounts.has(account.actorId)) throw new Error(`Duplicate synthetic actor ${account.actorId}.`);
      this.accounts.set(account.actorId, Object.freeze({ ...account }));
    }
  }

  public async initialize(): Promise<void> {
    await this.client.transaction(async (tx) => {
      for (const account of this.accounts.values()) {
        await tx.query("INSERT INTO synthetic_actor_sessions (actor_id,role) VALUES ($1,$2) ON CONFLICT (actor_id) DO UPDATE SET role = EXCLUDED.role", [account.actorId, account.role]);
      }
    });
  }

  public async issue(actorId: ActorId, ttlMs: number): Promise<string> {
    const account = this.accounts.get(actorId);
    if (!account) throw new SessionAuthError("UNAUTHORIZED", "Unknown synthetic actor.");
    return this.client.transaction(async (tx) => {
      const row = await tx.query<{ role: SessionRole }>("SELECT role FROM synthetic_actor_sessions WHERE actor_id = $1 FOR UPDATE", [actorId]);
      if (row.rows[0]?.role !== account.role) throw new SessionAuthError("UNAUTHORIZED", "Synthetic account is not initialized.");
      const sessionId = `synthetic_${randomUUID()}`;
      await tx.query("UPDATE synthetic_actor_sessions SET current_session_id = $2, generation = generation + 1, updated_at = now() WHERE actor_id = $1", [actorId, sessionId]);
      return this.signer.issue({ actorId: account.actorId, role: account.role, sessionId, ttlMs });
    });
  }

  public async verify(token: string | undefined): Promise<AuthenticatedActor> {
    const actor = this.signer.verify(token);
    const account = this.accounts.get(actor.actorId);
    if (!account || account.role !== actor.role) throw new SessionAuthError("UNAUTHORIZED", "The actor session is not recognized.");
    const row = await this.client.query<{ role: SessionRole; current_session_id: string | null }>("SELECT role,current_session_id FROM synthetic_actor_sessions WHERE actor_id = $1", [actor.actorId]);
    if (row.rows[0]?.role !== actor.role || row.rows[0]?.current_session_id !== actor.sessionId) throw new SessionAuthError("UNAUTHORIZED", "The actor session is no longer active.");
    return actor;
  }

  public async rotate(actorId: ActorId): Promise<void> {
    if (!this.accounts.has(actorId)) return;
    await this.client.query("UPDATE synthetic_actor_sessions SET current_session_id = NULL, generation = generation + 1, updated_at = now() WHERE actor_id = $1", [actorId]);
  }
}

export function bearerToken(headers: Readonly<Record<string, string | undefined>> | undefined): string | undefined {
  const value = headers?.authorization ?? headers?.Authorization;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length) : undefined;
}
