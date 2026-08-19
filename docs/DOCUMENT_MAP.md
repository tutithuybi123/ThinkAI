# ThinkAI Documentation Map

**Status:** Current navigation and classification manifest

**Use:** [CURRENT.md](CURRENT.md) is the short fresh-session entrypoint. This map is the complete authority landscape for deeper navigation. It classifies scope/authority, not document age; historical records remain preserved for audit.

## Classification key

| Status | Meaning |
|---|---|
| `CURRENT_AUTHORITY` | Directly governs current Competition Demo v1.1 work. |
| `ACTIVE_SUPPORTING_REFERENCE` | Required/current knowledge for an implementation area, but not top-level authority. |
| `EVERGREEN_LONG_TERM` | Important future product, operations, compliance, security, design or methodology knowledge. |
| `HISTORICAL_EVIDENCE` | Preserved rationale, verification, proposal, review or discovery; does not govern behavior. |
| `SUPERSEDED` | Explicitly replaced for the same scope by a newer authority. |
| `DUPLICATE_OR_REDUNDANT` | Mirror/export only; retain for provenance, do not use as authority. |
| `NEEDS_HUMAN_REVIEW` | Authority cannot be resolved from repository evidence alone. |

## Current Authority

| Path | Status | Scope / use | Override relationship |
|---|---|---|---|
| [CURRENT.md](CURRENT.md) | `CURRENT_AUTHORITY` | Fresh-session state, authority order and next work. | Concise entrypoint; does not replace detailed source-of-truth. |
| [product-scope/competition-demo/competition-demo-v1.1-amendment.md](product-scope/competition-demo/competition-demo-v1.1-amendment.md) | `CURRENT_AUTHORITY` | Current Competition Demo product amendment. | Explicit v1.1 conflicts override frozen v1.0 Demo scope. |
| [architecture/competition-mvp/v1.1-amendment-contracts.md](architecture/competition-mvp/v1.1-amendment-contracts.md) | `CURRENT_AUTHORITY` | Current v1.1 contracts: grading, assistance, isolation, lifecycle. | Amends conflicting v1.0 architecture contracts. |
| [decisions/011-evidence-aware-hybrid-grading.md](decisions/011-evidence-aware-hybrid-grading.md) | `CURRENT_AUTHORITY` | ADR-011; current decision relationship to ADR-006/007. | Amends those ADRs only in stated areas. |
| [superpowers/plans/2026-08-19-competition-demo-v1.1-final-implementation.md](superpowers/plans/2026-08-19-competition-demo-v1.1-final-implementation.md) | `CURRENT_AUTHORITY` for execution only | Externally reviewed/PASS sliced implementation plan. | Execution plan, not product authority. |

## Active Supporting Architecture

The following files are `ACTIVE_SUPPORTING_REFERENCE`. They describe the preserved v1.0 runtime-reviewed foundation. Read v1.1 contracts first whenever a detail conflicts.

| Files | Scope / why it matters |
|---|---|
| `architecture/competition-mvp/README.md`, `system-overview.md`, `architecture-decisions.md` | Modular-monolith structure, preserved decisions and current v1.0 foundation map. |
| `application-contracts.md`, `domain-and-content-model.md` | Existing task/API/content contract seams to extend. v1.1 changes conflicting AI, written-reasoning and content-lifecycle assumptions. |
| `event-and-state-model.md`, `persistence-security-resilience.md` | Append-only evidence, isolation, PostgreSQL, privacy/resilience invariants to preserve. |
| `demo-testing-deployment.md` | Existing testing/deployment baseline; not proof of v1.1 release readiness. |
| `implementation-dependency-graph.md` | Historical v1.0 graph that remains useful for backend dependencies; do not execute as v1.1 plan. |

`architecture/competition-mvp/final-architecture-review.md` is `HISTORICAL_EVIDENCE`: completed v1.0 architecture verification, still useful for the backend core it reviewed.

## Active ADRs and amended ADRs

