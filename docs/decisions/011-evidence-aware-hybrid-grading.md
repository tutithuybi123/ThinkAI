# ADR-011: Extend the Demo with evidence-aware assistance and hybrid grading

- **Status**: Accepted / externally reviewed — current amendment for `competition-demo-v1.1`
- **Date**: 2026-08-19
- **Author**: ThinkAI team (project-owner amendment request recorded in prompt log)
- **Amends**: ADR-006 and ADR-007, only as stated below; both earlier ADRs remain historical records.

## Context

The v1.0 Demo correctly kept deterministic scoring authoritative and AI limited to post-score feedback/reviewed-hint selection. The expanded vertical slice needs written mathematical solutions and a bounded practice companion while retaining the central distinction between assisted success and independent transfer.

## Relationship to earlier ADRs

### ADR-006: deterministic authoritative scoring

**Preserves:** Deterministic validation remains authoritative for every facet/task with a reliable approved deterministic validator. Its versioned result cannot be silently overridden. The rejected alternative is an **unconstrained, free-form, unreviewed LLM judgement used directly as authoritative scoring**.

**Amends:** v1.1 activates the ADR-006 possibility of constrained reviewed-rubric scoring for written mathematical reasoning. A schema-validated evaluator supplies rubric facets/criteria evidence, not a model-authoritative outcome; deterministic server aggregation/policy derives `CORRECT`, `PARTIALLY_CORRECT`, `INCORRECT`, or `UNCERTAIN`. For a written-solution facet without an applicable reliable deterministic validator, valid reviewed-rubric evidence can be a grading-evidence route through which the server aggregator produces `CORRECT` and backend policy satisfies a grading gate. The evaluator still cannot directly issue a pass, receipt, or progression update.

### ADR-007: bounded optional AI

**Preserves:** AI cannot mutate policy, self-unlock progression, issue a receipt, access/reveal transfer material, or appear as learner assistance during transfer. Provider failure remains unable to damage deterministic scoring, evidence integrity, or recovery.

**Amends:** Only in Practice, the prior limitation to post-score feedback/reviewed-hint selection is superseded by a bounded Practice Companion. It is server mediated, guided by approved content, schema/output validated, and recorded as structured assistance evidence. It is not a general chat service; transfer keeps no pre-submit learner-facing AI assistance.

## Decision

Adopt `competition-demo-v1.1` as an explicit amendment. Record assistance as structured server-generated evidence, including scaffold level, attempted answer reveal, actual learner exposure, and blocked output. The model may propose a reply/metadata only; server validation/classification owns support and attempted/block facts, and server delivery outcome owns actual exposure. These facts are non-punitive and cannot be fabricated by a client; an actual unsafe exposure is retained truthfully rather than hard-coded away.

Use separate contracts for Practice Companion, post-submit Practice/Transfer Rubric Evaluators, and **Practice Process Feedback**. Rubric requiredness is owned by reviewed content; the server rejects incomplete, duplicate, unknown, or semantically inconsistent criterion evidence before deriving an outcome. Model confidence is diagnostic provenance only and has no grading, gate, receipt, or conflict-resolution authority. Reference solutions are non-canonical supporting evidence; a learner may use a different correct mathematical method. Practice Process Feedback never operates on Transfer; Transfer evaluation receives only transfer-owned post-submit material and never practice context or pair/reveal information.

Use immutable content versions with `DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` → `DEPRECATED`. Only a `DRAFT` body is mutable; submitting it for review freezes the complete body. Any subsequent change creates a new draft/version. Publishing exposes exactly the reviewed/approved immutable body—question, expected result, rubric, references, pair, connection, and AI guidance—and historical sessions/evidence remain bound to their original versions.

## Consequences

The Demo gains a credible learning interaction and can acknowledge different valid methods. It also gains provider reliability, schema-validation, content-review, assistance-provenance, retention-policy, and test obligations. The vertical slice stays intentionally small: no general tutor, automatic publishing, broad curriculum adaptation, or unsupported learning claims.
