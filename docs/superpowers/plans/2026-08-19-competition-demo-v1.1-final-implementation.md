# Competition Demo v1.1 Final Implementation Plan

**Status:** Externally reviewed / PASS — approved for sliced execution

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute one slice at a time. Every production behavior starts with a failing test.

**Goal:** Deliver one online, teacher-reviewed Grade-10 mathematics vertical slice: published content → AI-assisted written Practice → server-derived grading/evidence → isolated independent Transfer → connection reveal → honest receipt/progress/audit.

**Architecture:** Extend the existing modular monolith and its append-only event/session core. Replace only the unintegrated v1.1 foundation contracts that predate external review; preserve the runtime-reviewed deterministic scorer, challenge/transfer isolation, receipt policy, persistence transaction model, signed synthetic session model, and task-oriented dispatcher.

**Tech stack:** TypeScript 5.9, Node 24, Next.js 16 App Router, `tsx --test`, PostgreSQL via `pg`, existing migration runner. Do not select or hardcode an AI provider in this plan.

**Source of truth:**

- `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`
- `docs/architecture/competition-mvp/v1.1-amendment-contracts.md`
- `docs/decisions/011-evidence-aware-hybrid-grading.md`

**Supersedes:** `docs/superpowers/plans/2026-08-19-evidence-aware-demo-v1.1.md`. That historical plan is incomplete and stale: it assumes `answerRevealed: false`, model-supplied grading outcome, and has no reviewed content lifecycle, semantic rubric validation, Ops workflow, or final vertical-slice sequencing.

## Baseline and code map

| Area | Current implementation | v1.1 disposition |
|---|---|---|
| Content | `src/content/{schema,validator,loader,repository,snapshot}.ts`; immutable approved JSON bundle; exactly one approved pair | **Extend/replace repository boundary.** Keep snapshot integrity and bundle semantics; add hierarchy, lifecycle revisions, authored rubric/guidance, and a PostgreSQL repository shared by Ops and learner runtime. |
| Deterministic scoring | `src/scoring/service.ts`; exact text, choice, decimal numeric; expression deliberately invalid | **Keep/extend adapters.** Do not replace decimal/choice behavior; add explicit applicability and future-safe adapters. |
| Practice | `src/challenge/service.ts`; reviewed hint events, deterministic score immediately sets `solved` | **Extend.** Replace its scoring completion seam with server aggregation while retaining session/idempotency/event transaction shape. |
| Transfer | `src/transfer/service.ts`; separate snapshot, safe DTO/context, deterministic `verified`, reveal gate | **Extend minimally.** Preserve isolation and server session; use transfer-owned aggregate grading only. |
| Receipts/progress | `src/receipts/service.ts`, runtime projections | **Keep/extend.** Map eligibility to aggregate gate facts without letting AI issue receipts. |
| Evidence/persistence | `src/evidence/schema.ts`, `src/persistence/index.ts`, migrations `0001`–`0006` | **Keep/additive migration.** Add event types/payload validation and content/conversation storage; no destructive migration. |
| API/runtime | `src/api/dispatcher.ts`, `src/runtime/{http,server}.ts`, `app/api/v1/[...path]/route.ts` | **Extend.** Retain idempotency, cookie auth and framework-free dispatcher. |
| v1.1 foundation | `src/grading/*`, `src/assistance/*`, `src/ai/contracts.ts` | **Replace/migrate.** They are unit-tested but not runtime-integrated and contradict final contracts (model outcome and hard-coded reveal false). |
| Frontend | `app/page.tsx` local step mock; no `/ops`; no Playwright tests | **Replace UI implementation only.** Reuse approved competition UI grammar/docs, not the mock state machine. |

### Baseline verification record

Run before Slice 0 and preserve output in the implementation handoff.

| Command | Status at planning | Treatment |
|---|---|---|
| `npm test` | 65 pass, 9 PostgreSQL/runtime skips, 1 failure in `tools/benchmarks/thinkai-feedback/runner-state.test.mjs` (`completed_result_missing_fail_closed`) | **Pre-existing/unrelated** to v1.1 application work unless reproduced after clean benchmark handoff. Do not fix inside a feature slice. |
| `npm run check` | pass | Required gate after every TypeScript slice. |
| `npm run build` | no script exists | Add a documented build command only if the package script is deliberately added in the deployment slice; until then use `npx next build` as an explicit CI check. |
| Runtime integration | `npm run test:runtime` exists; requires Docker/PostgreSQL env and uses structural fixture only | Required after additive migration/API slices; it is not proof of teacher-reviewed content. |

## Global constraints

* Keep `competition-demo-v1.0` historical and use v1.1 as current authority.
* Use synthetic learner data only; never log credentials, raw tokens, or real child data.
* `CORRECT` alone may satisfy a grading gate. `PARTIALLY_CORRECT`/`INCORRECT` are non-passes; `UNCERTAIN` fails closed.
* AI supplies candidate replies or rubric facets only. Server validation/aggregation/policy owns support classification, grading outcomes, gates, progression and receipts.
* Transfer receives no Practice context through any learner-facing or model contract.
* Do not introduce broad LMS, general chat, handwriting/OCR, mastery score, adaptive curriculum, or class management.

## Critical path and release classification

**Local Product P0:** Slices 0–10 deliver a complete local/CI vertical slice using approved deterministic fake AI adapters. It includes publishable content, static human-authored learner path, semantically safe grading/evidence, server gates, isolated Transfer, Ops, and browser E2E. Fake adapters are test-only and are never labelled live AI.

**Competition Release P0:** Slices 0–11. It additionally requires a qualified real AI provider, persistent online deployment, and complete competition provenance/evidence. Runtime resilience permits an honest unavailable fallback during a transient outage; it does not permit declaring a release ready when a required shipped v1.1 AI capability was intentionally never configured/qualified. For the intended Demo path, Practice Companion is real P0 and must be qualified/configured; Practice Process Feedback must also be qualified/configured while that shipped flow displays it. Published rubric-route tasks additionally require their corresponding qualified evaluator.

**P1:** presentation polish, responsive/non-blocking UX refinements, richer audit/history, and additional deterministic adapters after each has its own reviewed test corpus.

