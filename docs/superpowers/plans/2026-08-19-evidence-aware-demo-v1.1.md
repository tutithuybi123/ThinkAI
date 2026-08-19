> **Status: SUPERSEDED**
>
> Do not execute this plan. Current plan: [Competition Demo v1.1 Final Implementation Plan](2026-08-19-competition-demo-v1.1-final-implementation.md).
>
> This historical plan is preserved for audit. It was superseded for the same v1.1 implementation scope by the final plan, which resolves later reviewed contracts.

# Evidence-aware Competition Demo v1.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the safe, testable domain foundation for the v1.1 AI-assisted practice and independent-transfer Demo vertical slice.

**Architecture:** Preserve the current modular-monolith lifecycle. Add a standalone grading module whose aggregation is deterministic policy over deterministic and schema-validated rubric evidence; add assistance taxonomy/contracts before attaching an AI provider. Existing `src/scoring` continues to own its current deterministic API.

**Tech Stack:** TypeScript 5.9, Node test runner via `tsx`, Next.js 16, PostgreSQL migrations already present.

**Spec:** `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`; `docs/architecture/competition-mvp/v1.1-amendment-contracts.md`

## Global Constraints

* Keep v1.0 historical; v1.1 is additive and versioned.
* Do not let AI output issue receipts, change progression, or reveal transfer context.
* No paid provider, new production library, or real learner data.
* Preserve append-only/version-bound evidence and existing isolated-transfer backend.
* Every production behavior begins with an observed failing unit test.

---

### Task 1: Define grading evidence and aggregation policy

**Files:**
- Create: `src/grading/contracts.ts`
- Create: `src/grading/service.ts`
- Create: `src/grading/index.ts`
- Test: `src/grading/service.test.ts`

**Interfaces:**
- Consumes: existing `ScoreResult` from `src/scoring/service.ts`.
- Produces: `aggregateGrading({ deterministic, rubric? }): GradingResult` and `RubricEvaluation`.

- [ ] **Step 1: Write failing tests** for: same valid alternative method (`CORRECT`), correct final + invalid reasoning (`PARTIALLY_CORRECT`), correct reasoning + arithmetic final error (`PARTIALLY_CORRECT`), missing/unavailable rubric (`UNCERTAIN`), and deterministic/rubric conflict (`UNCERTAIN`).
- [ ] **Step 2: Run** `npm test -- src/grading/service.test.ts` and confirm the module-not-found failure.
- [ ] **Step 3: Implement** only the contract and deterministic aggregation table needed by these tests; never invoke a provider from this module.
- [ ] **Step 4: Run** `npm test -- src/grading/service.test.ts` and confirm all cases pass.

### Task 2: Define structured assistance evidence contracts

**Files:**
- Create: `src/assistance/contracts.ts`
- Create: `src/assistance/service.ts`
- Create: `src/assistance/index.ts`
- Test: `src/assistance/service.test.ts`

**Interfaces:**
- Consumes: no provider; accepts only server-selected support levels.
- Produces: `recordAssistance` and `summarizeAssistance`, with `answerRevealed` permanently false.

- [ ] **Step 1: Write failing tests** for no assistance, conceptual/strategic/strong levels, interaction counts, and rejection of `answerRevealed: true`.
- [ ] **Step 2: Run** `npm test -- src/assistance/service.test.ts` and confirm module-not-found failure.
- [ ] **Step 3: Implement** immutable server-side records and a summary that never turns assistance into a penalty/score.
- [ ] **Step 4: Run** `npm test -- src/assistance/service.test.ts` and confirm all cases pass.

### Task 3: Define bounded AI contracts without provider coupling

**Files:**
- Create: `src/ai/contracts.ts`
- Test: `src/ai/contracts.test.ts`

**Interfaces:**
- Consumes: approved task guidance, bounded message, `RubricEvaluation`, assistance levels.
- Produces: separately typed Practice Companion, Rubric Evaluator, and Process Feedback request/response shapes.

- [ ] **Step 1: Write failing tests** that reject final-answer reveal in companion output and fail closed for malformed rubric output.
- [ ] **Step 2: Run** `npm test -- src/ai/contracts.test.ts` and confirm module-not-found failure.
- [ ] **Step 3: Implement** structural guards that distinguish three contracts and prohibit transfer context fields.
- [ ] **Step 4: Run** `npm test -- src/ai/contracts.test.ts` and confirm all cases pass.

### Task 4: Extend content contracts additively

**Files:**
- Modify: `src/content/schema.ts`
- Modify: `src/content/validator.ts`
- Test: `src/content/validator.test.ts`

**Interfaces:**
- Consumes: existing `TaskContent`/review contract.
- Produces: optional `assessment`, `aiGuidance`, and `written_solution` answer specification accepted only for reviewed content.

- [ ] **Step 1: Write failing validator tests** for a published written-solution task with expected result/rubric/reference solution and for rejection of missing rubric/reference or unapproved pair content.
- [ ] **Step 2: Run** `npm test -- src/content/validator.test.ts` and confirm the new assertions fail.
- [ ] **Step 3: Implement** additive schema fields plus minimal validation; do not change existing fixture semantics.
- [ ] **Step 4: Run** `npm test -- src/content/validator.test.ts` and confirm all cases pass.

### Task 5: Integrate foundation with evidence/API/persistence

**Files:**
- Modify: `src/evidence/schema.ts`, `src/challenge/service.ts`, `src/api/dispatcher.ts`, migrations
- Test: focused service/API/persistence tests

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: server-created assistance events, post-submit grading evidence, and transfer-specific denial of companion routes.

- [ ] **Step 1: Add one failing test per endpoint/evidence invariant**, including client-forged assistance and transfer companion denial.
- [ ] **Step 2: Implement additive events/routes and migration after inspection of current persistence test conventions.**
- [ ] **Step 3: Run focused tests, then `npm test` and `npm run check`.**

### Task 6: Implement vertical UI and protected `/ops`

**Files:**
- Modify: `app/page.tsx`, `app/styles.css`; create `/ops` route/components; create Playwright E2E

**Interfaces:**
- Consumes: API contracts from Task 5.
- Produces: API-backed practice companion/written work UI, transfer isolation UI, and server-protected reviewed-content operations.

- [ ] **Step 1: Write browser tests against the real HTTP flow before replacing the local mock.**
- [ ] **Step 2: Bind approved UI grammar to server view models; no local policy.**
- [ ] **Step 3: Run browser E2E, typecheck, full tests, and production build.**
