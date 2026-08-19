/** Framework-free transport adapter. Domain services remain authoritative. */
import { bearerToken, type AuthenticatedActor, type SessionAuthenticator, SessionAuthError } from "../auth/session.js";
import type { ActorId } from "../domain/ids.js";
import type { SubmittedAnswer } from "../scoring/service.js";

export interface ApiRequest { readonly method: string; readonly path: string; readonly headers?: Readonly<Record<string, string | undefined>>; readonly body?: unknown; }
export interface ApiResponse { readonly status: number; readonly body: unknown; }
export interface ApiServices {
  readonly auth: SessionAuthenticator;
  home(actor: ActorId): Promise<unknown>;
  skills(actor: ActorId): Promise<unknown>;
  progress(actor: ActorId): Promise<unknown>;
  audit(actor: ActorId, receiptId: string): Promise<unknown>;
  readonly practice: any; readonly transfer: any; readonly receipts: any;
  readonly demo?: { reset(input:{resetBy:ActorId;idempotencyKey:string}): unknown | Promise<unknown>; health(): unknown | Promise<unknown> };
  readonly sessionBootstrap?: {
    issueLearner(profile: "clean" | "history"): { token: string; actorId: ActorId; role: "learner" } | Promise<{ token: string; actorId: ActorId; role: "learner" }>;
    issueStaff?(input: { readonly role: "presenter" | "auditor"; readonly secret: string }): { token: string; actorId: ActorId; role: "presenter" | "auditor" } | Promise<{ token: string; actorId: ActorId; role: "presenter" | "auditor" }>;
  };
  onDemoReset?(actor: ActorId): void | Promise<void>;
}

const MAX_IDEMPOTENCY_KEY = 200;
const MAX_ANSWER = 4_000;
const MAX_REASONING = 8_000;
const MAX_JSON_DEPTH = 8;
const MAX_JSON_KEYS = 64;
const response = (status: number, body: unknown): ApiResponse => ({ status, body });
const failure = (code: string, status: number, message: string): ApiResponse => response(status, { error: { code, message } });
const isApiResponse = (value: unknown): value is ApiResponse => !!value && typeof value === "object" && "status" in value && typeof (value as ApiResponse).status === "number";
const object = (value: unknown): Record<string, unknown> | undefined => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
const idem = (request: ApiRequest): string | undefined => request.headers?.["Idempotency-Key"] ?? request.headers?.["idempotency-key"];
const routeId = (value: string | undefined): string | undefined => value && /^[a-z_][a-z0-9_-]{2,127}$/.test(value) ? value : undefined;
function boundedJson(value: unknown, depth = 0): boolean {
  if (depth > MAX_JSON_DEPTH) return false;
  if (value === null || typeof value === "boolean" || typeof value === "number") return true;
  if (typeof value === "string") return value.length <= MAX_REASONING;
  if (Array.isArray(value)) return value.length <= MAX_JSON_KEYS && value.every((item) => boundedJson(item, depth + 1));
  const record = object(value);
  return !!record && Object.keys(record).length <= MAX_JSON_KEYS && Object.values(record).every((item) => boundedJson(item, depth + 1));
}

function errorResponse(error: unknown): ApiResponse {
  if (error instanceof SessionAuthError) return failure(error.code, error.code === "SESSION_EXPIRED" ? 401 : 401, error.message);
  const value = error as { code?: string; message?: string };
  const code = value.code ?? "INTERNAL_ERROR";
  const status = code === "SESSION_REVOKED" ? 401
    : code === "ACTOR_MISMATCH" || code === "FORBIDDEN" || code === "DEMO_RESET_FORBIDDEN" ? 403
    : code === "SESSION_NOT_FOUND" || code === "RECEIPT_NOT_FOUND" ? 404
      : ["INVALID_TRANSITION", "CONTENT_VERSION_DRIFT", "IDEMPOTENCY_CONFLICT", "PRACTICE_NOT_ELIGIBLE", "NOT_ELIGIBLE", "SESSION_CONCURRENT_MODIFICATION"].includes(code) ? 409
        : ["SCORING_FAILED", "CONTENT_INTEGRITY_FAILED", "AI_UNAVAILABLE"].includes(code) ? 503 : 400;
  return failure(code, status, value.message ?? "Request failed.");
}

