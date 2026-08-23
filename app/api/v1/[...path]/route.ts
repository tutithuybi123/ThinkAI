import { handleHttp } from "../../../../src/runtime/http.js";
import { createProductionRuntime, runtimeConfigurationFromEnvironment, type ProductionRuntime } from "../../../../src/runtime/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let runtimePromise: Promise<ProductionRuntime> | undefined;
function getRuntime(): Promise<ProductionRuntime> {
  runtimePromise ??= createProductionRuntime(runtimeConfigurationFromEnvironment());
  return runtimePromise;
}

async function bind(request: Request): Promise<Response> {
  const method = request.method;
  let body: unknown;
  if (method !== "GET" && method !== "HEAD") {
    const text = await request.text();
    if (text.length > 16_384) return Response.json({ error: { code: "REQUEST_TOO_LARGE", message: "Request body is too large." } }, { status: 413 });
    try { body = text ? JSON.parse(text) : undefined; } catch { return Response.json({ error: { code: "INVALID_JSON", message: "Request body must be JSON." } }, { status: 400 }); }
  }
  try {
    const headers = Object.fromEntries(request.headers.entries());
    if (!headers.authorization) {
      const sessionCookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith("thinkai_session="))?.slice("thinkai_session=".length);
      if (sessionCookie) headers.authorization = `Bearer ${sessionCookie}`;
    }
    const result = await handleHttp(await getRuntime(), {
      method,
      path: new URL(request.url).pathname,
      headers,
      body,
    });
    const bootstrap = result.body as { token?: unknown };
    if (request.method === "POST" && ["/api/v1/demo/session", "/api/v1/demo/staff-session"].includes(new URL(request.url).pathname) && typeof bootstrap.token === "string") {
      const { token: _token, ...publicBody } = bootstrap as { token: string; [key: string]: unknown };
      return Response.json(publicBody, { status: result.status, headers: { "Set-Cookie": `thinkai_session=${_token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800${process.env.NODE_ENV === "production" ? "; Secure" : ""}` } });
    }
    return Response.json(result.body, { status: result.status });
  } catch {
    return Response.json({ error: { code: "SERVICE_UNAVAILABLE", message: "ThinkAI service is unavailable." } }, { status: 503 });
  }
}

export const GET = bind;
export const POST = bind;
export const PUT = bind;
