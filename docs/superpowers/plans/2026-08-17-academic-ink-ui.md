# Academic Ink UI Implementation Plan

> **Status: Active supporting visual-design plan; do not execute it as an independent implementation plan.** Current v1.1 slice execution is governed only by [2026-08-19-competition-demo-v1.1-final-implementation.md](2026-08-19-competition-demo-v1.1-final-implementation.md). Reuse this document only for its approved visual grammar where compatible with v1.1 behavior.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the existing ThinkAI competition frontend to the approved Academic Ink visual system while preserving the documented student journey, verified evidence rules, and current information architecture.

**Architecture:** Keep the Next.js App Router entrypoints and backend/API contracts. Replace the current single-file prototype state machine with small presentational components driven by an explicit student-flow state model. The visual layer uses CSS custom properties and semantic HTML; no new design system dependency is required. A parity gate prevents the UI from showing a capability receipt or progress claim unless the corresponding verified state exists.

**Tech Stack:** Next.js 16, React 19, TypeScript, native CSS custom properties, existing API/runtime contracts, Playwright for browser verification.

---

## Scope and Safety Gate

The source of truth for behavior is `docs/design/competition-ui/`, especially `ui-state-matrix.md`, `student-flow.md`, `screen-specs.md`, `component-library.md`, and `final-uiux-recommendation.md`. The approved visual source is `docs/superpowers/specs/2026-08-17-academic-ink-ui-design.md`.

The current `app/page.tsx` is a prototype and unconditionally advances from practice to transfer and from transfer intro to receipt. Do not preserve that shortcut while applying the new visual design. Either connect those transitions to the existing API/runtime contracts or render an honest unavailable/recovery state until verified data exists.

## File Map

- Modify `app/layout.tsx`: document metadata, `lang`, skip link host, and font loading strategy.
- Modify `app/page.tsx`: state orchestration and composition of the student journey.
- Create `app/components/AppShell.tsx`: rail/workspace semantic shell.
- Create `app/components/RailNavigation.tsx`: Trang chủ, Học, Tiến độ navigation and active state.
- Create `app/components/StatusSurface.tsx`: text/icon/tinted status treatment for loading, error, success, and unavailable states.
- Create `app/components/PracticeWorkspace.tsx`: practice question, answer form, hint disclosure, submit/retry states.
- Create `app/components/TransferSurface.tsx`: isolated transfer intro and response state with no hint control.
- Create `app/components/CapabilityReceipt.tsx`: verified-only receipt, delayed/historical/conflict states.
- Create `app/components/EvidencePath.tsx`: event-derived Bài luyện, Dạng mới, Ôn lại sau markers.
- Create `app/components/ProgressView.tsx`: learner-language summary and history/audit links.
- Create `app/components/Field.tsx` and `app/components/Button.tsx`: shared accessible controls with stable loading/focus variants.
- Modify `app/styles.css`: Academic Ink tokens, typography, layout, component states, responsive rules, and reduced-motion rules.
- Create `playwright.config.ts`: local Next.js web server and desktop/tablet/mobile projects.
- Create `tests/e2e/student-journey.spec.ts`: core flow and accessibility-state smoke coverage.
- Modify `package.json` and `package-lock.json`: add the browser test script and Playwright dependency only if the existing workspace does not already provide it.

## Task 1: Freeze the Flow Model and Verified-State Boundary

**Files:**
- Modify `app/page.tsx`
- Create `app/flow.ts`
- Test: `app/flow.test.ts`

- [ ] **Step 1: Write the failing state-model tests.**

