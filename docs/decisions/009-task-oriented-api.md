# ADR-009: Expose task-oriented JSON APIs with idempotent mutations

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The UI flow contains business actions such as opening a hint, starting an isolated challenge and issuing a receipt—not generic editable records.

## Decision

Expose command-oriented JSON endpoints with server-side validation and `Idempotency-Key` support for mutations.

## Alternatives Considered

Generic CRUD APIs were rejected because they would expose or duplicate product policy in the client and complicate double-submit behavior.

## Consequences

Route contracts align with the student journey. Clients cannot select arbitrary tasks, forge receipts or reapply commands unintentionally.
