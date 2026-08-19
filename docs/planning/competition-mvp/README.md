# ThinkAI Competition MVP / DEMO target

> **Status: Historical planning package.** It was written before the current source/runtime state and must not be executed as current work. Start at [../../CURRENT.md](../../CURRENT.md); the active v1.1 execution plan is linked there.

**Mode:** planning only. This package makes no implementation claim.

## Repository-based conclusion

> **Historical snapshot only (pre-runtime implementation):** The following conclusion describes the repository at the time this planning package was written. It is no longer a current implementation-status claim; see [../../CURRENT.md](../../CURRENT.md).

The current repository contains ThinkAI proposals/research, prompt-log tooling, evaluation guidance, and an E2E README/template. It contains **no application source, package manifest, route tree, UI component, backend/API, database schema, or runnable deployment configuration**. Actual implementation status therefore overrides the product documents: all product behavior below is a target, not existing functionality.

**Recommendation: CUT SCOPE.** Do not reframe the v1.2 thesis; do not build a broad tutor. Build one complete, demo-safe vertical slice for one Grade-10 mathematics micro-skill, then give that slice an intentional product shell.

## The Competition MVP in one sentence

ThinkAI is a challenge-first math application where a learner can receive legitimate, recorded help on one reviewed skill, apply the same mathematical tool in an unseen changed representation in an isolated challenge, and receive a truthful **Capability Receipt** backed by durable evidence events.

Read in this order:

1. [current-state-audit.md](current-state-audit.md)
2. [competition-mvp-definition.md](competition-mvp-definition.md)
3. [student-journey.md](student-journey.md)
4. [screen-and-ui-scope.md](screen-and-ui-scope.md)
5. [demo-script.md](demo-script.md)
6. [priority-and-dependency-matrix.md](priority-and-dependency-matrix.md)
7. [implementation-order.md](implementation-order.md)
8. [definition-of-done.md](definition-of-done.md)
9. [final-recommendation.md](final-recommendation.md)

## Non-negotiable product constraints

* No numerical help score, mastery percentage, or penalty for asking for help.
* One reviewed micro-skill; 6–10 reviewed item pairs; three fixed help interventions.
* A changed-representation challenge is meaningful only when its pair metadata and independent conditions are real.
* Capability Receipt must be created from actual recorded events.
* Historical delayed evidence must be visibly labelled historical/seeded; never simulated as live retention.
* AI may assist feedback, but task isolation, item selection, scoring where possible, event persistence, receipt rules, and reset must be deterministic.

## Provenance limit

The official Bảng B rulebook remains **UNKNOWN** in this runtime. It was not found in the tracked project material or visible evidence archive. This plan maps only to the categories in the request and v1.2; it must be reconciled with a traceable official source before a competition submission.
