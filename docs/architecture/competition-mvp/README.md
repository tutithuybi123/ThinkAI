# ThinkAI Competition MVP — Architecture Freeze

> **Current v1.1 amendment:** Read [v1.1-amendment-contracts.md](v1.1-amendment-contracts.md) and [../../CURRENT.md](../../CURRENT.md) first. This architecture freeze remains active supporting reference for the implemented v1.0 backend core; where it conflicts with explicit v1.1 contracts, v1.1 governs current Competition Demo work.

**Status:** approved architecture freeze; Packages A–I backend core is implemented and runtime-reviewed. Frontend, live AI product layer and reviewed educational content remain outside the completed backend core.
**Ratified:** 2026-08-14.
**Scope:** one Grade-10 mathematics micro-skill and the approved student flow only.
**Primary rule:** deterministic core + bounded AI.

## What is being frozen

The implementation target is one modular-monolith application that supports:

```text
Trang chủ → Bài luyện → attempt / Xem gợi ý → solve
→ Thử vận dụng (isolated) → reveal mối liên hệ
→ Xác nhận kỹ năng → Tiến độ / Chi tiết lần làm
```

The backend owns content selection, scoring, evidence, receipt eligibility and state transitions. The frontend renders the Vietnamese product experience specified in [the UI handoff](../../design/competition-ui/README.md).

## Repository fact and ratified technology proposal

At ratification, this package selected the implementation shape. The current repository now contains the resulting TypeScript/Next modular monolith, PostgreSQL migrations, task-oriented API and Packages A–I backend core; see `docs/product-scope/current-implementation-inventory.md` for the current state. The ratified architecture is:

* **TypeScript modular monolith:** Next.js frontend plus server route handlers in one repository/deployment unit.
* **Canonical store:** PostgreSQL, using migrations and the explicit typed `pg` adapter in `src/persistence/pg-driver.ts`. SQLite may be used for isolated local tests only, never as the assumed deployed source of truth.
* **API style:** task-oriented JSON HTTP endpoints, not generic CRUD.
* **AI:** optional to the deterministic backend core, which stays safe when a provider is unavailable. Under the frozen `competition-demo-v1.0` scope, a configured live bounded `reasoningFeedback` call is mandatory on the normal Demo path; `AI_UNAVAILABLE` is only an explicitly labelled resilience fallback.

No microservices, vector database, RAG, model training, global knowledge graph or LMS belong here.

## Read in this order

1. [system-overview.md](system-overview.md)
2. [domain-and-content-model.md](domain-and-content-model.md)
3. [event-and-state-model.md](event-and-state-model.md)
4. [application-contracts.md](application-contracts.md)
5. [persistence-security-resilience.md](persistence-security-resilience.md)
6. [demo-testing-deployment.md](demo-testing-deployment.md)
7. [implementation-dependency-graph.md](implementation-dependency-graph.md)
8. [architecture-decisions.md](architecture-decisions.md)
9. [final-architecture-review.md](final-architecture-review.md)

## Non-negotiable invariants

* Only reviewed/versioned content can produce an authoritative score or receipt.
* Evidence events are append-only. Corrections are new events, not overwritten history.
* Opening a reviewed hint is recorded but never penalizes the learner.
* The `Thử vận dụng` session cannot receive the prior solution, hint body or LLM conversation context.
* A Capability Receipt is server-derived from events; a client cannot create or alter one.
* Historical/seeding provenance is visible and queryable.
* The deterministic backend core works with AI unavailable; the frozen Competition Demo must additionally exercise its live bounded AI normal path and separately test the labelled unavailable fallback.