**Deferred:** multi-subject curriculum graph, role system beyond protected demo staff/Ops, provider-specific optimization, general tutor, automatic publishing, handwritten input/OCR, recommendation engine.

## AI capability and release-readiness matrix

| Capability | Local/CI adapter | Unavailable or invalid behavior | Gate/release rule |
|---|---|---|---|
| Practice Companion | Deterministic fake allowed only in unit, integration, CI, and local deterministic E2E | Practice remains usable; deliver no fabricated reply; show honest `AI_UNAVAILABLE`; never mutate score/gate/evidence policy | For intended Competition Release P0 it is a required qualified/configured real learner capability. A temporary outage may use the resilience fallback; intentional absence cannot ship as v1.1 ready. |
| Practice Process Feedback | Deterministic fake allowed only in unit, integration, CI, and local deterministic E2E | Persisted grading is unchanged; show feedback-unavailable; no pass/gate/receipt effect | Required qualified/configured real capability if the shipped Practice flow displays it. A temporary outage may use fallback; disabling/removing it before release changes the shipped flow and requires scope review. |
| Practice Rubric Evaluator | Deterministic fake allowed only in unit, integration, CI, and local deterministic E2E | When required by reviewed task, unavailable/malformed/schema-invalid/semantic-invalid produces `UNCERTAIN` and no `practice_pass` | Required for a published live rubric-route task; qualified real provider must be configured and healthy for Competition Release P0. |
| Transfer Rubric Evaluator | Deterministic fake allowed only in unit, integration, CI, and local deterministic E2E | When required, produces `UNCERTAIN`; no `transfer_pass`, reveal, or receipt | Required for a published live rubric-route transfer; qualified real provider must be configured and healthy for Competition Release P0. |

Provider-neutral interfaces from Slices 5–6 expose capability status explicitly. They never silently disable a required evaluator or present deterministic fake output as live AI.

## Ordered executable slices

### Slice 0 — Freeze baseline and contract migration boundary (P0)

**Goal:** Create a reproducible starting point and prevent execution from silently using the superseded plan/foundation contracts.

**Why now / dependencies:** No production change before current test, migration, and contract state are recorded. Depends only on this plan and the three reviewed source documents.

**Existing code to reuse:** `package.json` scripts; `src/persistence/migrations.ts`; runtime acceptance harness; existing foundation tests.

**Files to modify:** none until baseline output is recorded in the approved work item/evidence location.

**Files to create:** none in application code; execution may add only approved test artifacts under existing ignored/private conventions.

**Domain/API contract changes:** none. Mark `src/grading`, `src/assistance`, and `src/ai/contracts.ts` as replacement targets in the implementation issue before editing them.

**Database/migration impact:** none.

**Tests to write first:** none; run existing suite as a diagnostic, then write feature tests in Slice 1.

**Implementation steps:**

1. Run `npm test`, `npm run check`, and, when Docker config is present, `npm run test:runtime`.
2. Record the benchmark runner failure as pre-existing/unrelated; halt and reclassify if it starts failing in an application-focused command.
3. Read the three v1.1 documents and this plan in the executing session; do not execute the superseded plan.

**Verification commands:** `npm test`; `npm run check`; optional documented runtime command from `docs/reviews/backend-runtime-acceptance.md`.

**Acceptance criteria:** Baseline status is attached to the Beads task; no v1.1 implementation has started from stale `RubricEvaluation` or `answerRevealed` semantics.

**Risks / fail-closed behavior:** An unknown baseline failure blocks the affected slice. Existing benchmark failure is not hidden, deleted, or changed.

**Rollback / migration safety:** No mutation.

### Slice 1 — Content aggregate contracts and lifecycle (P0, Gate A)

**Goal:** Extend the current `ContentBundle` model into a versioned Subject → Topic → MicroSkill aggregate with authored written-solution/rubric/guidance data and the reviewed lifecycle.

**Why now / dependencies:** Grading, AI prompts, Ops, and learner selection need reviewed content shape before service work. Depends on Slice 0.

**Existing code to reuse:** branded IDs in `src/domain/ids.ts`; `RichContent`, `ReviewRecord`, `TaskContent`, `ReviewedTaskPair`, `ConnectionRevealSpec`, `createReviewedPairSnapshot`; `validateContentBundle` and its fixtures/tests.

**Files to modify:** `src/content/schema.ts`, `src/content/validator.ts`, `src/content/loader.ts`, `src/content/snapshot.ts`, `src/domain/ids.ts`, `src/domain/policies.ts`, `src/fixtures/package-a-structural.ts` only to keep structural fixture valid.

**Files to create:** `src/content/lifecycle.ts`, `src/content/lifecycle.test.ts`, `src/content/rubric.ts`, `src/content/rubric.test.ts`.

**Domain/API contract changes:**

* Add branded `SubjectId`, `TopicId`, `MicroSkillId`, `ContentRevisionId` without changing existing `SkillId` consumers until an adapter maps MicroSkill to legacy Skill.
* Add `SubjectContent`, `TopicContent`, and `MicroSkillContent`; retain `SkillContent` as the runtime capability relation until migration completes, rather than duplicate scoring identity.
* A `PublishedMicroSkillRevision` contains/references a small bank of reviewed Practice/Transfer pairs and supplies `displayOrder`, plus either `prerequisiteMicroSkillIds` or an explicit `nextMicroSkillId`. This is a static human-authored path; no AI recommendation or mastery score is introduced.
* Learner chooses Subject → Topic → MicroSkill. The server selects the eligible pair from that published micro-skill bank using stable seeded selection `hash(actorId + microSkillRevisionId) mod eligiblePairs.length`; it binds `microSkillRevisionId`, pair identity/revision, Practice task and Transfer task to the ChallengeSession. The browser never chooses the Transfer pair.
* **Session binding:** initial selection loads the exact PUBLISHED MicroSkill revision and eligible reviewed bank, then binds exact micro-skill/pair/task/guidance versions to one learning episode. The bound pair never changes during Practice retry, refresh, new publication, deprecation, draft, bank reordering, or pair revision.
* **New independent attempt selection:** a failed Transfer never reveals mapping, answer, or receipt. A reviewed recovery flow may start a new independent Transfer attempt only from `candidatePairs = eligible reviewed pairs − pairs/transfer tasks already exposed in the current MicroSkill learning episode`. Server selects deterministically from remaining candidates using `hash(actorId + microSkillRevisionId + independentAttemptOrdinal) mod candidatePairs.length`; browser supplies neither ordinal nor pair. If none remain, return typed `NO_FRESH_TRANSFER_AVAILABLE` recovery/review state—never reuse an exposed transfer as fresh verification. Same bound Practice-episode retry remains governed by the existing retry policy and never swaps its pair.
* Replace three-state `ReviewStatus` for authored revisions with `DRAFT | IN_REVIEW | APPROVED | PUBLISHED | DEPRECATED`; preserve legacy approved snapshot compatibility through an explicit adapter.
* Add `WrittenSolutionAnswerSpec { kind: "written_solution"; deterministicFinal?: DeterministicFinalSpec; assessment: ReviewedAssessment }`; browser sends `{ kind: "written_solution", rawText: string }`. No LaTex parser, handwriting, or OCR.
* `ReviewedAssessment` contains expected result, `ReviewedRubricGradingShape`, rubric criteria (IDs/requiredness), non-canonical `referenceSolutions[]`, misconceptions, and versioned `AIGuidance`.
* Require reviewed pair and connection reveal to reference the same micro-skill revision; snapshots include task, pair, assessment, guidance and lifecycle/version references. New draft/publication/deprecation/pair revision cannot alter an already-bound session.

