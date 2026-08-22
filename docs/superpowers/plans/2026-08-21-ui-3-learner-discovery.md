# UI-3 Learner Discovery, Home & Learn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver server-authored learner discovery hierarchy plus API-backed Home/Resume and Learn screens without building Practice, Transfer, Receipt, Progress or Ops flows.

**Architecture:** Extend reviewed content aggregates with display labels, project published aggregates and actor evidence into a learner-safe DTO, and reuse the existing `/home`, `/skills`, and server-owned practice-start endpoints. Browser components fetch the DTO, render states, and navigate only using server-provided actions/revision IDs.

**Tech Stack:** Next.js App Router, React 19, TypeScript, existing runtime dispatcher, PostgreSQL-backed content/evidence services, Node test runner, Playwright.

---

### Task 1: Test and implement learner-safe discovery projection

**Files:**

- Create: `src/learner/discovery.ts`
- Create: `src/learner/discovery.test.ts`
- Create: `src/runtime/learner-discovery.ts`
- Create: `src/runtime/learner-discovery.test.ts`
- Modify: `src/content/v11-validator.ts`
- Modify: `src/content/aggregate.test.ts`

- [x] Write failing tests for grouping labels, authored ordering, prerequisite-derived availability, resumable practice action, safe payload omission and no-published-content empty state.
- [x] Run `npx tsx --test src/learner/discovery.test.ts` and confirm failure because the projection is absent.
- [x] Add required subject/topic/micro-skill labels and the server-only `evidenceSkillId` mapping to authored content validation; implement the pure projection.
- [x] Run the discovery and aggregate tests.

### Task 2: Extend existing runtime and API responses

**Files:**

- Modify: `src/runtime/server.ts`
- Create: `src/runtime/learner-discovery.test.ts`

- [x] Write failing runtime tests asserting persisted evidence maps through the authored `evidenceSkillId`, with no fallback to `microSkill.id`.
- [x] Make runtime `home` and `skills` use the discovery projection over published content and actor events, mapping evidence only through authored `evidenceSkillId`.
- [x] Run targeted runtime/discovery tests.

### Task 3: Implement API-backed Home and Learn clients

**Files:**

- Create: `app/components/learner-discovery-page.tsx`
- Create: `app/lib/learner-discovery.ts`
- Modify: `app/page.tsx`
- Modify: `app/(learner)/learn/page.tsx`
- Modify: `app/styles.css`

- [x] Fetch typed learner DTOs through the existing frontend request utility without creating browser policy.
- [x] Render Home first-use, resumable, next eligible, completed, loading, empty, API error and retry states using server DTOs.
- [x] Render Learn Subject → Topic → MicroSkill open rows with server labels, state, rationale and actions.
- [x] Start or resume Practice only through the existing server-owned contract and navigate to its UI-2 shell.
- [x] Run `npm run check` and focused frontend tests.

### Task 4: Browser tests and visual QA

**Files:**

- Modify: `tests/e2e/ui-foundation.spec.ts`

- [x] Add smoke coverage for Home/ Learn loading/error/empty rendering and server-provided start handoff using route interception.
- [x] Inspect desktop 1440×1080, compact 1024×900 and mobile 390×844; verify focus, hierarchy, dock consistency, no card-grid drift and no overflow.
- [x] Run `npm run check`, `npx next build`, targeted tests, `npm run test:e2e`, `npm test` and `git diff --check`.
- [ ] Commit only UI-3 implementation files and plan, excluding existing dirty user paths.
