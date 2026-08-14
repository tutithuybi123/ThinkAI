# ADR-010: Limit Ôn lại sau to explicitly seeded historical evidence in MVP

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The demo needs to show how delayed evidence appears without fabricating retention in real time or adding scheduler infrastructure.

## Decision

Use a separate synthetic historical profile/event with visible timestamp and provenance. Do not implement real delayed scheduling in the Competition MVP.

## Alternatives Considered

Fake immediate retention and a production scheduler were rejected as misleading and premature, respectively.

## Consequences

The UI may demonstrate historical evidence honestly. Real reminder/scheduling work requires a later product and consent decision.
