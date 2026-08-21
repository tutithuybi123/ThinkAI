# UI-2 Production Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the local-flow scaffold with the locked UI-1 design foundation: shared responsive shell, tokens, route shells, primitives and typed request utilities, without implementing learner/Ops workflows.

**Architecture:** Learner routes render through one `AppShell` and use presentational route shells. Global CSS owns semantic tokens and responsive layout regimes; React primitives remain small and semantic. The API client only establishes typed request/error/session helpers and makes no policy decisions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS custom properties, Node test runner, Playwright CLI.

---

### Task 1: Add tested frontend foundation helpers

**Files:**

- Create: `src/frontend/foundation.ts`
- Create: `src/frontend/foundation.test.ts`

- [ ] Write failing tests for learner-shell route classification and normalized API errors.
- [ ] Run `npx tsx --test src/frontend/foundation.test.ts` and confirm failure because the module is absent.
- [ ] Implement the small pure helpers and run the test again.

### Task 2: Add token and base style foundation

**Files:**

- Modify: `app/styles.css`
- Modify: `app/layout.tsx`

- [ ] Replace scaffold tokens with semantic UI-1 token roles: typography, color, spacing, radii, borders, focus, state colors and motion.
- [ ] Implement wide/compact/mobile shell CSS and reduced-motion rules.
- [ ] Run `npm run check`.

### Task 3: Add shared shell and reusable primitives

**Files:**

- Create: `app/components/app-shell.tsx`
- Create: `app/components/ui.tsx`
- Create: `app/components/foundation-page.tsx`

- [ ] Build semantic dock navigation, mobile `details` menu, buttons, fields, textarea, status, feedback surface and state panels.
- [ ] Make interactive states available through semantic props rather than local feature flow state.
- [ ] Run `npm run check`.

### Task 4: Add learner, protected-Ops and API foundation routes

**Files:**

- Modify: `app/page.tsx`
- Create: `app/(learner)/layout.tsx`
- Create: `app/(learner)/learn/page.tsx`
- Create: `app/(learner)/practice/[sessionId]/page.tsx`
- Create: `app/(learner)/transfer/[sessionId]/page.tsx`
- Create: `app/(learner)/receipts/[receiptId]/page.tsx`
- Create: `app/(learner)/progress/page.tsx`
- Modify: `app/ops/page.tsx`
- Create: `app/lib/api-client.ts`

- [ ] Replace the old local state flow with route shells only; keep `/` at `app/page.tsx` so generated Next route validators do not retain a stale root-page import.
- [ ] Give each route truthful foundation text and no simulated outcome, content selection or server transition.
- [ ] Add typed API request/error/session utilities for future feature screens.
- [ ] Run `npm run check` and `npx next build`.

### Task 5: Browser QA and commit

**Files:**

- Create: `tests/e2e/ui-foundation.spec.ts`

- [ ] Add a smoke assertion for dock/navigation and mobile menu semantics.
- [ ] Start Next locally, inspect `/`, `/learn`, `/practice/demo`, `/transfer/demo`, `/receipts/demo`, `/progress`, `/ops` at 1440×1080, 1024×900 and 390×844.
- [ ] Inspect focus, disabled/loading primitives, overflow and console/network failures; fix material visual issues.
- [ ] Run `npm run check`, `npx next build`, relevant tests and `git diff --check`.
- [ ] Commit only UI-2 files, excluding existing dirty user paths.
