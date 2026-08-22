import assert from "node:assert/strict";
import test from "node:test";
import { PracticeChallengeService } from "../challenge/service.js";
import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, challengeSessionId, interventionId, taskPairId, transferSessionId } from "../domain/ids.js";
import { packageAStructuralFixture } from "../fixtures/package-a-structural.js";
import { MemoryPersistenceDatabase, TransactionalEvidencePersistence } from "../persistence/index.js";
import { CapabilityReceiptService, rebuildHistory, rebuildLearnerProgress } from "../receipts/service.js";
import { scoringService } from "../scoring/service.js";
import { TransferService } from "../transfer/service.js";
import { dispatch } from "./dispatcher.js";
import { SignedSessionService, SyntheticSessionRegistry } from "../auth/session.js";
import { DemoService } from "../demo/service.js";

test("golden API flow delegates policy to services and keeps transfer DTO isolated", async () => {
  const actor = actorId("actor_api"), practiceId = challengeSessionId("challenge_api"), transferId = transferSessionId("transfer_api");
  const database = new MemoryPersistenceDatabase(); const store = new TransactionalEvidencePersistence(database);
  const content = ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  const practice = new PracticeChallengeService(content, store, scoringService);
  const transfer = new TransferService(content, store, scoringService);
  const receipts = new CapabilityReceiptService(store);
  const auth = new SignedSessionService("0123456789abcdef0123456789abcdef", () => new Date("2026-08-14T00:00:00Z"));
  const token = auth.issue({ actorId: actor, role: "learner", sessionId: "session_api", ttlMs: 60_000 });
  const presenterToken = auth.issue({ actorId: actorId("actor_presenter"), role: "presenter", sessionId: "session_presenter", ttlMs: 60_000 });
  const services = {
    auth,
    home: async (a: string) => ({ actorId: a, progress: rebuildLearnerProgress(await store.list(actor)) }),
    skills: async () => ({ active: [{ skillId: "skill_fixture" }], locked: [] }),
    progress: async () => rebuildLearnerProgress(await store.list(actor)),
    audit: async () => rebuildHistory(await store.list(actor)),
    practice, transfer, receipts: { issue: receipts.issue.bind(receipts), get: async () => ({ unavailable: true }) },
    demo: new DemoService(database, actor),
  };
  const post = (path: string, body: unknown, key: string) => dispatch(services, { method: "POST", path, headers: { "Idempotency-Key": key, authorization: `Bearer ${token}` }, body });
  assert.equal((await post("/api/v1/challenges/start", { sessionId: practiceId, pairId: taskPairId("pair_fixture") }, "a")).status, 201);
  const serverSelected = await post("/api/v1/challenges/start", { sessionId: challengeSessionId("challenge_server_selected"), pairId: "pair_forged" }, "server-selected");
  assert.equal((serverSelected.body as { challenge: { pairId: string } }).challenge.pairId, taskPairId("pair_fixture"));
  await post(`/api/v1/challenges/${practiceId}/attempts`, { kind: "attempt" }, "b");
  assert.equal((await post(`/api/v1/challenges/${practiceId}/attempts`, { kind: "attempt", unexpected: true }, "invalid-attempt")).status, 400);
  await post(`/api/v1/challenges/${practiceId}/interventions/${interventionId("hint_fixture_1")}/open`, {}, "c");
  const solved = await post(`/api/v1/challenges/${practiceId}/submissions`, { answer: "fixture" }, "d"); assert.equal(solved.status, 200);
  assert.equal((await post(`/api/v1/challenges/${practiceId}/transfer/start`, { sessionId: transferId }, "e")).status, 201);
  const transferDone = await post(`/api/v1/transfers/${transferId}/submissions`, { answer: "fixture" }, "f");
  assert.equal(transferDone.status, 200); assert.equal(JSON.stringify(transferDone.body).includes("hint_"), false);
  assert.equal((await post(`/api/v1/transfers/${transferId}/connection/reveal`, {}, "reveal")).status, 200);
  assert.equal((await post("/api/v1/receipts/issue", { practiceSessionId: practiceId, transferSessionId: transferId }, "g")).status, 201);
  assert.equal((await dispatch(services, { method: "GET", path: "/api/v1/progress", headers: { authorization: `Bearer ${token}` } })).status, 200);
  assert.equal((await dispatch(services, { method: "GET", path: "/api/v1/skills", headers: { authorization: `Bearer ${token}` } })).status, 200);
  assert.equal((await dispatch(services, { method: "POST", path: "/api/v1/challenges/start", body: {} })).status, 401);
  assert.equal((await post(`/api/v1/challenges/${practiceId}/submissions`, { answer: { kind: "text", value: "x".repeat(4_001) } }, "too-large-answer")).status, 400);
  assert.equal((await post(`/api/v1/challenges/${practiceId}/submissions`, { answer: { kind: "text", value: "fixture", extra: "not-allowed" } }, "malformed-answer")).status, 400);
  assert.equal((await post(`/api/v1/challenges/${practiceId}/submissions`, { answer: "fixture", reasoning: { text: "not-a-string" } }, "malformed-reasoning")).status, 400);
  const nested = { child: { child: { child: { child: { child: { child: { child: { child: { child: true } } } } } } } } };
  assert.equal((await post(`/api/v1/challenges/${practiceId}/attempts`, nested, "deep-body")).status, 400);
  assert.equal((await dispatch(services, { method:"POST", path:"/api/v1/demo/reset", headers:{"Idempotency-Key":"reset",authorization:`Bearer ${token}`}, body:{} })).status,403);
  assert.equal((await dispatch(services, { method:"POST", path:"/api/v1/demo/reset", headers:{"Idempotency-Key":"reset2",authorization:`Bearer ${presenterToken}`}, body:{} })).status,200);
  assert.equal((await dispatch(services, { method: "GET", path: "/api/v1/progress", headers: { authorization: `Bearer ${token}x` } })).status, 401);
});

