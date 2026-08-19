# ADR-006: Keep authoritative scoring deterministic

- **Status**: Accepted — partially amended by ADR-011 for v1.1 written-reasoning grading
- **Current reader**: Read ADR-011 for constrained reviewed-rubric facet evidence and server aggregation. Deterministic authority for reliable applicable validators remains active.
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

Receipt claims and demo resilience require reproducible correct/incorrect outcomes.

## Decision

Use exact, normalized numeric, symbolic, or constrained reviewed-rubric scoring where reliable. Record scorer and answer-spec versions. AI cannot override a score or issue a receipt.

## Alternatives Considered

LLM-only answer evaluation was rejected because it is not sufficiently traceable or stable for the authoritative evidence loop.

## Consequences

Active content is constrained to objectively scoreable tasks. Unsupported answer forms are not MVP content.
