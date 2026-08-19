# Current code vs frozen-Demo candidate gap

> **Status: Historical v1.0 gap snapshot.** Current v1.1 execution gaps and slice order are governed by the final implementation plan.

| Demo P0 requirement | Status | Existing evidence | Required next action |
|---|---|---|---|
| Event/persistence/scoring/practice/transfer/receipt/API/reset | ALREADY COMPLETE — do not rewrite | Packages A–I; `src/{challenge,transfer,receipts,persistence,api,demo,runtime}`; runtime review PASS | preserve and bind UI |
| Transfer isolation | ALREADY COMPLETE — do not rewrite | `src/transfer/service.ts`, leakage/runtime tests | include E2E assertion |
| Approved real content | BLOCKED BY HUMAN | only structural fixture exists | teacher-reviewed bundle through existing schema |
| Live AI feedback | MISSING / BLOCKED BY EXTERNAL SERVICE | ADR/spec only; `src/api/dispatcher.ts` validates optional `reasoning` on practice submission but does not forward it to `PracticeChallengeService` or an adapter | extend this exact post-score route/service seam with server adapter, schema/log/fallback tests after credential/model decision |
| Functional frontend | IMPLEMENTED BUT NEEDS FIX | `app/page.tsx` is local scripted mock | API client/route-backed screens, preserve UI handoff |
| UI design fidelity | BLOCKED BY DESIGN | Markdown handoff/zip, no final Figma export | use existing handoff; final asset only for fidelity refinement |
| Browser E2E | MISSING | `tests/e2e/README.md` | real browser tests with no local policy |
| Deployment | BLOCKED BY EXTERNAL SERVICE | no host config selected | local production-like gate then host credentials |
