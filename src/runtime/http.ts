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
    health: runtime.health,
    startPublishedPractice: runtime.startPublishedPractice,
    startPublishedTransfer: runtime.startPublishedTransfer,
    retryPublishedTransfer: runtime.retryPublishedTransfer,
    practiceLearnerView: runtime.practiceLearnerView,
    advancePractice: runtime.advancePractice,
    practiceProcessFeedback: runtime.practiceProcessFeedback,
    demo: runtime.demo,
    ops: runtime.ops,
    ...(runtime.companion?{companion:runtime.companion}:{}),
    sessionBootstrap: runtime.sessionBootstrap,
    ...(runtime.onDemoReset === undefined ? {} : { onDemoReset: runtime.onDemoReset }),
  };
}

export async function handleHttp(runtime: ProductionRuntime, request: ApiRequest): Promise<ApiResponse> {
  return dispatch(apiServicesFromRuntime(runtime), request);
}
