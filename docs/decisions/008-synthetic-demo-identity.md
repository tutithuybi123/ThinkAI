# ADR-008: Use signed synthetic demo profiles instead of OAuth

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The competition path needs a stable demo and must minimize minor-data exposure. Production identity does not create product value for this MVP.

## Decision

Use server-issued signed sessions for synthetic demo actors. Keep audit/presenter access separate from student navigation.

## Alternatives Considered

OAuth and real learner accounts were rejected as unnecessary scope and privacy risk.

## Consequences

The Actor abstraction permits later identity work without making it a prerequisite. Reset is limited to named synthetic accounts.