```ts
import { describe, expect, it } from "node:test";
import { canShowReceipt, nextStudentState } from "./flow";

describe("student flow evidence boundary", () => {
  it("does not create a receipt from a transfer intro", () => {
    expect(canShowReceipt({ kind: "transfer-intro", transferVerified: false })).toBe(false);
    expect(nextStudentState({ kind: "transfer-intro", transferVerified: false })).toEqual({ kind: "transfer" });
  });

  it("shows a receipt only after verified transfer evidence", () => {
    expect(canShowReceipt({ kind: "transfer", transferVerified: true })).toBe(true);
    expect(nextStudentState({ kind: "transfer", transferVerified: true })).toEqual({ kind: "receipt" });
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because `app/flow.ts` does not exist.**

Run: `npm test -- app/flow.test.ts`

- [ ] **Step 3: Implement an explicit discriminated-union flow model.**

Use states `{ kind: "home" | "practice" | "practice-feedback" | "transfer-intro" | "transfer" | "connection" | "receipt" | "progress" | "audit" }`, plus explicit flags for `hintOpened`, `practiceResult`, `transferVerified`, and `receiptStatus`. `nextStudentState` must refuse transitions that lack verified evidence. Keep `Ôn lại sau` conditional on a real event/schedule.

- [ ] **Step 4: Replace `step`/`next()` in `app/page.tsx` with the flow model and existing service/API data.**

Preserve the documented order and synthetic demo data only. Do not add score, mastery percentage, leaderboard, profile, or unsupported future skills.

- [ ] **Step 5: Run the focused tests and existing regression tests.**

Run: `npm test -- app/flow.test.ts` and `npm test`

Expected: the new state tests and the existing TypeScript/backend tests pass.

## Task 2: Establish Academic Ink Tokens and Accessible Shell

**Files:**
- Modify `app/layout.tsx`
- Create `app/components/AppShell.tsx`
- Create `app/components/RailNavigation.tsx`
- Modify `app/styles.css`
- Test: `app/components/AppShell.test.tsx` if component test tooling is available; otherwise cover via Playwright in Task 7.

- [ ] **Step 1: Add the token layer and document-level defaults.**

Define the approved palette in `:root`, with a stronger control-border token for inputs and a darker text token for small warning copy when required by contrast checks. Keep `#B85C38` as the CTA fill and use it only for primary action and non-text emphasis. Add `color-scheme: light`, `text-wrap: balance` for headings, `:focus-visible`, `prefers-reduced-motion`, and `touch-action: manipulation`.

- [ ] **Step 2: Add the semantic shell.**

`AppShell` renders a skip link, `<aside>` navigation, `<main id="main-content">`, and a polite live region. `RailNavigation` uses `<a>` for navigation, a surface/text active state, and accessible names. The rail must remain `Trang chủ`, `Học`, `Tiến độ`; no teacher/chat/achievement destinations.

- [ ] **Step 3: Add typography and responsive layout rules.**

Use a contemporary serif role for learning headings and a sans-serif role for controls/metadata. Define desktop 1440px as the reference, compact the rail at 1024px, stack lesson/path at 768px, and keep one-column interaction below 768px. Avoid `transition: all`, gradients, glow, and excessive nested cards.

- [ ] **Step 4: Run the typecheck and inspect the shell at the four target widths.**

Run: `npm run check`

Expected: no TypeScript errors; the shell keeps the CTA visible and text readable at 1440, 1024, 768, and 390px.

## Task 3: Build Shared Controls and Continue-Learning Surface

**Files:**
- Create `app/components/Button.tsx`
- Create `app/components/Field.tsx`
- Create `app/components/StatusSurface.tsx`
- Create `app/components/EvidencePath.tsx`
- Modify `app/page.tsx`
- Modify `app/styles.css`

- [ ] **Step 1: Add accessible control variants.**

`Button` supports `primary`, `secondary`, and `ghost` variants plus `loading` and `disabled`; loading preserves width and uses `aria-busy`. `Field` renders a `<label>`, `name`, `autocomplete="off"` where appropriate, `aria-invalid`, and `aria-describedby` for helper/error text. `StatusSurface` pairs status text with an icon/shape and uses `aria-live="polite"` for async changes.

- [ ] **Step 2: Render the approved home hierarchy.**

Implement: `HÔM NAY · TIẾP TỤC HỌC`, serif heading, short lede, one lesson surface with `Quan hệ giữa bảng và đồ thị`, one coral `Tiếp tục thử` action, ink progress with text, subtle evidence status, and a conditional EvidencePath. Keep the focal content within a readable max width.

- [ ] **Step 3: Add tests for primary-action and evidence rendering rules.**

Cover that home renders exactly one primary CTA and that `Ôn lại sau` is absent when no real schedule/event exists. Use synthetic fixtures only.

- [ ] **Step 4: Run typecheck and focused tests.**

Run: `npm run check` and `npm test -- app/flow.test.ts`

## Task 4: Implement Practice, Hint, and Failure States

**Files:**
- Create `app/components/PracticeWorkspace.tsx`
- Modify `app/page.tsx`
- Modify `app/styles.css`
- Test: `app/flow.test.ts` and browser coverage in Task 7.

- [ ] **Step 1: Implement the semantic answer form.**

Use `<form>` and a labeled input. Preserve input on network/scoring errors. Disable duplicate submission only after request start. Keep `Xem gợi ý` as a button with `aria-expanded` and `aria-controls`; the hint panel is not a penalty and has no score deduction.

- [ ] **Step 2: Implement response states from the documented matrix.**

Cover empty, typing, hint open, submitting, correct, needs retry, AI unavailable, and network error. Use the exact learner-language failure wording in `vietnamese-product-language.md` and `ui-state-matrix.md`.

