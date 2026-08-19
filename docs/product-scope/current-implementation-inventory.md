# Current implementation inventory — 2026-08-15

> **Status: Historical implementation snapshot as of 2026-08-15.** Do not use this as live status; see `../CURRENT.md` and inspect code for the active slice.

## What can the repository actually do today?

With an approved, versioned content bundle and seed supplied outside source control, the backend can run a real PostgreSQL/Next HTTP evidence loop: signed synthetic learner session → server-selected practice → reviewed hint exposure → deterministic practice score → isolated transfer → reviewed connection reveal → one rule-derived receipt → event-derived progress/audit → presenter-only reset. This was independently runtime-reviewed as `BACKEND RUNTIME REVIEW: PASS`.

It is **not yet a usable competition product**: the only learner UI is a local-state mock, there is no real reviewed Grade-10 content bundle, no live AI provider call, no browser E2E, and no deployment proof.

Status labels are cumulative only when evidence exists: `IMPLEMENTED`, `UNIT TESTED`, `INTEGRATION TESTED`, `RUNTIME VERIFIED`, `INDEPENDENTLY REVIEWED`, `USER-FACING READY`.

| Capability | Evidence/source | Current status | Runtime / independent review | Learner usable? | Scope | Remaining gap |
|---|---|---|---|---|---|---|
| Architecture / AF-01–10 ADRs | `docs/architecture/competition-mvp/`, `docs/decisions/001–010-*` | SPEC ONLY + APPROVED | architecture review | no | both | Demo scope makes live AI P0 without changing deterministic authority |
| Versioned content contracts | `src/content/{schema,validator,repository,loader}.ts` | IMPLEMENTED + UNIT TESTED | runtime loads only approved content | no real content | both | teacher-reviewed bundle |
| Task-pair validity contract | `src/content/schema.ts`, validator tests | IMPLEMENTED + UNIT TESTED | indirectly runtime verified | no | both | genuine reviewed pairs; no claim yet |
| Deterministic scoring | `src/scoring/` | IMPLEMENTED + UNIT TESTED | runtime verified | backend only | both | content answer specs; no symbolic adapter |
| Append-only evidence ledger | `src/evidence/`, `src/persistence/` | IMPLEMENTED + INTEGRATION TESTED | PostgreSQL/runtime/reviewed | indirectly | both | learner-language UI |
| Practice lifecycle | `src/challenge/service.ts` | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed | API only | Demo P0 | frontend binding |
| Reviewed help exposure | challenge/content/persistence modules | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed | API only | Demo P0 | reviewed real interventions; live AI layer |
| Transfer isolation / reveal | `src/transfer/service.ts` | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed, leakage tests | API only | Demo P0 | visual flow / real pair |
| Capability Receipt | `src/receipts/service.ts` | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed | API only | Demo P0 | student UI |
| Learner progress + basic history | receipts/runtime/API | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed | API only | Demo P0 | frontend; learner-language/history labels |
| Restricted receipt audit | runtime/API | IMPLEMENTED + INTEGRATION TESTED | HTTP/runtime/reviewed | API only | Demo P0 | compact presenter UI |
| Richer history/timeline | UI handoff only | SPEC ONLY | none | no | Demo P1 / Full | frontend polish |
| Authentication / session | `src/auth/session.ts`, route handler | IMPLEMENTED + INTEGRATION TESTED | real signed cookie/runtime/reviewed | demo bootstrap only | Demo P0 | production identity deferred |
| PostgreSQL/migrations/idempotency | `migrations/`, `src/persistence/` | IMPLEMENTED + INTEGRATION TESTED | real DB concurrency/runtime/reviewed | n/a | both | deploy environment |
| HTTP API/runtime | `src/api/dispatcher.ts`, `src/runtime/`, `app/api` | IMPLEMENTED + INTEGRATION TESTED | real Next HTTP/runtime/reviewed | API consumer only | Demo P0 | frontend client |
| Demo reset/health | `src/demo/`, `/healthz` | IMPLEMENTED + INTEGRATION TESTED | runtime/reviewed | presenter API only | Demo P0 | presenter UI/deploy check |
| AI provider / reasoning feedback | ADR-007, application contract only | NOT STARTED / SPEC ONLY | no | no | Demo P0 | provider, server adapter, schema/log/fallback tests |
| Adaptive support | reviewed fixed hints only | IMPLEMENTED deterministic selection; AI variant SPEC ONLY | runtime fixed hint path | API only | Full / conditional | prove usefulness and safety |
| Frontend / UI states | `app/page.tsx`, `app/styles.css` | PLACEHOLDER | none | no: buttons only change local step | Demo P0/P1 | replace with API-backed UI per handoff |
| Figma | `docs/design/competition-ui/` and zip mirror | SPEC ONLY | n/a | n/a | Demo | no `.fig`/final export observed |
| Real educational content / teacher review | only `src/fixtures/package-a-structural.ts` | NOT STARTED | fixture explicitly excluded from production | no | Demo P0 | human-approved micro-skill/pairs/interventions |
| Browser E2E | `tests/e2e/README.md` only | NOT STARTED | none | no | Demo P0 | real browser flow |
| Deployment / monitoring | architecture guidance, `/healthz` | SPEC ONLY / health IMPLEMENTED | local runtime only | no | Demo P1 | host/secrets/Postgres deployment |
| Competition artifacts/provenance | proposals, reviews, ADRs, `evidence/prompt-log/` | IMPLEMENTED | prompt-log validation passes | n/a | both | update evidence for future provider/content |

## Preservation rules

Do not rewrite Packages A–I merely to make the code look newer. Their contracts, append-only semantics, transfer isolation, deterministic scoring and receipt issuance are reusable Demo core. The static `app/page.tsx` must be replaced, not treated as an integrated product. The structural fixture is test-only and must never be presented as teacher-reviewed content.