**Database/migration impact:** Designed here only; implemented in Slice 2.

**Tests to write first:** Draft body mutation; review freezes body; edit after review creates a new revision ID; approval/publish do not alter body hash; only published selection; deprecated excluded; old snapshot still resolves; written solution rejects absent assessment; required/optional rubric IDs unique and disjoint; references non-empty and non-canonical; display order/prerequisite/next relation validates; initial seeded pair selection deterministic; browser pair input ignored; bound session pair immutable after publication/deprecation; fresh independent selection excludes exposed transfer pair/task.

**Implementation steps:**

1. Add failing lifecycle/rubric tests beside existing validator tests.
2. Define content aggregate and lifecycle types, then make validator emit precise lifecycle/rubric errors.
3. Update loader deep-freeze and snapshot hash/reference construction to capture v1.1 authored fields.
4. Add a legacy approved-bundle adapter so current v1.0 tests and seed loading continue to work during migration.

**Verification commands:** `npm test -- src/content/*.test.ts src/domain/ids.test.ts`; `npm run check`.

**Acceptance criteria:** A reviewed content revision fully determines task, rubric, references, AI guidance and pair relation; no reviewed/published body can be mutated in memory.

**Risks / fail-closed behavior:** Unknown answer kind, missing assessment, invalid lifecycle transition, or mismatched pair/micro-skill is rejected before learner selection.

**Rollback / migration safety:** Pure contract change first; preserve structural fixture via explicit legacy adapter and do not rewrite historical snapshots.

### Slice 2 — Persistent content revisions and protected lifecycle service (P0, Gate A/E prerequisite)

**Goal:** Make Ops and learner runtime read the same PostgreSQL-backed immutable revision source.

**Why now / dependencies:** v1.1 forbids hard-coded fixtures as the Content Studio source of truth. Depends on Slice 1.

**Existing code to reuse:** `PostgresTransactionalEvidencePersistence`, `NodePostgresClient`, migration runner, content loader/repository, signed staff roles, existing JSONB snapshot storage.

**Files to modify:** `migrations/0007_content_revisions.sql` (new only), `src/persistence/index.ts`, `src/persistence/pg-driver.ts` only if repository interface requires it, `src/content/repository.ts`, `src/runtime/server.ts`, `.env.example`.

**Files to create:** `src/content/postgres-repository.ts`, `src/content/postgres-repository.test.ts`, `src/content/lifecycle-service.ts`, `src/content/lifecycle-service.test.ts`.

**Domain/API contract changes:** Define `ContentRevisionRepository` commands: `createDraft`, `editDraft`, `submitForReview`, `approve`, `publish`, `deprecate`, `getRevision`, `listPublishedHierarchy`, `getEligibleMicroSkills(actorId)`, `selectInitialPublishedPair(actorId, microSkillRevisionId)`, `selectFreshIndependentPair(actorId, microSkillRevisionId, independentAttemptOrdinal, exposedPairTaskVersions)`. Each mutation takes an optimistic revision token/idempotency key. Only server chooses lifecycle transition, reviewer identity, eligibility/unlock and pair selection.

**Database/migration impact:** Add `content_revisions` with aggregate JSON body, immutable content hash after review, lifecycle status, subject/topic/micro-skill IDs and versions, author/reviewer/provenance/timestamps; `published_micro_skills` maps each active micro-skill to exactly one **PUBLISHED** revision (never merely `APPROVED`). Persist static display/prerequisite/next relation inside the reviewed aggregate. Add an episode-bound exposure projection or immutable event query keyed by actor/micro-skill learning episode that records exposed pair/task versions and independent-attempt ordinal server-side. Add checks/indexes for immutable status transitions in service transaction, not an overwrite trigger. Keep `content_snapshots` unchanged for historical sessions.

**Tests to write first:** Postgres and memory repository parity; draft update works; in-review/approved/published/deprecated writes rejected; publish requires approved hash equality; active pointer rejects approved/non-published revision; concurrent draft edit detects revision conflict; stable actor/revision initial selection; only eligible published pair is selected; fresh selection deterministically chooses among unexposed candidates; bank exhaustion yields `NO_FRESH_TRANSFER_AVAILABLE`; restart preserves exposure history; historical `ReviewedPairSnapshot` remains readable after deprecation/new publication.

**Implementation steps:**

1. Write migration checksum test before adding migration.
2. Implement revision repository and lifecycle service transactionally.
3. Adapt runtime content resolver from file-loaded sole pair to published hierarchy/micro-skill lookup; bind selected pair at challenge start and retain `THINKAI_CONTENT_PATH` only as explicit development/bootstrap source until an approved DB seed workflow replaces it.
4. Update runtime configuration to fail closed when no published revision is available in normal production mode.

**Verification commands:** `npm test -- src/content/*.test.ts src/persistence/migrations.test.ts`; configured PostgreSQL integration test; `npm run check`.