| Files | Status | Scope |
|---|---|---|
| `decisions/001-modular-monolith-stack.md` | `ACTIVE_SUPPORTING_REFERENCE` | TypeScript modular monolith. |
| `decisions/002-postgresql-event-store.md` | `ACTIVE_SUPPORTING_REFERENCE` | PostgreSQL canonical evidence store. |
| `decisions/003-append-only-evidence.md` | `ACTIVE_SUPPORTING_REFERENCE` | Append-only audit/evidence invariant. |
| `decisions/004-reviewed-versioned-content.md` | `ACTIVE_SUPPORTING_REFERENCE` | Reviewed/versioned authoritative content; v1.1 lifecycle extends it. |
| `decisions/005-transfer-session-isolation.md` | `ACTIVE_SUPPORTING_REFERENCE` | Separate Transfer session and leakage prevention. |
| `decisions/006-deterministic-authoritative-scoring.md` | `ACTIVE_SUPPORTING_REFERENCE`, partially amended | Deterministic authority remains active; ADR-011 governs v1.1 reviewed-rubric facets/aggregation. |
| `decisions/007-bounded-optional-ai.md` | `ACTIVE_SUPPORTING_REFERENCE`, partially amended | Preserved AI limits remain active; ADR-011 governs Practice Companion. |
| `decisions/008-synthetic-demo-identity.md` | `ACTIVE_SUPPORTING_REFERENCE` | Synthetic/signed demo identity. |
| `decisions/009-task-oriented-api.md` | `ACTIVE_SUPPORTING_REFERENCE` | Idempotent task-oriented API. |
| `decisions/010-seeded-memory-return.md` | `ACTIVE_SUPPORTING_REFERENCE` | Seeded historical evidence boundary. |
| `decisions/011-evidence-aware-hybrid-grading.md` | `CURRENT_AUTHORITY` | v1.1 amendment. |
| `decisions/README.md` | `ACTIVE_SUPPORTING_REFERENCE` | ADR navigation index. |

No ADR is fully superseded. Earlier ADRs remain discoverable because substantial preserved decisions still govern implementation.

## Product scope and implementation-status documents

| Files | Status | Scope / use |
|---|---|---|
| `product-scope/competition-demo/competition-demo-v1.1-amendment.md` | `CURRENT_AUTHORITY` | Current Demo product scope. |
| `product-scope/competition-demo/competition-demo-v1.1-vietnamese-product-report.md` | `ACTIVE_SUPPORTING_REFERENCE` | Human-readable Vietnamese explanation; not authority. |
| `product-scope/competition-demo/README.md`, `demo-scope-lock.md`, `competition-demo-prd.md`, `demo-ai-role.md`, `demo-content-requirements.md`, `demo-data-and-provenance.md`, `demo-presentation-flow.md`, `demo-student-flow.md`, `demo-technical-acceptance.md` | `HISTORICAL_EVIDENCE` / frozen v1.0 scope package | Preserve v1.0 audit and useful constraints; v1.1 explicit conflicts govern. |
| `product-scope/current-implementation-inventory.md`, `current-code-vs-demo-gap.md`, `demo-completion-plan.md`, `demo-vs-full-product.md` | `HISTORICAL_EVIDENCE` | Time-stamped v1.0 code/gap planning; do not use as live status. |
| `product-scope/full-product/README.md`, `full-product-vision.md`, `full-product-prd.md`, `full-product-ai-role.md`, `full-product-boundaries.md`, `full-product-capability-map.md`, `future-validation-dependencies.md` | `EVERGREEN_LONG_TERM` | Future product direction and boundaries; not current narrow Demo authority. |

## Current Design References

All files in `design/competition-ui/` are `ACTIVE_SUPPORTING_REFERENCE` for visual grammar unless noted below. They are not product authority.