test("server-controlled demo bootstrap issues only configured learner identities", async () => {
  const signer = new SignedSessionService("0123456789abcdef0123456789abcdef");
  const clean = actorId("actor_demo_clean");
  const registry = new SyntheticSessionRegistry(signer, [{ actorId: clean, role: "learner" }]);
  const response = await dispatch({
    auth: registry,
    home: async () => ({}), skills: async () => ({}), progress: async () => ({}), audit: async () => ({}),
    practice: {}, transfer: {}, receipts: {},
    sessionBootstrap: { issueLearner: () => ({ token: registry.issue(clean, 60_000), actorId: clean, role: "learner" }) },
  }, { method: "POST", path: "/api/v1/demo/session", body: { profile: "clean" } });
  assert.equal(response.status, 200);
  const token = (response.body as { token: string }).token;
  assert.equal(registry.verify(token).actorId, clean);
  assert.equal((await dispatch({ auth: registry, home: async () => ({}), skills: async () => ({}), progress: async () => ({}), audit: async () => ({}), practice: {}, transfer: {}, receipts: {}, sessionBootstrap: { issueLearner: () => ({ token, actorId: clean, role: "learner" }) } }, { method: "POST", path: "/api/v1/demo/session", body: { profile: "presenter" } })).status, 400);
});