**Acceptance criteria:** Publishing exposes exactly approved immutable hash; learner runtime resolves published content from same store Ops mutates; v1.0 snapshots/events remain readable.

**Risks / fail-closed behavior:** Missing published revision, body hash mismatch, lifecycle conflict, or integrity drift returns `CONTENT_INTEGRITY_FAILED`/typed transition error and exposes no task.

**Rollback / migration safety:** Additive `0007`; deploy migration before runtime switch; retain file-bundle bootstrap behind explicit config; never edit `0001`–`0006`.

### Slice 3 — Deterministic applicability and rubric semantic validation (P0, Gate B)

**Goal:** Replace stale v1.1 grading contracts with server-validated facets and distinguish deterministic applicability from deterministic failure.

**Why now / dependencies:** No evaluator/provider may be connected before its output has a total fail-closed validator. Depends on Slice 1.

**Existing code to reuse:** exact/numeric/choice normalization in `src/scoring/service.ts`; current `src/grading/*` tests as migration inputs only.

**Files to modify:** `src/scoring/service.ts`, `src/scoring/service.test.ts`, `src/grading/contracts.ts`, `src/grading/service.ts`, `src/grading/service.test.ts`, `src/grading/index.ts`.

**Files to create:** `src/grading/rubric-validation.ts`, `src/grading/rubric-validation.test.ts`, `src/scoring/adapters.ts` only if extracting existing switch avoids altering results.

**Domain/API contract changes:** Replace model-supplied `RubricEvaluation.outcome` with `RubricFacetEvaluation` and `ReviewedRubricGradingShape`. Introduce deterministic result `{ applicability: "applicable" | "not_applicable"; score?: ScoreResult }`; invalid/malformed learner answer remains an applicable deterministic failure, never `not_applicable`. Keep `ScoreResult` externally compatible for legacy answer specs.

**Database/migration impact:** none yet; later events persist the validated output and versions.

**Tests to write first:** Numeric/choice regression; tolerance; unsupported expression remains explicit not applicable only when reviewed task opts into rubric route; required criterion missing/duplicate/unknown; optional duplicate; required not-assessed/uncertain; final answer unknown-required; final omitted-not-applicable; reasoning required/not-assessed; semantic error/facet contradiction; confidence low/high produces identical aggregate; alternate factorization/quadratic-formula facets accepted.

**Implementation steps:**

1. Delete/replace tests that encode hard-coded `answerRevealed: false` or model grading outcome; do not preserve behavior that contradicts v1.1.
2. Implement schema, ID, completeness, final/reasoning applicability and semantic validators in the prescribed order.
3. Make deterministic adapter report applicability independently from correctness.
4. Keep confidence in validated provenance only; no threshold/policy branch.

**Verification commands:** `npm test -- src/scoring/service.test.ts src/grading/*.test.ts`; `npm run check`.

**Acceptance criteria:** Every evaluator failure mode maps to a typed invalid-evidence result that aggregate code treats as `UNCERTAIN`; model cannot invent/drop requirements.

**Risks / fail-closed behavior:** Any malformed/schema/semantic/conflict output is non-pass. Do not call a provider in this slice.

**Rollback / migration safety:** No database migration; compatibility adapter keeps existing deterministic `ScoreResult` consumers compiling.

### Slice 4 — Server grading aggregation and practice/transfer gate integration (P0, Gate B)

**Goal:** Replace `score.outcome === "correct"` lifecycle decisions with server-owned aggregate gate decisions exactly matching ADR-011.

**Why now / dependencies:** Written solution evidence must reach existing session/receipt infrastructure without granting evaluator authority. Depends on Slices 2–3.

**Existing code to reuse:** `PracticeChallengeService.submit`, `TransferService.submit`, `CapabilityReceiptService.issue`, idempotency/session-state persistence, `practice_scored`/`transfer_scored` events.

**Files to modify:** `src/challenge/service.ts`, `src/challenge/service.test.ts`, `src/transfer/service.ts`, `src/transfer/service.test.ts`, `src/receipts/service.ts`, `src/receipts/service.test.ts`, `src/evidence/schema.ts`, `src/evidence/schema.test.ts`, `src/domain/policies.ts`.

**Files to create:** `src/grading/gate-policy.ts`, `src/grading/gate-policy.test.ts`.

**Domain/API contract changes:** `GradingResult` becomes the authoritative stored submission result and includes deterministic evidence, validated rubric facets/provenance status, aggregate outcome, policy/scorer versions. `practice_pass`/`transfer_pass` are server-derived facts/events only when aggregate `CORRECT`; retain `practice_scored`/`transfer_scored` with a v1.1 payload rather than deleting historical types. Failed Transfer appends its result/exposure fact but cannot reveal mapping, issue receipt, or mutate a bound pair. Receipt service accepts only qualifying aggregate evidence whose session/pair/version chain is intact.

**Database/migration impact:** Add event types/payload validation only; JSONB ledger stores the extra v1.1 fields. No receipt table rewrite.

**Tests to write first:** Full decision-table cases, `CORRECT` gate, partial/incorrect/uncertain non-gates, rubric-route correct with deterministic not applicable, deterministic/rubric conflict, receipt rejects forged aggregate event and accepts qualifying exact chain, same Practice-episode retry retains bound pair, failed Transfer appends recovery fact but exposes no reveal/receipt.

**Implementation steps:**

1. Add aggregate outcome and gate state to challenge/transfer snapshot parsers with version migration support for existing states.
2. Inject a `GradingService` into Practice/Transfer instead of calling raw scorer directly.
3. Append submitted + deterministic/rubric evidence + aggregate/gate events atomically with session state.
4. Update receipt eligibility to cite aggregate/gate events while preserving old receipt rules for historical v1.0 facts.

**Verification commands:** focused challenge/transfer/receipt/evidence tests; `npm test`; `npm run check`.

**Acceptance criteria:** No model/evaluator code can set `solved`/`verified` directly; only an aggregate `CORRECT` does. Old deterministic episodes still resume/read.

**Risks / fail-closed behavior:** Evaluation unavailable leaves submission draft/retry semantics per policy and no gate/receipt. Transaction rollback prevents half-logged gate facts.

