# Backend Runtime Acceptance Evidence

> **Status: Completed historical verification record.**
>
> **Applies to:** the runtime-reviewed v1.0 backend core and structural test fixture. It remains active supporting evidence for preserved runtime/persistence behavior, but does not verify v1.1 Content Studio, AI Companion, hybrid grading, or learner UI work.

This acceptance test starts the actual Next.js App Router server and uses a clean, real PostgreSQL database. It does not treat service-level calls as HTTP coverage.

The temporary content bundle is the existing `structural_test_only` fixture. It is enabled solely by `THINKAI_RUNTIME_ACCEPTANCE_TEST=1` outside production, remains visibly non-educational, and production runtime continues to reject it. No teacher-reviewed mathematics claim is created by this test.

## Reproduction command

```powershell
docker start thinkai-pg-test
$env:THINKAI_RUNTIME_ACCEPTANCE='1'
$env:THINKAI_TEST_DATABASE_URL='postgresql://postgres:thinkai_test@127.0.0.1:55433/thinkai_test'
npm run test:runtime
```

The test creates and later removes `thinkai_runtime_acceptance_<pid>` via PostgreSQL. The actual server command issued by the harness is:

```text
node node_modules/next/dist/bin/next dev --port <ephemeral-port>
```

At startup, `createProductionRuntime()` invokes `runMigrations()` against that clean database; the test verifies all six migration records.

## HTTP endpoint inventory

| Method + path | Authentication | Example / expected result | Runtime test coverage |
|---|---|---|---|
| `GET /healthz` | none | `200` `{status:"ok", persistence:"available", ai:"disabled"}` | initial health, post-start, post-recreate |
| `POST /api/v1/demo/session` | none | `{profile:"clean"}` → `200` + signed HttpOnly cookie | clean and history bootstrap |
| `POST /api/v1/demo/staff-session` | staff bootstrap secret | `{role:"presenter"}` → `200` + presenter cookie | restricted audit and reset setup |
| `GET /api/v1/home` | learner cookie | `200` home view | golden flow and tampered-cookie rejection |
| `GET /api/v1/skills` | learner cookie | `200` active server-selected pair | golden flow |
| `POST /api/v1/challenges/start` | learner + `Idempotency-Key` | forged `pairId` ignored; `201` approved pair | golden flow and concurrency setup |
| `GET /api/v1/challenges/:id` | owning learner | `200` resumed challenge | immediate and post-restart resume |
| `POST /api/v1/challenges/:id/attempts` | owning learner + key | `{kind:"attempt"}` → `200` | golden flow and concurrent distinct keys |
| `POST /api/v1/challenges/:id/interventions/:id/open` | owning learner + key | `{}` → `200` reviewed hint exposure | golden flow |
| `POST /api/v1/challenges/:id/submissions` | owning learner + key | `{answer:"fixture"}` → `200` deterministic score | golden flow |
| `POST /api/v1/challenges/:id/transfer/start` | owning learner + key | `{sessionId}` → `201` isolated transfer | golden flow verifies no hint leakage |
| `GET /api/v1/transfers/:id` | owning learner | `200` transfer view | golden flow |
| `POST /api/v1/transfers/:id/submissions` | owning learner + key | `{answer:"fixture"}` → `200` | golden flow |
| `POST /api/v1/transfers/:id/connection/reveal` | owning learner + key | `{}` → `200` reviewed mapping | golden flow |
| `POST /api/v1/receipts/issue` | owning learner + key | linked practice/transfer IDs → `201` receipt | golden flow |
| `GET /api/v1/receipts/:id` | owning learner | `200` receipt | golden flow |
| `GET /api/v1/progress` | learner cookie | `200` event-derived summary | golden flow |
| `GET /api/v1/audit/receipts/:id` | presenter/auditor cookie | `200`; learner gets `403` | golden flow |
| `POST /api/v1/demo/reset` | presenter + key | `200` seeded reset; retry is idempotent | reset isolation assertions |

## Required runtime assertions

- Restart preserves the signed learner session and resumed practice snapshot.
- A tampered signed cookie receives `401`.
- Reset revokes the clean learner cookie, preserves seeded history and an unrelated actor’s event, and writes exactly one audit row for a repeated idempotency key.
- Two simultaneous HTTP attempt mutations with distinct idempotency keys complete as `200` or typed `409`, and the resumed snapshot remains monotonic.
- The test drops/recreates the clean database and repeats the full golden flow.