test("published Transfer start and retry delegate selection to the runtime without accepting client pair or task fields",async()=>{
  const actor=actorId("actor_transfer_runtime"); const auth=new SignedSessionService("0123456789abcdef0123456789abcdef"); const token=auth.issue({actorId:actor,role:"learner",sessionId:"session_transfer_runtime",ttlMs:60_000}); const calls:string[]=[];
  const services={auth,home:async()=>({}),skills:async()=>({}),progress:async()=>({}),audit:async()=>({}),practice:{},transfer:{},receipts:{},startPublishedTransfer:async(_actor:unknown,practiceId:string)=>{calls.push(`start:${practiceId}`);return {nextAction:"TRANSFER_STARTED",sessionId:"transfer_runtime"};},retryPublishedTransfer:async(_actor:unknown,transferId:string)=>{calls.push(`retry:${transferId}`);return {nextAction:"NO_FRESH_TRANSFER_AVAILABLE"};}};
  const headers={authorization:`Bearer ${token}`,"Idempotency-Key":"transfer-runtime"};
  const started=await dispatch(services,{method:"POST",path:"/api/v1/challenges/challenge_runtime/transfer/start",headers,body:{pairId:"pair_forged",taskId:"task_forged",version:"forged"}}); assert.equal(started.status,201); assert.deepEqual(calls,["start:challenge_runtime"]);
  const retried=await dispatch(services,{method:"POST",path:"/api/v1/transfers/transfer_runtime/retry",headers:{...headers,"Idempotency-Key":"retry-runtime"},body:{nextItem:"pair_forged"}}); assert.equal(retried.status,201); assert.deepEqual(calls,["start:challenge_runtime","retry:transfer_runtime"]);
});

test("protected staff bootstrap cannot turn a learner request into an operational role", async () => {
  const signer = new SignedSessionService("0123456789abcdef0123456789abcdef");
  const learner = actorId("actor_demo_clean"); const presenter = actorId("actor_demo_presenter");
  const registry = new SyntheticSessionRegistry(signer, [{ actorId: learner, role: "learner" }, { actorId: presenter, role: "presenter" }]);
  const services = {
    auth: registry, home: async () => ({}), skills: async () => ({}), progress: async () => ({}), audit: async () => ({}), practice: {}, transfer: {}, receipts: {},
    sessionBootstrap: {
      issueLearner: () => ({ token: registry.issue(learner, 60_000), actorId: learner, role: "learner" as const }),
      issueStaff: ({ role, secret }: { role: "presenter" | "auditor"; secret: string }) => {
        if (secret !== "presenter-only") throw Object.assign(new Error("bad secret"), { code: "FORBIDDEN" });
        if (role !== "presenter") throw Object.assign(new Error("unsupported"), { code: "FORBIDDEN" });
        return { token: registry.issue(presenter, 60_000), actorId: presenter, role: "presenter" as const };
      },
    },
  };
  assert.equal((await dispatch(services, { method: "POST", path: "/api/v1/demo/staff-session", body: { role: "presenter" } })).status, 403);
  const issued = await dispatch(services, { method: "POST", path: "/api/v1/demo/staff-session", headers: { "X-ThinkAI-Staff-Bootstrap": "presenter-only" }, body: { role: "presenter" } });
  assert.equal(issued.status, 200);
  assert.equal(registry.verify((issued.body as { token: string }).token).role, "presenter");
});

test("presenter reset rotates only the clean learner session through the API boundary", async () => {
  const signer = new SignedSessionService("0123456789abcdef0123456789abcdef");
  const clean = actorId("actor_demo_clean"); const presenter = actorId("actor_demo_presenter");
  const registry = new SyntheticSessionRegistry(signer, [{ actorId: clean, role: "learner" }, { actorId: presenter, role: "presenter" }]);
  const learnerToken = registry.issue(clean, 60_000); const presenterToken = registry.issue(presenter, 60_000);
  const database = new MemoryPersistenceDatabase();
  const result = await dispatch({
    auth: registry, home: async () => ({}), skills: async () => ({}), progress: async () => ({}), audit: async () => ({}), practice: {}, transfer: {}, receipts: {},
    demo: new DemoService(database, clean), onDemoReset: (actor) => registry.rotate(actor),
  }, { method: "POST", path: "/api/v1/demo/reset", headers: { authorization: `Bearer ${presenterToken}`, "Idempotency-Key": "reset" }, body: {} });
  assert.equal(result.status, 200);
  assert.throws(() => registry.verify(learnerToken), /not active/i);
  assert.equal(registry.verify(presenterToken).actorId, presenter);
});