async function authenticate(services: ApiServices, request: ApiRequest): Promise<AuthenticatedActor> { return await services.auth.verify(bearerToken(request.headers)); }
function mutationKey(request: ApiRequest): string | ApiResponse {
  const key = idem(request);
  if (!key || key.length > MAX_IDEMPOTENCY_KEY || !/^[A-Za-z0-9._:-]+$/.test(key)) return failure("INVALID_IDEMPOTENCY_KEY", 400, "A valid Idempotency-Key is required.");
  return key;
}
function boundedString(value: unknown, maximum: number): value is string { return typeof value === "string" && value.length <= maximum; }
function validObjectAnswer(value: Record<string, unknown>): SubmittedAnswer | undefined {
  if (value.kind === "text" && boundedString(value.value, MAX_ANSWER) && Object.keys(value).every((key) => key === "kind" || key === "value")) return { kind: "text", value: value.value };
  if (value.kind === "choice" && boundedString(value.optionId, 256) && Object.keys(value).every((key) => key === "kind" || key === "optionId")) return { kind: "choice", optionId: value.optionId };
  if (value.kind === "cannot_start" && Object.keys(value).length === 1) return { kind: "cannot_start" };
  return undefined;
}
function answer(value: unknown): SubmittedAnswer | ApiResponse {
  if (boundedString(value, MAX_ANSWER)) return value;
  const parsed = object(value);
  const submitted = parsed && validObjectAnswer(parsed);
  return submitted ?? failure("SUBMISSION_INVALID", 400, "Answer must use one supported bounded answer shape.");
}

