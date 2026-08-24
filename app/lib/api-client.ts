import { normalizeApiError, type FrontendError } from "../../src/frontend/foundation.js";

export interface ApiRequestOptions {
  readonly method?: "GET" | "POST" | "PUT";
  readonly body?: unknown;
  readonly idempotencyKey?: string;
  readonly signal?: AbortSignal;
}

export class FrontendApiError extends Error {
  public constructor(public readonly detail: FrontendError) { super(detail.message); this.name = "FrontendApiError"; }
}

export function idempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `ui_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function requestJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    let response = await send(path, options);
    if (response.status === 401 && path !== "/api/v1/demo/session") {
      const bootstrap = await send("/api/v1/demo/session", { method: "POST", body: { profile: "clean" } });
      if (bootstrap.ok) response = await send(path, options);
    }
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) throw new FrontendApiError(normalizeApiError(body));
    return body as T;
  } catch (error) {
    if (error instanceof FrontendApiError) throw error;
    throw new FrontendApiError(normalizeApiError(error));
  }
}

function send(path: string, options: ApiRequestOptions): Promise<Response> {
  return fetch(path, { method: options.method ?? "GET", credentials: "include", headers: { ...(options.body === undefined ? {} : { "content-type": "application/json" }), ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}) }, ...(options.signal === undefined ? {} : { signal: options.signal }), ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }) });
}
