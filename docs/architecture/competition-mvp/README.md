# ThinkAI Competition MVP — Architecture Freeze

**Status:** approved architecture freeze; implementation has not begun.
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

## Repository fact and technology proposal

The repository has no application stack at this point. `.env.example` contains a Next-style app URL and PostgreSQL placeholder, but neither is an implementation. This package therefore defines the ratified MVP architecture:

* **TypeScript modular monolith:** Next.js frontend plus server route handlers in one repository/deployment unit.
* **Canonical store:** PostgreSQL, using migrations and a typed query/ORM layer selected during implementation. SQLite may be used for isolated local tests only, never as the assumed deployed source of truth.
* **API style:** task-oriented JSON HTTP endpoints, not generic CRUD.
* **AI:** an optional server-side adapter, unavailable by default without configured credentials.

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
* A complete demo path works with AI unavailable.