| Files | Status / scope |
|---|---|
| `README.md`, `design-system-brief.md`, `component-library.md`, `vietnamese-product-language.md`, `p0-wireframes.md` | Active visual tokens, component grammar, language and accessibility guidance. |
| `navigation-and-information-architecture.md`, `screen-specs.md`, `ui-state-matrix.md`, `demo-ui-flow.md`, `student-flow.md`, `final-uiux-recommendation.md` | Active supporting flow/layout references; use v1.1 source-of-truth where behavior differs. |
| `figma-handoff.md`, `active-locked-hidden.md` | Active supporting visual guidance with explicit historical v1.0 “no chat” restriction overridden only for bounded Practice Companion. Transfer remains AI-free pre-submit. |
| `design/competition-ui.zip`, `docs.zip` | `DUPLICATE_OR_REDUNDANT` export mirrors; retain for provenance, never authority. |
| `superpowers/specs/2026-08-17-academic-ink-ui-design.md` | `ACTIVE_SUPPORTING_REFERENCE` visual specification; not behavior authority. |

## Execution plans and specifications

| Files | Status | Scope / use |
|---|---|---|
| `superpowers/plans/2026-08-19-competition-demo-v1.1-final-implementation.md` | `CURRENT_AUTHORITY` for execution only | Only active v1.1 execution plan. |
| `superpowers/plans/2026-08-19-evidence-aware-demo-v1.1.md` | `SUPERSEDED` | Explicitly superseded by final v1.1 plan; preserved for audit. |
| `superpowers/plans/2026-08-17-academic-ink-ui.md` | `ACTIVE_SUPPORTING_REFERENCE` | Visual design plan only; never execute independently of final v1.1 plan. |
| `superpowers/specs/2026-08-17-academic-ink-ui-design.md` | `ACTIVE_SUPPORTING_REFERENCE` | Reusable visual-design specification. |
| `planning/competition-mvp/README.md`, `competition-mvp-definition.md`, `current-state-audit.md`, `definition-of-done.md`, `demo-script.md`, `final-recommendation.md`, `implementation-order.md`, `priority-and-dependency-matrix.md`, `screen-and-ui-scope.md`, `student-journey.md` | `HISTORICAL_EVIDENCE` | Pre-v1.1 planning package; preserve rationale, do not execute or treat its code-status claims as current. |

## P0 discovery, provider qualification and content selection

All files under `p0-discovery/` are `ACTIVE_SUPPORTING_REFERENCE`, not product authority.

| Files | Scope / use |
|---|---|
| `p0-discovery/README.md` | Navigation/status guardrail. |
| `ai-model-selection/01-ai-workload.md` through `06-recommendation.md` | Workload, methodology, evaluation set, online evidence, results and provider recommendation evidence. Re-qualify before live provider selection. |
| `ai-model-selection/qualification/00-existing-harness-audit.md` through `10-final-qualification.md` | Qualification protocol/hard gates/recovery/secret-safety evidence. Use in final provider Gate G. |
| `content-selection/01-content-requirements.md` through `04-independent-review.md` | Teacher-review/content-pair selection evidence. Candidate packages are not published content. |
| `content-selection/assets/practice-gradient-graph.svg`, `transfer-gradient-table.svg` | Supporting candidate visual assets; not teacher-approved production content. |

## Competition, compliance and evidence

| Files | Status | Scope / use |
|---|---|---|
| `90. Vv triển khai Cuộc thi Sáng tạo trẻ Quốc gia trong lĩnh vực Trí tuệ nhân tạo năm 2026-đã gộp.pdf` | `EVERGREEN_LONG_TERM` / current compliance source | Official local competition document; use for submission requirements. |
| `../evidence/README.md`, `../evidence/PRIVATE_STORAGE.md`, `../evidence/prompt-log/**`, `../evidence/preflight/**` | `EVERGREEN_LONG_TERM` | Competition provenance, prompt-log and tooling/source-manifest rules. Private material remains private. |
| `../tools/prompt-log/README.md`, `../tools/prompt-log/importers/**/README.md` | `EVERGREEN_LONG_TERM` | Prompt-log tooling/use. |
| `docs/reviews/backend-runtime-acceptance.md` | `HISTORICAL_EVIDENCE` and active supporting runtime proof | Completed v1.0 HTTP/PostgreSQL verification; not v1.1 feature verification. |