**Rollback / migration safety:** Add state schema version readers before writers; retain legacy score projection until v1.0 sessions age out.

### Slice 5 — Assistance evidence and bounded Practice Companion (P0, Gate C)

**Goal:** Implement Practice-only conversation through candidate → server classification → delivery → append-only evidence.

**Why now / dependencies:** Requires content guidance/snapshots and event/gate foundations. Depends on Slices 1, 2, and 4.

**Existing code to reuse:** challenge session ownership/idempotency/event helper; `intervention_opened` evidence; `src/assistance/*` taxonomy; `src/ai/contracts.ts` as a replacement target.

**Files to modify:** `src/assistance/contracts.ts`, `src/assistance/service.ts`, `src/assistance/*.test.ts`, `src/ai/contracts.ts`, `src/ai/contracts.test.ts`, `src/challenge/service.ts`, `src/evidence/schema.ts`, `src/api/dispatcher.ts`.

**Files to create:** `src/ai/practice-companion.ts`, `src/ai/practice-companion.test.ts`, `src/assistance/conversation-store.ts`, `src/assistance/conversation-store.test.ts`, `src/assistance/reveal-classifier.ts`, `src/assistance/reveal-classifier.test.ts`.

**Domain/API contract changes:** Define `PracticeCompanionProvider.reply(request): CandidateCompanionReply`; candidate supports reply text and optional proposed metadata only. Before delivery, server classifier returns authoritative `SAFE | BLOCK | UNCERTAIN`: `SAFE` may deliver; `BLOCK` and `UNCERTAIN` never deliver. Server assigns `supportLevel`, `answerRevealAttempted`, `responseBlocked`; delivery layer records `answerRevealed`. Create `POST /api/v1/challenges/:id/companion/messages` with only bounded learner message/client request ID. No client-supplied level/reveal/provenance/task IDs.

**Database/migration impact:** Add `practice_conversations`/`practice_conversation_messages` with session/conversation IDs, provider metadata, delivery status, `retention_class`, `expires_at`, and `cleanup_status`. Raw text is **operational conversation** only: available server-side during active Practice for continuity/resume and Process Feedback; when feedback completes or the episode reaches terminal state it becomes eligible for purge. Durable append-only evidence contains structured assistance/provenance facts only. Abandoned sessions must be queryable for configured expiry/cleanup; absence of configured production retention duration is detectable and blocks Gate H. Raw transcript is never ordinary logs, transfer DTO/evaluator context, or competition evidence manifest.

**Tests to write first:** no AI summary; each support level; exact final-answer disclosure, obvious mathematically equivalent final disclosure, full worked solution and ambiguous/unclassifiable candidate all return `BLOCK`/`UNCERTAIN` and are not delivered; safe conceptual/strategic hints return `SAFE`; candidate block records (`attempted=true`, `blocked=true`, `revealed=false`); delivered unsafe defect records `revealed=true`; forged client facts rejected; provider unavailable returns `AI_UNAVAILABLE` while practice remains usable; provider/model/prompt/guidance version appears in event; operational transcript purge eligibility/abandoned expiry metadata; transfer route rejected/not registered.

**Implementation steps:**

1. Replace the stale immutable-false assistance record with authoritative server/delivery fields.
2. Implement bounded request builder using Practice task, approved guidance and current practice conversation only; exclude transfer/pair/reveal/receipt data.
3. Validate/classify candidate before any delivery with a bounded, approved-Competition-math test corpus; do not claim universal mathematical safety. `UNCERTAIN` blocks delivery; append event and session summary atomically.
4. Provide provider-independent fallback status without altering attempts, score or gates.

**Verification commands:** assistance/AI/challenge/API tests; `npm run check`; PostgreSQL integration when configured.

**Acceptance criteria:** Every learner-visible companion response has a server-created evidence record; no transfer can construct/reuse conversation context; ambiguous candidates are blocked, not guessed safe.

**Risks / fail-closed behavior:** Candidate validator failure/uncertainty blocks delivery; provider failure has no scoring/evidence-policy impact; raw text is absent from ordinary logs and cannot become indefinite retention unnoticed.

**Rollback / migration safety:** Add conversation tables/events; disable provider via configuration while retaining deterministic practice and existing reviewed hints.

### Slice 6 — Provider-independent rubric evaluators and Practice Process Feedback (P0, Gate B/C)

**Goal:** Add post-submit evaluator orchestration and explanatory Practice feedback without allowing either to control policy.

**Why now / dependencies:** Semantic validator and aggregate must exist first. Depends on Slices 3–5.

**Existing code to reuse:** `RubricFacetEvaluation` validator, grading service, assistance summaries, task guidance/references, runtime configuration pattern.

**Files to modify:** `src/ai/contracts.ts`, `src/grading/service.ts`, `src/challenge/service.ts`, `src/runtime/server.ts`, `src/api/dispatcher.ts`, `.env.example`.

**Files to create:** `src/ai/provider.ts`, `src/ai/rubric-evaluator.ts`, `src/ai/rubric-evaluator.test.ts`, `src/ai/practice-process-feedback.ts`, `src/ai/practice-process-feedback.test.ts`, `src/ai/config.ts`.

**Domain/API contract changes:** Define provider-neutral `evaluatePracticeRubric`, `evaluateTransferRubric`, and `createPracticeProcessFeedback` interfaces with explicit `available | unavailable | invalid` capability status. Evaluators receive only post-submit owned material. Process Feedback receives Practice aggregate evidence, Practice assistance summary, retained operational Practice conversation, and approved Practice metadata; it returns explanatory content only and is never invoked by Transfer. Feedback completion marks its operational transcript purge-eligible.

**Database/migration impact:** Add technical provenance fields/event payloads for evaluator/feedback provider/model/prompt/schema versions and status; retain confidence only diagnostic. No raw prompt/token logging.

**Tests to write first:** schema-valid facets accepted; unavailable/malformed/semantic-invalid map to `UNCERTAIN`; confidence has no gate effect; transfer evaluator request lacks all Practice fields; Process Feedback request cannot be built for transfer; feedback failure leaves aggregate/gate unchanged.

**Implementation steps:**

