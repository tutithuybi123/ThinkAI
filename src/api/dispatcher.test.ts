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

test("golden API flow delegates policy to services and keeps transfer DTO isolated", async () => {
  const actor = actorId("actor_api"), practiceId = challengeSessionId("challenge_api"), transferId = transferSessionId("transfer_api");
  const store = new TransactionalEvidencePersistence(new MemoryPersistenceDatabase());
  const content = ReviewedContentRepository.fromRaw(packageAStructuralFixture, { allowStructuralTestFixture: true });
  const practice = new PracticeChallengeService(content, store, scoringService);
  const transfer = new TransferService(content, store, scoringService);
  const receipts = new CapabilityReceiptService(store);
  const services = {
    home: async (a: string) => ({ actorId: a, progress: rebuildLearnerProgress(await store.list(actor)) }),
    progress: async () => rebuildLearnerProgress(await store.list(actor)),
    audit: async () => rebuildHistory(await store.list(actor)),
    practice, transfer, receipts: { issue: receipts.issue.bind(receipts), get: async () => ({ unavailable: true }) },
  };
  const post = (path: string, body: unknown, key: string) => dispatch(services, { method: "POST", path, actorId: actor, headers: { "Idempotency-Key": key }, body });
  assert.equal((await post("/api/v1/challenges/start", { sessionId: practiceId, pairId: taskPairId("pair_fixture") }, "a")).status, 201);
  await post(`/api/v1/challenges/${practiceId}/attempts`, { kind: "attempt" }, "b");
  await post(`/api/v1/challenges/${practiceId}/interventions/${interventionId("hint_fixture_1")}/open`, {}, "c");
  const solved = await post(`/api/v1/challenges/${practiceId}/submissions`, { answer: "fixture" }, "d"); assert.equal(solved.status, 200);
  assert.equal((await post(`/api/v1/challenges/${practiceId}/transfer/start`, { sessionId: transferId }, "e")).status, 201);
  const transferDone = await post(`/api/v1/transfers/${transferId}/submissions`, { answer: "fixture" }, "f");
  assert.equal(transferDone.status, 200); assert.equal(JSON.stringify(transferDone.body).includes("hint_"), false);
  assert.equal((await post("/api/v1/receipts/issue", { practiceSessionId: practiceId, transferSessionId: transferId }, "g")).status, 201);
  assert.equal((await dispatch(services, { method: "GET", path: "/api/v1/progress", actorId: actor })).status, 200);
  assert.equal((await dispatch(services, { method: "POST", path: "/api/v1/challenges/start", actorId: actor, body: {} })).status, 400);
});
