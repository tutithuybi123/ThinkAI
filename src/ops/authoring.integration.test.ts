import assert from "node:assert/strict";
import test from "node:test";
import { NodePostgresClient } from "../persistence/pg-driver.js";
import { runMigrations } from "../persistence/migrations.js";
import { PostgresContentRevisionRepository } from "../content/postgres-repository.js";
import { OpsService } from "./service.js";
import type { ContentAggregate } from "../content/v11-validator.js";

const base=process.env.THINKAI_TEST_DATABASE_URL;
const integration=base?test:test.skip;

integration("Ops persists a zero-content teacher draft in the production PostgreSQL revision store", async () => {
  const admin=NodePostgresClient.fromConnectionString(base!); const schema="thinkai_ops_authoring_from_zero";
  try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`); } finally { await admin.close(); }
  const db=NodePostgresClient.fromConnectionStringInSchema(base!,schema);
  try {
    await runMigrations(db);
    const ops=new OpsService(new PostgresContentRevisionRepository(db));
    const created=await ops.createInitialDraft({subjectLabel:"Toán 10",topicLabel:"Hàm số bậc hai",microSkillTitle:"Xét dấu tam thức"});
    const reloaded=await new PostgresContentRevisionRepository(db).getRevision<ContentAggregate>(created.id);
    assert.equal(reloaded?.lifecycle,"DRAFT");
    assert.equal(reloaded?.body.microSkills[0]?.microSkill.revisionId,created.id);
    const paired=await ops.addPairDraft(created.id);
    assert.equal(paired.body.microSkills[0]?.pairs.length,1);
    const pair=paired.body.microSkills[0]!.pairs[0]!;
    const complete={microSkills:[{...paired.body.microSkills[0]!,practiceGate:{policyVersion:"practice-gate/v1" as const,strategy:"distinct-correct-count" as const,requiredCorrectCount:1,maxPracticeItems:1},pairs:[{...pair,practiceContent:{...pair.practiceContent,prompt:{format:"plain_text" as const,body:"Bài luyện kỹ thuật"},answerSpec:{kind:"exact_text" as const,accepted:["ok"],normalizationVersion:"answer/v1"}},transferContent:{...pair.transferContent,prompt:{format:"plain_text" as const,body:"Bài vận dụng kỹ thuật"},answerSpec:{kind:"exact_text" as const,accepted:["ok"],normalizationVersion:"answer/v1"}},connectionReveal:{...pair.connectionReveal,title:"Kết nối",sharedRelation:"Cùng một ý tưởng",explanation:{format:"plain_text" as const,body:"Giải thích đã duyệt"}}}]}]};
    await ops.editDraft(created.id,complete);
    await ops.submitReview(created.id); await ops.approve(created.id); const published=await ops.publish(created.id);
    assert.equal(published.lifecycle,"PUBLISHED");
  } finally {
    await db.close();
    const cleanup=NodePostgresClient.fromConnectionString(base!);
    try { await cleanup.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); } finally { await cleanup.close(); }
  }
});