1. Build prompt payloads from reviewed versioned content with non-canonical references; prohibit provider-specific prompt strings outside adapters/config.
2. Call Practice evaluator only after submission, validate facets, then aggregate server-side.
3. Call Practice Process Feedback only after aggregate persistence; persist only safe provenance/status plus learner-visible feedback snapshot where required for resume.
4. Make Transfer evaluator post-submit and transfer-owned; do not add Transfer feedback endpoint/UI.

**Verification commands:** `npm test -- src/ai/*.test.ts src/grading/*.test.ts src/challenge/service.test.ts src/transfer/service.test.ts`; `npm run check`.

**Acceptance criteria:** Provider output cannot mutate a lifecycle directly; every failure degrades to typed non-pass/feedback-unavailable behavior according to task contract.

**Risks / fail-closed behavior:** Provider is unselected until Gate G. Use fake adapters only in unit/integration/CI/local deterministic E2E; never present them as live. A required rubric evaluator unavailable/invalid produces `UNCERTAIN` and blocks its gate; Companion/Process Feedback may honestly report unavailable without altering grading.

**Rollback / migration safety:** Adapter registration feature flag/config only; provider can be disabled without rolling back content/events.

### Slice 7 — Transfer aggregate integration and isolation regression wall (P0, Gate D)

**Goal:** Prove the new grading and AI additions cannot leak Practice help into independent Transfer.

**Why now / dependencies:** Transfer evaluator depends on Slice 6; receipt depends on qualifying transfer. Depends on Slices 4–6.

**Existing code to reuse:** `TransferSafeContext`, transfer-specific DTO, isolated session/snapshot, connection reveal and receipt chain tests.

**Files to modify:** `src/transfer/service.ts`, `src/transfer/service.test.ts`, `src/api/dispatcher.ts`, `src/api/dispatcher.test.ts`, `src/runtime/http-acceptance.test.ts`, `src/receipts/service.test.ts`.

**Files to create:** `src/transfer/isolation-contract.test.ts`.

**Domain/API contract changes:** Transfer submission accepts the same typed answer/written-solution body but never a companion/conversation/history field. No `/transfers/:id/companion` or Process Feedback route exists. Transfer evaluator construction takes a transfer-owned DTO only; connection mapping remains excluded until existing verified aggregate gate. Add server-only `startFreshIndependentAttempt` recovery command: it reads durable episode exposure history, selects only an unexposed reviewed candidate, increments server-owned independent-attempt ordinal, or returns `NO_FRESH_TRANSFER_AVAILABLE` without creating a fake verification.

**Database/migration impact:** None beyond Slice 5/6 provenance events.

**Tests to write first:** Companion endpoint rejected/404; transfer view and evaluator payload omit Practice conversation, assistance summary, Process Feedback, answers, hints, references, AI state and pair/reveal; post-submit evaluator only; failed Transfer does not reveal mapping/answer or receipt; new independent attempt excludes already exposed pair/task when fresh reviewed pair exists; selection is deterministic among remaining candidates; bank exhaustion returns `NO_FRESH_TRANSFER_AVAILABLE`; qualifying isolated correct does; refresh/restart preserves exposure history and no leak.

**Implementation steps:**

1. Add explicit TypeScript transfer-owned evaluator input type with no broad generic task/context reuse.
2. Adapt `TransferService.submit` to aggregate results and set `verified` only on gate `CORRECT`; persist exposure before any recovery selection.
3. Implement fresh-attempt recovery over the published bound micro-skill revision and durable exposure history; never swap a bound pair in-place.
4. Add dispatcher allow-list assertions and HTTP acceptance checks for prohibited paths/data and explicit exhaustion state.
5. Re-run receipt source-chain validation against aggregate events.

**Verification commands:** transfer/receipt/dispatcher tests; `npm run test:runtime` with PostgreSQL; `npm run check`.

**Acceptance criteria:** New AI code cannot be called during Transfer pre-submit; every exact leakage listed in ADR-011 is mechanically tested; no exposed Transfer can be silently reused as fresh verification.

**Risks / fail-closed behavior:** Any missing transfer-owned evaluator field or unexpected Practice field rejects evaluation/route; no reveal on `UNCERTAIN`; exhausted bank enters explicit recovery/review rather than reusing exposed content.

**Rollback / migration safety:** Retain existing transfer DTO and server session; only add aggregate fields/version reader.

### Slice 8 — Ops API and Content Studio (P0, Gate E)

**Goal:** Deliver the smallest protected workflow that publishes the same content learner runtime serves.

**Why now / dependencies:** Requires lifecycle persistence and published resolver. Depends on Slices 1–2 and auth runtime.

**Existing code to reuse:** staff signed sessions (`presenter`/`auditor`), dispatcher error/auth/idempotency patterns, `app/api/v1/[...path]/route.ts`, approved competition UI grammar.

**Files to modify:** `src/auth/session.ts`, `src/runtime/server.ts`, `src/runtime/http.ts`, `src/api/dispatcher.ts`, `app/api/v1/[...path]/route.ts`.

**Files to create:** `src/ops/service.ts`, `src/ops/service.test.ts`, `src/ops/api.test.ts`, `app/ops/page.tsx`, `app/ops/ops-client.tsx`, `app/ops/ops.module.css` or approved shared style extension.

**Domain/API contract changes:** Add a server-side `content_reviewer` role (do not treat a hidden URL as auth). Operations: list hierarchy/revisions, create/edit draft, preview, submit review, approve, publish, deprecate, and manage the bounded pair bank/static display/prerequisite/next relation. Browser may submit editable DRAFT body and transition request; server derives author/reviewer, lifecycle validity, version/hash and publication selection.

**Database/migration impact:** Uses Slice 2 content revisions; optional staff-role seed/config migration only if existing synthetic registry cannot safely add reviewer role.

**Tests to write first:** learner forbidden; reviewer cannot bypass lifecycle; draft editable; reviewed immutable; publish exact hash; preview uses draft but learner sees only published; pair-bank editor validates same-micro-skill relation and static order; deprecate preserves historical audit.

**Implementation steps:**

