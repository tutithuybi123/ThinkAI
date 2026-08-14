# Ratified architecture decisions

**Ratified:** 2026-08-14. AF-01 through AF-10 are accepted for the Competition MVP. Their canonical ADRs are [ADR-001](../../decisions/001-modular-monolith-stack.md) through [ADR-010](../../decisions/010-seeded-memory-return.md). This document remains the compact freeze index.

| ID | Proposed decision | Why it fits MVP | Consequence / reversal cost |
|---|---|---|---|
| AF-01 | TypeScript modular monolith: Next.js UI + route handlers | one deployable unit, shared contracts, no service network | switching framework later changes API/web plumbing, not domain contracts |
| AF-02 | PostgreSQL canonical store with migrations | transaction-safe append-only evidence; `.env.example` already points to PostgreSQL | replacing DB requires repository/migration work; keep SQL/domain boundaries clean |
| AF-03 | Event facts are append-only; projections/receipts derived | preserves assisted conditions and contradictory later evidence | migration later is costly; never model mastery as mutable field |
| AF-04 | Reviewed versioned content only for authoritative path | protects transfer validity and demo integrity | content authors need a review workflow/fixture validation |
| AF-05 | Transfer gets a separate session/DTO/context boundary | makes isolation technically demonstrable | route/service boundary must be kept in tests |
| AF-06 | Scoring is deterministic; AI cannot change score/receipt | demo remains reliable and claims traceable | constrains active content to objectively scoreable tasks |
| AF-07 | Optional AI adapter only; reviewed hints always available | preserves meaningful AI role without making provider a demo blocker | live AI polish can arrive after core |
| AF-08 | Synthetic signed demo profiles, no OAuth | minimum privacy/scope/reliability | real accounts require later actor/auth adapter |
| AF-09 | Task-oriented JSON API with idempotency | maps to product actions and protects double submits | avoid generic CRUD expansion |
| AF-10 | `Ôn lại sau` is seeded historical only in MVP | prevents fake real-time retention/scheduling claim | real scheduler is future work |

## Contracts never to change casually

1. Event envelope fields, provenance vocabulary and append-only correction rule.
2. Content/pair review requirement and version snapshots.
3. Transfer forbidden-context contract.
4. Receipt policy source-event references and server-only issuance.
5. No-help-penalty rule and no numeric assistance/mastery surface.
6. API idempotency semantics for mutations.

## Explicit exclusions

No multi-subject architecture beyond generic IDs; broad knowledge graph; Learning Twin; adaptive recommendation engine; classroom/LMS; parent portal; analytics warehouse; RAG/vector DB; training pipeline; microservices; Kafka/event streaming; no-code integration; real-time collaboration; global notification scheduler. Adding any needs a new product decision and architecture review.
