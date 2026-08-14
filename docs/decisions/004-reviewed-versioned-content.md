# ADR-004: Require reviewed, versioned content for authoritative outcomes

- **Status**: Accepted
- **Date**: 2026-08-14
- **Author**: ThinkAI team (ratified by product owner)

## Context

The signature interaction depends on a valid changed-representation pair and trustworthy hints/scoring.

## Decision

Only content with approved review metadata and immutable versions may be selected for a live challenge, deterministic score or Capability Receipt.

## Alternatives Considered

Runtime LLM-generated tasks/hints as ground truth were rejected because their transfer validity and provenance are not guaranteed.

## Consequences

The fixture/content validator is a core gate. Reviewers must supply and approve pairs before their content becomes active.