export async function dispatch(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  if (request.method === "GET" && request.path === "/healthz") return response(200, services.demo ? await services.demo.health() : { status:"ok", persistence:"unconfigured", ai:"disabled" });
  if (request.body !== undefined && !boundedJson(request.body)) return failure("INVALID_REQUEST", 400, "Request body exceeds structural limits.");
  const unauthenticatedBody = object(request.body);
  if (request.method === "POST" && request.path === "/api/v1/demo/session") {
    const profile = unauthenticatedBody?.profile;
    if (!services.sessionBootstrap || (profile !== "clean" && profile !== "history")) return failure("INVALID_DEMO_PROFILE", 400, "A supported synthetic learner profile is required.");
    return response(200, await services.sessionBootstrap.issueLearner(profile));
  }
  if (request.method === "POST" && request.path === "/api/v1/demo/staff-session") {
    const role = unauthenticatedBody?.role;
    const secret = request.headers?.["X-ThinkAI-Staff-Bootstrap"] ?? request.headers?.["x-thinkai-staff-bootstrap"];
    if (!services.sessionBootstrap?.issueStaff || (role !== "presenter" && role !== "auditor") || !secret || secret.length > 1024) return failure("FORBIDDEN", 403, "Staff bootstrap is unavailable.");
    try { return response(200, await services.sessionBootstrap.issueStaff({ role, secret })); } catch (error) { return errorResponse(error); }
  }
  let actor: AuthenticatedActor;
  try { actor = await authenticate(services, request); } catch (error) { return errorResponse(error); }
  const parts = request.path.split("/").filter(Boolean);
  const body = unauthenticatedBody;
  try {
    if (request.method === "GET" && request.path === "/api/v1/home") return response(200, await services.home(actor.actorId));
    if (request.method === "GET" && request.path === "/api/v1/skills") return response(200, await services.skills(actor.actorId));
    if (request.method === "GET" && request.path === "/api/v1/progress") return response(200, await services.progress(actor.actorId));
    if (request.method === "GET" && parts[2] === "challenges" && routeId(parts[3])) return response(200, await services.practice.resume(parts[3], actor.actorId));
    if (request.method === "GET" && parts[2] === "transfers" && routeId(parts[3])) return response(200, await services.transfer.resume(parts[3], actor.actorId));
    if (request.method === "GET" && parts[2] === "receipts" && routeId(parts[3])) return response(200, await services.receipts.get({ id: parts[3], actorId: actor.actorId }));
    if (request.method === "GET" && parts[2] === "audit" && parts[3] === "receipts" && routeId(parts[4])) {
      if (actor.role !== "auditor" && actor.role !== "presenter") return failure("FORBIDDEN", 403, "Audit detail requires an audit session.");
      return response(200, await services.audit(actor.actorId, parts[4]!));
    }
    if (request.method !== "POST") return failure("NOT_FOUND", 404, "Route not found.");
    const key = mutationKey(request); if (typeof key !== "string") return key;
    if (!body) return failure("INVALID_REQUEST", 400, "JSON object body is required.");
    if (request.path === "/api/v1/demo/reset") {
      if (actor.role !== "presenter" || !services.demo) return failure("DEMO_RESET_FORBIDDEN",403,"Demo reset requires a presenter session.");
      const reset = await services.demo.reset({resetBy:actor.actorId, idempotencyKey:key}) as { actorId?: ActorId };
      if (reset.actorId) await services.onDemoReset?.(reset.actorId);
      return response(200, reset);
    }
    if (request.path === "/api/v1/challenges/start" && routeId(String(body.sessionId ?? ""))) return response(201, await services.practice.start({ sessionId: body.sessionId, actorId: actor.actorId, actorSessionId: actor.sessionId, idempotencyKey: key }));
    if (parts[2] === "challenges" && routeId(parts[3]) && parts[4] === "attempts") {
      if (body.kind === "cannot_start" && Object.keys(body).length === 1) return response(200, await services.practice.declareCannotStart({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, idempotencyKey: key }));
      if (body.kind === "attempt" && Object.keys(body).length === 1) return response(200, await services.practice.recordAttempt({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, idempotencyKey: key }));
      return failure("INVALID_ATTEMPT", 400, "Attempt must be exactly kind: attempt or cannot_start.");
    }
    if (parts[2] === "challenges" && routeId(parts[3]) && parts[4] === "interventions" && routeId(parts[5])) return response(200, await services.practice.openReviewedHint({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, interventionId: parts[5], idempotencyKey: key }));
    if (parts[2] === "challenges" && routeId(parts[3]) && parts[4] === "submissions") { const value = answer(body.answer); if (isApiResponse(value)) return value; if (body.reasoning !== undefined && !boundedString(body.reasoning, MAX_REASONING)) return failure("SUBMISSION_INVALID", 400, "Reasoning must be bounded text."); return response(200, await services.practice.submit({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, answer: value, idempotencyKey: key })); }
    if (parts[2] === "challenges" && routeId(parts[3]) && parts[4] === "transfer" && parts[5] === "start" && routeId(String(body.sessionId ?? ""))) return response(201, await services.transfer.start({ sessionId: body.sessionId, practiceSessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, idempotencyKey: key }));
    if (parts[2] === "transfers" && routeId(parts[3]) && parts[4] === "submissions") { const value = answer(body.answer); if (isApiResponse(value)) return value; return response(200, await services.transfer.submit({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, answer: value, idempotencyKey: key })); }
    if (parts[2] === "transfers" && routeId(parts[3]) && parts[4] === "connection" && parts[5] === "reveal") return response(200, await services.transfer.revealConnection({ sessionId: parts[3], actorId: actor.actorId, actorSessionId: actor.sessionId, idempotencyKey: key }));
    if (request.path === "/api/v1/receipts/issue" && routeId(String(body.practiceSessionId ?? "")) && routeId(String(body.transferSessionId ?? ""))) return response(201, await services.receipts.issue({ actorId: actor.actorId, actorSessionId: actor.sessionId, practiceSessionId: body.practiceSessionId, transferSessionId: body.transferSessionId, idempotencyKey: key }));
    return failure("INVALID_REQUEST", 400, "Request does not match a supported action.");
  } catch (error) { return errorResponse(error); }
}
