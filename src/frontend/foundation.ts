export type FoundationRoute = "home" | "learn" | "progress" | "ops";

export interface FrontendError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
}

interface ApiErrorBody {
  readonly error?: { readonly code?: unknown; readonly message?: unknown };
}

export function foundationRoute(pathname: string): FoundationRoute {
  if (pathname === "/") return "home";
  if (pathname === "/progress") return "progress";
  if (pathname === "/ops" || pathname.startsWith("/ops/")) return "ops";
  return "learn";
}

export function normalizeApiError(value: unknown): FrontendError {
  const body = value as ApiErrorBody;
  const code = body?.error?.code;
  const message = body?.error?.message;
  if (typeof code === "string" && typeof message === "string") {
    return Object.freeze({ code, message, retryable: code === "AI_UNAVAILABLE" || code === "SERVICE_UNAVAILABLE" });
  }
  return Object.freeze({ code: "NETWORK_ERROR", message: "Không thể kết nối. Hãy thử lại.", retryable: true });
}