- [ ] **Step 3: Implement focus and announcement behavior.**

After submission, focus the feedback heading or first actionable recovery control. Announce async state changes through the shell live region. Do not reset the answer when feedback service/AI feedback is unavailable.

- [ ] **Step 4: Run existing tests and typecheck.**

Run: `npm test` and `npm run check`

## Task 5: Implement Transfer, Connection Reveal, Receipt, Progress, and Audit Entry Points

**Files:**
- Create `app/components/TransferSurface.tsx`
- Create `app/components/CapabilityReceipt.tsx`
- Create `app/components/ProgressView.tsx`
- Modify `app/page.tsx`
- Modify `app/styles.css`
- Test: `app/flow.test.ts` and browser coverage in Task 7.

- [ ] **Step 1: Implement isolated transfer intro and response surface.**

Show the existing conditions and one `Bắt đầu`/`Làm bài` action. Do not render a hint control or the practice solution. Use a separately identified transfer session and show recovery actions for needs-retry/network errors.

- [ ] **Step 2: Implement verified connection reveal.**

Keep reveal locked until the transfer result is verified. Present the two representations and shared relation with text plus visual emphasis. Provide a text alternative for math visuals and respect reduced motion.

- [ ] **Step 3: Implement receipt variants without unsupported claims.**

Support confirmed, delayed pending, historical, and later-conflicting evidence. The receipt states exactly what was recorded and what remains untested. Never show a receipt for an unverified transfer.

- [ ] **Step 4: Implement learner progress and audit entry points.**

Render the event-derived path/timeline in learner language. Link to `Chi tiết lần làm`/audit detail without adding audit navigation to the rail. Handle empty progress, loading, audit unavailable, and missing metadata honestly.

- [ ] **Step 5: Run typecheck and backend regression tests.**

Run: `npm run check` and `npm test`

## Task 6: Add Browser Test Infrastructure

**Files:**
- Create `playwright.config.ts`
- Create `tests/e2e/student-journey.spec.ts`
- Modify `package.json`
- Modify `package-lock.json`

- [ ] **Step 1: Add Playwright only if absent.**

Run: `npm ls @playwright/test`; if absent, install with `npm install -D @playwright/test` and add `"test:e2e": "playwright test"`. Do not commit browser binaries or storage state.

- [ ] **Step 2: Configure the local web server.**

Use the existing Next.js app with a `webServer` command and test projects for Chromium desktop, tablet, and approximately 390px mobile. Keep the base URL local.

- [ ] **Step 3: Add the core journey test.**

Assert rail labels, home focal skill, one primary CTA, practice form label, hint disclosure, transfer absence of hint, verified-only receipt, progress path, and no unsupported `Ôn lại sau` without event data.

- [ ] **Step 4: Add accessibility and recovery checks.**

Use keyboard navigation for skip link/rail/form/hint. Assert preserved answer after a simulated failure, visible focus, live-region updates, and no console errors or failed requests during the happy path.

## Task 7: Verification and Final Review

**Files:** all changed UI/test files.

- [ ] **Step 1: Run quality gates.**

Run: `npm run check`, `npm test`, `npm run test:e2e`, and the production build command used by the repository.

- [ ] **Step 2: Run browser checks at 1440px, 1024px, 768px, and 390px.**

Confirm no horizontal overflow, text overlap, clipped CTA, inaccessible focus, or layout shift. Check browser console and network failures.

- [ ] **Step 3: Review against web interface guidelines.**

Check labels, semantic buttons/links, focus-visible states, reduced motion, text wrapping, explicit image dimensions if any are added, `aria-live`, URL/state handling, and no `transition: all`.

- [ ] **Step 4: Run a provenance/privacy pass.**

Confirm all demo identities/data are synthetic, no secrets or machine-specific paths enter tracked files, and no UI claim exceeds verified backend evidence.

- [ ] **Step 5: Update Beads and hand off conservatively.**

Update `ThinkAI-4b8` with validation results. Do not commit, push, or sync Dolt unless explicitly authorized by the user or active repository profile.

## Plan Self-Review

- Spec coverage: tokens, typography, layout, continue-learning hierarchy, component rules, motion, accessibility, responsive behavior, and validation each map to Tasks 2–7.
- Behavioral integrity: Task 1 and Task 5 prevent unsupported receipt/progress claims before visual polish.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation decision remains.
- Type consistency: the `kind`, `transferVerified`, `practiceResult`, and `receiptStatus` state terms are introduced in Task 1 and reused in later tasks.
- Scope: one frontend subsystem with a required verified-state parity gate; no unrelated backend refactor or new IA.
