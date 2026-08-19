# ADR-007: Use AI as an optional bounded adapter

- **Status**: Accepted — partially amended by ADR-011 for the Practice Companion
- **Current reader**: Read ADR-011 for the Practice-only bounded Companion. The preserved limits on policy authority, receipts, progression and Transfer remain active.
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The product is an AI competition MVP but cannot depend on provider uptime or let generative output control educational evidence.

## Decision

AI may phrase bounded feedback or choose from approved hints via validated schemas and allow-lists. Reviewed hints, scoring and all state transitions remain available when AI is disabled.

## Alternatives Considered

General chat and live unreviewed task/hint generation were rejected as authoritative demo dependencies.

## Consequences

AI failure produces an honest fallback status only. Provider/model/prompt provenance is recorded in technical logs when AI is enabled.