1. Add Ops service over `ContentRevisionRepository`, not a second local store.
2. Add typed dispatcher routes with idempotency for mutations and authorization checks.
3. Implement minimal screens: overview/hierarchy, task bank/editor, pair editor, rubric/reference/misconceptions/guidance, preview, review actions. Reuse existing semantic tokens/open-row grammar; no visual redesign.
4. Bind success/error UI strictly to server view models.

**Verification commands:** Ops unit/API tests; `npm run check`; browser test once Slice 10 harness exists.

**Acceptance criteria:** A server-protected reviewer can publish one valid pair and a new learner session resolves that exact published revision.

**Risks / fail-closed behavior:** Invalid review state, unknown IDs, unauthorized role or immutable write is rejected; no draft body reaches learner runtime.

**Rollback / migration safety:** Disable Ops route/config without changing published revisions; additive role only after bootstrap compatibility tests.

### Slice 9 — Learner API-backed Practice and written-solution UI (P0, Gate F prerequisite)

**Goal:** Replace the local mock with an API-backed Home/Learn → Subject → Topic → MicroSkill → Practice flow, working area and bounded companion panel.

**Why now / dependencies:** Requires content, API, grading, companion and feedback contracts. Depends on Slices 4–6 and 8 for real content.

**Existing code to reuse:** route cookie bootstrap, `/api/v1/home`, skills/challenge API, current design specs (`docs/design/competition-ui/*`); existing `app/page.tsx` is replaced rather than incrementally trusted.

**Files to modify:** `app/page.tsx`, `app/styles.css`, `app/layout.tsx`; learner DTO serialization in `src/challenge/service.ts`, `src/api/dispatcher.ts`.

**Files to create:** `app/lib/api-client.ts`, `app/components/practice-workspace.tsx`, `app/components/companion-panel.tsx`, `app/components/grading-feedback.tsx`, `app/components/independent-mode-banner.tsx`.

**Domain/API contract changes:** Home/Learn DTO returns server-authored Subject/Topic/MicroSkill hierarchy, display order, static eligibility, current/next action and next authored eligible micro-skill after qualifying receipt. Practice view DTO includes the server-bound pair/task only, prompt/assets, answer input capability, sanitized published content version, safe assistance summary, aggregate grading result and feedback status. Submission body supports current answer shapes or `{kind:"written_solution", rawText}`; message body contains only bounded text. Frontend never sends/derives pair selection, score, support/reveal facts, lifecycle/gate/revision IDs.

**Database/migration impact:** none beyond prior slices.

**Tests to write first:** component/client tests for static hierarchy order/locked state/continue-start; draft preservation and server-error display; browser flow selects micro-skill, starts server-selected pair, sends companion message, submits written solution, renders aggregate result/Practice Process Feedback, and does not manufacture transition locally.

**Implementation steps:**

1. Build typed fetch client with cookie credentials, idempotency key generator and typed error handling.
2. Replace local `step` state with server Home/Learn hierarchy, episode/resume and static next-action view models; do not add adaptive recommendation.
3. Render plain-text/markdown working area and accessible raw-text written solution input; do not add math OCR/handwriting or require LaTex.
4. Render companion only in Practice and show honest blocked/unavailable state without exposing internal unsafe candidate text.
5. Render explanatory Process Feedback after persisted grading; keep it visually distinct from authoritative grading state.

**Verification commands:** `npm run check`; targeted component tests; browser command introduced in Slice 10.

**Acceptance criteria:** Refresh resumes server state; written Practice submission and companion work through real HTTP; no UI code decides correctness/transfer eligibility.

**Risks / fail-closed behavior:** API/provider errors retain local draft and show recovery, never simulated success. Do not expose raw Practice transcript in route state.

**Rollback / migration safety:** UI-only client replacement; legacy mock is removed only after HTTP browser flow passes.

### Slice 10 — Transfer, receipt/progress UI and E2E vertical slice (P0, Gate F)

**Goal:** Complete the judgeable flow from Ops publication through independent Transfer and audit-backed receipt.

**Why now / dependencies:** All domain/API gates must pass before presentation flow. Depends on Slices 7–9.

**Existing code to reuse:** current transfer/reveal/receipt/progress endpoints, existing hidden/locked UI specs, runtime HTTP acceptance test pattern.

**Files to modify:** learner components from Slice 9, `app/page.tsx`, `app/styles.css`, DTO serializers only where safe data is omitted.

**Files to create:** `app/components/transfer-workspace.tsx`, `app/components/receipt-view.tsx`, `app/components/progress-view.tsx`, `tests/e2e/competition-demo-v1.1.spec.ts`, `tests/e2e/helpers/demo.ts`, `playwright.config.ts` if absent.

**Domain/API contract changes:** Transfer DTO advertises independent condition and task only. It contains no companion/hint/Practice feedback/context. Receipt/progress present observed conditions, version/provenance-safe summaries and unknown delayed condition—never mastery percentage.

**Database/migration impact:** none.

**Tests to write first:** full browser E2E: Ops draft → review → approve → publish bounded pair bank/static path → learner Home/Learn Subject/Topic/MicroSkill selection → server-selected Practice companion/written solve → aggregate/feedback → failed Transfer shows no mapping/answer/receipt → fresh independent recovery chooses an unexposed pair deterministically or displays explicit exhaustion recovery → qualifying transfer → reveal → receipt → Progress next authored eligible micro-skill/audit. Add negative E2E assertions for browser pair choice, bound-pair mutation after publication/deprecation, blocked transfer routes and no leaked DOM/network payload.

**Implementation steps:**

1. Implement transfer workspace with independent-mode banner and no shared Practice component state.
2. Bind transfer/reveal/receipt/progress to existing server endpoints and idempotent commands.
3. Add presenter reset setup/teardown and test database fixture provisioning.
4. Run console/network inspection in E2E; do not commit screenshots/storage artifacts.

**Verification commands:** Playwright command added to `package.json`; `npm test`; `npm run check`; configured `npm run test:runtime`; `npx next build`.

**Acceptance criteria:** One published teacher-reviewed pair drives a real browser flow with visible independent transfer and auditable receipt; browser cannot call companion in Transfer.

**Risks / fail-closed behavior:** E2E provider dependency must use a deterministic approved fake adapter for CI and a separately qualified real adapter for live demo; never fake a live label.

