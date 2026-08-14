# ADR-001: Use a TypeScript modular monolith for the Competition MVP

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

ThinkAI has no application stack and needs one narrow, reliable competition flow without service-distribution overhead.

## Decision

Use a TypeScript modular monolith: Next.js renders the application and hosts server route handlers. Keep domain/application modules independent of web framework code.

## Alternatives Considered

Separate frontend/backend services, microservices, and a no-code assembly were rejected because they add integration or traceability risk without strengthening the evidence loop.

## Consequences

One deployable unit and shared contracts simplify the demo. Replacing the web framework later affects delivery plumbing, not domain contracts.