## Completed reviews and historical evidence

| Files | Status / scope |
|---|---|
| `reviews/README.md` | Navigation/status guardrail. |
| `reviews/thinkai-v1.1-deep-review/README.md`, `competition-fit-review.md`, `competitor-red-team.md`, `core-thesis-review.md`, `docx-md-consistency.md`, `evidence-ledger-review.md`, `experiment-review.md`, `final-verdict.md`, `independence-trial-review.md`, `mvp-and-demo-review.md`, `product-experience-review.md`, `proof-of-learning-review.md`, `v1.2-change-list.md` | `HISTORICAL_EVIDENCE` | Completed proposal review/risk analysis. Recommendations are not an active task list unless promoted by current authority. |

## Research and proposals

| Files | Status / scope |
|---|---|
| `proposals/README.md`, `proposals/ThinkAI-Idea-Team-Review.md`, `ThinkAI-Idea-Team-Review-v1.1.md`, `ThinkAI-Idea-Team-Review-v1.2.md`, and matching `.docx` files | `HISTORICAL_EVIDENCE` | Prior formulations and proposal provenance; do not govern v1.1 implementation. |
| `research/README.md`, `research/problem-landscape.md`, `opportunity-map.md`, `prior-art-and-products.md`, `research-sources.md`, `scholarly-literature-map.md`, `competition-project-landscape.md`, `evidence-integrity-repair.md` | `HISTORICAL_EVIDENCE` / `EVERGREEN_LONG_TERM` evidence | General discovery/provenance; evidence-integrity rules remain long-term useful. |
| `research/thinkai-product-direction/**` | `HISTORICAL_EVIDENCE` with evergreen thesis rationale | Discovery rationale and future hypotheses; current Demo authority is v1.1 docs. |
| `research/frontier-reality-check/**` | `EVERGREEN_LONG_TERM` methodology/evidence | Reproducible model-reality experiment; not a selected live provider. |
| `research/benchmark-first/**`, `research/deep-validation/**`, `research/final-candidate-discovery/**`, `research/product-first-discovery/**`, `research/communication-sandbox-deep-dive/**` | `HISTORICAL_EVIDENCE` | Candidate discovery, rejected directions and validation records; never current product authority. |
| `eedi-mining-misconceptions-in-mathematics/**` | `HISTORICAL_EVIDENCE` dataset artifact | Preserved external dataset files; no current v1.1 runtime/data dependency is approved by this map. |

The `**` directory patterns above classify every Markdown, CSV, JSON/JSONL and README artifact recursively in those named research directories. Their datasets and source ledgers remain preserved with their documents.

## Root-level documentation

| Files | Status | Scope / use |
|---|---|---|
| `AGENT_MEMORY.md` | `EVERGREEN_LONG_TERM` | Memory-layer model; current state lives in `CURRENT.md`. |
| `PRODUCT.md`, `ARCHITECTURE.md`, `DEVELOPMENT.md` | `HISTORICAL_EVIDENCE` | Explicit pre-flight discovery documents; their old entrypoint instructions must not be followed for current work. |
| `DOCUMENT_MAP.md` | `ACTIVE_SUPPORTING_REFERENCE` | Full documentation navigation/classification; do not replace current authority. |

## Archive

`docs/archive/` is **not created** in this audit. No file met the combined threshold of being both certainly stale and materially clearer when physically moved. Explicit status notices and this map preserve auditability while preventing stale material from competing with current authority.

## Files requiring classification review

None currently. If a future document mixes unresolved current requirements with obsolete assumptions and cannot be safely scoped by a notice, add it here rather than inferring supersession.

## Fresh-session rule

Start with [CURRENT.md](CURRENT.md). Read current authority, then only the active supporting references needed for the approved slice. A recursive search result under proposals, research, completed reviews, historical planning, or a superseded plan is evidence/context—not current instruction—unless a current authority file explicitly promotes it.
