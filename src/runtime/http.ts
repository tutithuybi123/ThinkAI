import { dispatch, type ApiRequest, type ApiResponse, type ApiServices } from "../api/dispatcher.js";
import type { ProductionRuntime } from "./server.js";

/** Converts a real runtime into the deliberately framework-free Package H API. */
export function apiServicesFromRuntime(runtime: ProductionRuntime): ApiServices {
  return {
    auth: runtime.auth,
    practice: runtime.practice,
    transfer: runtime.transfer,
    receipts: runtime.receipts,
    home: runtime.home,
    skills: runtime.skills,
    progress: runtime.progress,
    audit: runtime.audit,
    demo: runtime.demo,
    sessionBootstrap: runtime.sessionBootstrap,
    ...(runtime.onDemoReset === undefined ? {} : { onDemoReset: runtime.onDemoReset }),
  };
}

export async function handleHttp(runtime: ProductionRuntime, request: ApiRequest): Promise<ApiResponse> {
  return dispatch(apiServicesFromRuntime(runtime), request);
}
