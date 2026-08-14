# ADR-003: Model learning evidence as append-only events

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

Assisted success, independent success, later failure and delayed retrieval are non-exclusive observations. A mutable mastery state would erase provenance.

## Decision

Persist immutable evidence events and derive progress, session state and receipts from them. Record corrections as new events referencing earlier facts.

## Alternatives Considered

A single mastery percentage or destructive status ladder was rejected because it hides conditions and conflicting evidence.

## Consequences

Projection code and event versions are first-class. No probabilistic mastery model belongs in this MVP.