**Rollback / migration safety:** UI routes can be rolled back while API/persisted evidence remains valid; no destructive reset outside synthetic demo actor.

### Slice 11 — Competition Release P0: provider qualification, deployment and competition provenance (Gates G/H; execution only after Local Product P0)

**Goal:** Complete Competition Release P0: qualify a real provider/model/configuration for every AI capability used by the actual published competition path (Practice Companion, required Practice/Transfer rubric evaluators, and enabled Practice Process Feedback), deploy the verified vertical slice persistently, and complete evidence required for competition review.

**Why now / dependencies:** Provider/model remains an external decision; deployment before local E2E hides defects. Depends on Slices 0–10 and explicit project-owner provider approval.

**Existing code to reuse:** `tools/benchmarks/thinkai-feedback/*`, P0 AI-selection/qualification docs, runtime config, health route, prompt-log and preflight manifests.

**Files to modify:** provider adapter/config files, `.env.example`, deployment documentation/configuration, `evidence/preflight/*`, `evidence/prompt-log/*` only through approved append-only tooling.

**Files to create:** provider-specific adapter tests/eval fixtures and deployment configuration selected by approved host.

**Domain/API contract changes:** none; provider adapter conforms to Slice 6 interfaces and reports model/prompt/schema versions. No credentials in browser, logs or evidence manifests.

**Database/migration impact:** none unless deployment requires a documented PostgreSQL operational setting.

**Tests to write first:** timeout, transient failure, malformed structured output, circuit-breaker/fallback, capability readiness matrix behavior for Companion/feedback/evaluators, provider provenance, no credential exposure, benchmark qualification threshold agreed by project owner, transcript cleanup configuration/readiness, production health/readiness.

**Implementation steps:**

1. Obtain provider/host approval and credential handling authority; enumerate the actual published path's enabled capabilities; do not substitute a paid service.
2. Run existing qualification harness against the selected provider/model/configuration for every enabled capability and record truthful results.
3. Configure persistent PostgreSQL, migrations, secret injection, protected staff/Ops access, operational-transcript cleanup/expiry policy, and `/healthz`.
4. Update source/model/library/API inventory, prompt log, content provenance, source history and deployment declaration without secrets.
5. Execute live browser smoke with actual provider and record fallback behavior.

**Verification commands:** provider qualification suite; `npm test`; `npm run check`; `npx next build`; deployed health and browser E2E command.

**Acceptance criteria:** Stable persistent deploy; qualified/configured live Practice Companion; qualified live provider for every published task requiring rubric route; qualified/configured Practice Process Feedback when the shipped flow displays it; honest temporary-outage fallback; configured/detectable transcript cleanup; no secret leakage; complete competition provenance.

**Risks / fail-closed behavior:** No provider/host approval or intentionally unqualified shipped capability blocks Competition Release P0. Required evaluator runtime failure blocks relevant pass/reveal/receipt; a temporary outage of otherwise qualified Companion/feedback may report unavailable without policy mutation. Missing transcript retention configuration or failed compliance inventory blocks competition handoff.

**Rollback / migration safety:** Roll back application deployment independently from PostgreSQL additive migrations; preserve all append-only evidence and content revisions.

## Gates

| Gate | Entry criteria | Exit evidence | Blockers |
|---|---|---|---|
| A — Content contract | Slice 0 baseline recorded | lifecycle/rubric validator + revision repository tests; exact reviewed/published hash proof | no teacher-approved content model; migration incompatibility |
| B — Grading correctness | published assessment shape; deterministic adapter available | decision-table/unit tests, semantic invalid tests, aggregate/gate/receipt tests | evaluator semantics ambiguous; deterministic conflict not fail-closed |
| C — Assistance evidence | Gate A/B | bounded math classifier tests (`SAFE`/`BLOCK`/`UNCERTAIN`), candidate-before-delivery proof, delivery/provenance tests, no client forgery, purge-eligibility/expiry detection | provider contract leaks final answer; classifier ambiguity delivered; retention/security unresolved |
| D — Transfer isolation | Gate B/C | unit, API and runtime tests proving absent Practice fields/routes; failed-transfer/no-reveal proof; fresh-pair exclusion, deterministic remaining-bank selection, exhaustion/restart proof | any Practice context in transfer DTO/evaluator/feedback; exposed transfer reused as fresh |
| E — Content Studio runtime | Gate A, protected staff identity | Ops lifecycle API + one published revision selected by learner | draft reaches learner; URL-only protection |
| F — E2E vertical slice | Gates B–E | browser test from publish through fresh-transfer recovery/exhaustion and receipt/progress, console/network clean | mock/local policy; missing PostgreSQL/browser harness |
| G — Real AI provider | Local Product P0/Gate F plus owner approval | qualification artifacts, capability-readiness matrix tests, timeout/malformed/fallback tests, model provenance; qualified/configured Practice Companion; real healthy evaluator for every published rubric-required task; qualified enabled Practice Process Feedback | provider/model/credential approval absent; intentionally unqualified shipped capability; required evaluator unavailable |
| H — Competition Release deployment/evidence | Gate G | persistent deployed health/E2E, source/prompt/tool/model/content manifests, no secrets, configured/detectable transcript cleanup | host/DB approval absent; evidence incomplete; retention policy unset |

## Competition evidence workstream

At every execution slice, append rather than rewrite evidence. Before Gate H, update the existing manifests with: team-built vs AI-assisted vs inherited classification; provider/model IDs; prompt/schema/guidance versions; installed libraries/APIs; approved content author/reviewer/provenance; benchmark artifacts; deployment environment declaration; and source history. Keep raw credentials, headers, tokens and any real learner data out of versioned evidence and under existing private/ignored handling only.

## Plan self-review

* **Coverage:** Slices 1–2 cover content/lifecycle/persistence; 3–4 grading; 5 assistance; 6 Companion/evaluator/Practice feedback; 7 Transfer; 8 Ops; 9–10 learner/E2E; 11 provider/deployment/evidence.
* **Preservation:** Existing deterministic scorer, transfer session, receipt source chain, event ledger, migration history and signed demo session are extended rather than rewritten.
* **Open authority:** provider/model and deployment host are intentionally external gates, not implementation assumptions. Raw conversation retention duration remains the documented pre-production decision.
