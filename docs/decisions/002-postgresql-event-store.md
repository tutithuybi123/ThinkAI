# ADR-002: Use PostgreSQL as the canonical evidence store

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The MVP needs durable, transactional append-only evidence, deterministic reset, and `.env.example` already declares a PostgreSQL placeholder.

## Decision

Use PostgreSQL with migrations as the canonical deployed database. SQLite may support isolated local tests only and is not the deployed source of truth.

## Alternatives Considered

Browser-only storage cannot provide reliable audit/reset. SQLite-only deployment is not assumed safe across possible hosting environments.

## Consequences

Migrations and repositories are required from the first implementation. The schema keeps event and content versions inspectable.
