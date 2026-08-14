# ADR-005: Isolate Thử vận dụng in a separate server session

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

ThinkAI must distinguish learning with help from applying the same relation in a changed situation without system leakage.

## Decision

Create a distinct `TransferSession`, endpoint DTO and AI-context allow-list. Prior answer, solution, hint body and practice conversation are forbidden.

## Alternatives Considered

A second question in the same client session was rejected because it can serialize prior solution context and cannot demonstrate controlled conditions.

## Consequences

Isolation tests are mandatory. This protects against product leakage, not against a learner remembering prior learning.
