import { handleHttp } from "../../src/runtime/http.js";
import { createProductionRuntime, runtimeConfigurationFromEnvironment, type ProductionRuntime } from "../../src/runtime/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let runtimePromise: Promise<ProductionRuntime> | undefined;
function getRuntime(): Promise<ProductionRuntime> {
  runtimePromise ??= createProductionRuntime(runtimeConfigurationFromEnvironment());
  return runtimePromise;
}

/** Dependency-safe health signal; no learner, session, or configuration data is exposed. */
export async function GET(): Promise<Response> {
  try {
    const result = await handleHttp(await getRuntime(), { method: "GET", path: "/healthz" });
    return Response.json(result.body, { status: result.status });
  } catch {
    return Response.json({ status: "unavailable", persistence: "unavailable", ai: "disabled" }, { status: 503 });
  }
}
