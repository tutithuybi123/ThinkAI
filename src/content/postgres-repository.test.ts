import assert from "node:assert/strict";
import test from "node:test";
import { actorId, contentRevisionId } from "../domain/ids.js";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { runMigrations } from "../persistence/migrations.js";
import { createDraftRevision } from "./lifecycle.js";
import { PostgresContentRevisionRepository } from "./postgres-repository.js";

const url = process.env.THINKAI_TEST_DATABASE_URL;
const integration = url ? test : test.skip;
async function clientFor(schema: string) { const admin=NodePostgresClient.fromConnectionString(url!); try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`); } finally { await admin.close(); } const client=NodePostgresClient.fromConnectionStringInSchema(url!,schema); await runMigrations(client); return client; }

integration("content revisions retain immutable body hash and lifecycle after reload", async () => {
  const client=await clientFor("thinkai_content_revisions"); try { const repo=new PostgresContentRevisionRepository(client); const id=contentRevisionId("revision_pg_1"); const draft=createDraftRevision({id,body:{title:"draft", nested:{items:["one"]}}}); await repo.createDraft(draft); const reviewed=await repo.submitForReview<typeof draft.body>(id); const approved=await repo.approve<typeof draft.body>(id); assert.equal(reviewed.bodyHash,draft.bodyHash); assert.equal(approved.bodyHash,draft.bodyHash); const loaded=await new PostgresContentRevisionRepository(client).getRevision<typeof draft.body>(id); assert.equal(loaded?.lifecycle,"APPROVED"); assert.deepEqual(loaded?.body,draft.body); assert.equal(loaded?.bodyHash,draft.bodyHash); assert.throws(() => (loaded!.body.nested.items as string[]).push("bad")); } finally { await client.close(); } });

integration("selection fails closed unless the exact revision is published", async () => { const client=await clientFor("thinkai_content_selection"); try { const repo=new PostgresContentRevisionRepository(client); await assert.rejects(repo.selectInitialPublishedPair(actorId("actor_pg_selection"),contentRevisionId("revision_missing")),/CONTENT_INTEGRITY_FAILED/); } finally { await client.close(); } });
