import { readFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import { createHash } from "node:crypto";

import { PostgresSyntheticSessionRegistry, SignedSessionService, type SessionAuthenticator } from "../auth/session.js";
import { ReviewedContentRepository } from "../content/repository.js";
import { actorId, type ActorId } from "../domain/ids.js";
import { rebuildHistory, rebuildLearnerProgress, CapabilityReceiptService } from "../receipts/service.js";
import { DeterministicScoringService } from "../scoring/service.js";
import { PracticeChallengeService } from "../challenge/service.js";
import { TransferService } from "../transfer/service.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { PostgresTransactionalEvidencePersistence } from "../persistence/index.js";
import { PostgresDemoService } from "../demo/service.js";
import type { DemoFixtureSeed } from "../demo/service.js";
import { runMigrations } from "../persistence/migrations.js";
import { PostgresContentRevisionRepository } from "../content/postgres-repository.js";

export interface RuntimeConfiguration {
  readonly databaseUrl: string;
  readonly sessionSecret: string;
  readonly contentPath: string;
  readonly demoSeedPath: string;
  /** SHA-256 of the approved demo seed JSON bytes, set outside source control. */
  readonly demoSeedSha256: string;
  /** Expected reviewed fixture version for both clean and historical seed data. */
  readonly demoSeedVersion: string;
  /** Test-only: permits the labelled structural fixture for HTTP acceptance. */
  readonly allowStructuralTestContent?: boolean;
  /** Optional deployment-only secret that enables issuing presenter/auditor demo cookies. */
  readonly staffBootstrapSecret?: string;
  readonly cleanDemoActorId: ActorId;
  readonly historyDemoActorId: ActorId;
}

export interface ProductionRuntime {
  readonly auth: SessionAuthenticator;
  readonly practice: PracticeChallengeService;
  readonly transfer: TransferService;
  readonly receipts: CapabilityReceiptService;
  readonly demo: PostgresDemoService;
  readonly contentRevisions: PostgresContentRevisionRepository;
  readonly sessionBootstrap: {
    issueLearner(profile: "clean" | "history"): Promise<{ token: string; actorId: ActorId; role: "learner" }>;
    issueStaff(input: { readonly role: "presenter" | "auditor"; readonly secret: string }): Promise<{ token: string; actorId: ActorId; role: "presenter" | "auditor" }>;
  };
  /** Reset revocation is performed atomically by PostgresDemoService. */
  onDemoReset?(actor: ActorId): Promise<void>;
  home(actor: ActorId): Promise<unknown>;
  skills(actor: ActorId): Promise<unknown>;
  progress(actor: ActorId): Promise<unknown>;
  audit(auditor: ActorId, receiptId: string): Promise<unknown>;
  health(): Promise<{ status: "ok"; persistence: "available"; ai: "disabled" }>;
  close(): Promise<void>;
}

/**
 * Explicit, server-only composition root. It never falls back to the structural
 * fixture: an approved teacher-reviewed bundle must be supplied as JSON at startup.
 */
export async function createProductionRuntime(config: RuntimeConfiguration): Promise<ProductionRuntime> {
  const [rawContentText, rawSeedText] = await Promise.all([
    readFile(config.contentPath, "utf8"),
    readFile(config.demoSeedPath, "utf8"),
  ]);
  if (createHash("sha256").update(rawSeedText, "utf8").digest("hex") !== config.demoSeedSha256) throw new Error("Configured demo seed digest does not match the supplied approved seed.");
  const rawContent = JSON.parse(rawContentText) as unknown;
  const rawSeed = JSON.parse(rawSeedText) as DemoFixtureSeed;
  if (rawSeed.clean.fixtureVersion !== config.demoSeedVersion || rawSeed.history.fixtureVersion !== config.demoSeedVersion) throw new Error("Configured demo seed version does not match the supplied approved seed.");
  const content = ReviewedContentRepository.fromRaw(rawContent, config.allowStructuralTestContent ? { allowStructuralTestFixture: true } : {});
  const client = NodePostgresClient.fromConnectionString(config.databaseUrl);
  await runMigrations(client);
  const persistence = new PostgresTransactionalEvidencePersistence(client);
  const contentRevisions = new PostgresContentRevisionRepository(client);
  const scoring = new DeterministicScoringService();
  const signer = new SignedSessionService(config.sessionSecret);
  const auth = new PostgresSyntheticSessionRegistry(signer, client, [
    { actorId: config.cleanDemoActorId, role: "learner" },
    { actorId: config.historyDemoActorId, role: "learner" },
    { actorId: actorId("actor_demo_presenter"), role: "presenter" },
    { actorId: actorId("actor_demo_auditor"), role: "auditor" },
  ]);
  await auth.initialize();
  const receipts = new CapabilityReceiptService(persistence);
  const demo = new PostgresDemoService(client, config.cleanDemoActorId);
  await demo.initialize(rawSeed);
  return Object.freeze({
    auth,
    practice: new PracticeChallengeService(content, persistence, scoring),
    transfer: new TransferService(content, persistence, scoring),
    receipts,
    demo,
    contentRevisions,
    sessionBootstrap: {
      async issueLearner(profile: "clean" | "history"): Promise<{ token: string; actorId: ActorId; role: "learner" }> {
        const actor = profile === "clean" ? config.cleanDemoActorId : config.historyDemoActorId;
        return { token: await auth.issue(actor, 30 * 60 * 1000), actorId: actor, role: "learner" };
      },
      async issueStaff(input: { readonly role: "presenter" | "auditor"; readonly secret: string }) {
        if (!config.staffBootstrapSecret || !sameSecret(config.staffBootstrapSecret, input.secret)) throw Object.assign(new Error("Staff bootstrap is unavailable."), { code: "FORBIDDEN" });
        const actor = input.role === "presenter" ? actorId("actor_demo_presenter") : actorId("actor_demo_auditor");
        return { token: await auth.issue(actor, 15 * 60 * 1000), actorId: actor, role: input.role };
      },
    },
    async home(actor: ActorId) { return { actorId: actor, progress: rebuildLearnerProgress(await persistence.list(actor)) }; },
    async skills(_actor: ActorId) {
      const published = await contentRevisions.listPublishedHierarchy();
      if (published.length) return { active: published.flatMap((revision) => revision.body.microSkills.map((node) => ({ microSkillId: node.microSkill.id, microSkillRevisionId: node.microSkill.revisionId, displayOrder: node.microSkill.displayOrder }))), locked: [] };
      if (!config.allowStructuralTestContent) throw Object.assign(new Error("No published content revision is available."), { code: "CONTENT_INTEGRITY_FAILED" });
      const pair = content.selectApprovedPair();
      return { active: [{ skillId: pair.skillId, pairId: pair.id, pairVersion: pair.version }], locked: [] };
    },
    async progress(actor: ActorId) { return rebuildLearnerProgress(await persistence.list(actor)); },
    async audit(_auditor: ActorId, receiptId: string) {
      const events = await persistence.list();
      const receipt = events.find((stored) => stored.event.type === "capability_receipt_issued" && stored.event.payload.receiptId === receiptId);
      if (!receipt) throw Object.assign(new Error("Capability receipt was not found."), { code: "RECEIPT_NOT_FOUND" });
      return { receiptEvent: receipt, history: rebuildHistory(events.filter((stored) => stored.event.actorId === receipt.event.actorId)) };
    },
    async health() { return demo.health(); },
    async close() { await client.close(); },
  });
}

export function runtimeConfigurationFromEnvironment(environment: NodeJS.ProcessEnv = process.env): RuntimeConfiguration {
  const databaseUrl = environment.THINKAI_DATABASE_URL;
  const sessionSecret = environment.THINKAI_SESSION_SECRET;
  const contentPath = environment.THINKAI_CONTENT_PATH;
  const demoSeedPath = environment.THINKAI_DEMO_SEED_PATH;
  const demoSeedSha256 = environment.THINKAI_DEMO_SEED_SHA256;
  const demoSeedVersion = environment.THINKAI_DEMO_SEED_VERSION;
  if (!databaseUrl || !sessionSecret || !contentPath || !demoSeedPath || !demoSeedSha256 || !/^[a-f0-9]{64}$/i.test(demoSeedSha256) || !demoSeedVersion) throw new Error("THINKAI_DATABASE_URL, THINKAI_SESSION_SECRET, THINKAI_CONTENT_PATH, THINKAI_DEMO_SEED_PATH, THINKAI_DEMO_SEED_SHA256 and THINKAI_DEMO_SEED_VERSION are required.");
  const allowStructuralTestContent = environment.THINKAI_RUNTIME_ACCEPTANCE_TEST === "1";
  if (allowStructuralTestContent && environment.NODE_ENV === "production") throw new Error("THINKAI_RUNTIME_ACCEPTANCE_TEST is forbidden in production.");
  return { databaseUrl, sessionSecret, contentPath, demoSeedPath, demoSeedSha256: demoSeedSha256.toLowerCase(), demoSeedVersion, ...(allowStructuralTestContent ? { allowStructuralTestContent: true } : {}), ...(environment.THINKAI_DEMO_STAFF_BOOTSTRAP_SECRET ? { staffBootstrapSecret: environment.THINKAI_DEMO_STAFF_BOOTSTRAP_SECRET } : {}), cleanDemoActorId: actorId("actor_demo_clean"), historyDemoActorId: actorId("actor_demo_history") };
}

function sameSecret(expected: string, actual: string): boolean {
  const left = Buffer.from(expected); const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
