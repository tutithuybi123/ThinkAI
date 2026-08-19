# ThinkAI Competition Demo — content-selection requirements

**Status:** discovery record; non-authoritative; not teacher-reviewed.  
**Work item:** ThinkAI-ac5.2.  
**Prepared:** 2026-08-15.  
**Scope boundary:** this document selects candidates only. It neither activates content nor records a teacher decision.

## Product constraint distilled

The Demo has to show, in roughly three minutes, one narrow chain: a learner gets recorded, reviewed help while practising; then independently uses the **same mathematical relation or strategy** on an unseen, validly changed task; deterministic scoring verifies the response; an honest, narrow Capability Receipt reports only that observed event. A correct assisted practice response is not evidence of broad mastery.

The canonical source is the frozen Demo scope and PRD: `docs/product-scope/competition-demo/`, `demo-vs-full-product.md`, `current-code-vs-demo-gap.md`, `docs/proposals/ThinkAI-Idea-Team-Review-v1.2.md`, and the v1.1 review package. Current code, rather than a proposal, determines what can be served.

## Non-negotiable content contract

| Requirement | Evidence in the repository | Consequence for candidates |
|---|---|---|
| One atomic Grade-10 mathematics micro-skill | Demo content requirements; v1.2 §11 | Name one relation/strategy, not “Functions” or “Vectors”. |
| Same target, changed situation | `ReviewedTaskPair.targetRelation`, `changeDimensions`, `relationMapping` | Practice and transfer must preserve the relation/strategy; number changes alone are invalid. |
| Unseen, isolated transfer | PRD; `src/transfer/service.ts`; student-flow docs | Transfer must not show practice answer, hint, mapping, or solution before scoring. |
| Exact declared change | `ChangeDimension`: representation/context/givens/route | Declare one primary change; justify any secondary change and prevent it from becoming a different skill. |
| Three immutable reviewed practice interventions | `InterventionContent`; demo-content-requirements | Each needs exact text, version/provenance, ordered disclosure, and exposure tags. No transfer hints. |
| Deterministic authoritative score | ADR-006; `src/scoring`; `src/content/validator.ts` | Use numeric or constrained choice; expression scoring is deliberately unavailable for authoritative MVP content. |
| Review/version/provenance gate | ADR-004; `ReviewRecord`; validator | Only `approved` metadata can be loaded; every candidate here remains draft/non-authoritative until a real teacher records a decision. |
| Authored connection reveal | `ConnectionRevealSpec` | The after-score explanation is pre-authored and reviewed, never generated live. |
| Receipt is narrow and conditional | receipt service; proof-of-learning review | State the independent unseen changed-task result and conditions; never claim general mastery, learning gain, retention, or intelligence. |
| No required hidden reasoning | schema/domain model; demo AI role | Ask for optional, bounded learner explanation; do not collect chain-of-thought or let AI decide correctness. |
| Vietnamese learner-facing flow | frozen Demo PRD/design | Prompts and interventions must be short Vietnamese and visually legible. |

## Scoring and data-shape limits that affect selection

The current validator permits `numeric`, `exact_text`, and unique-option `choice` answers; authoritative `expression` answers are rejected. A candidate therefore needs a single unambiguous numeric value or a deliberately constrained reviewed choice. A free-text explanation may enable non-authoritative AI feedback after practice scoring, but may not decide eligibility or issue a receipt.

The live loader rejects content without approved review records. The structural fixture (`src/fixtures/package-a-structural.ts`) is a contract test only and cannot be reused or described as mathematics content.

## Educational and demo selection criteria

The candidate should have objective correctness, a visible representation/context shift, low unrelated prerequisite load, short prompts, an obvious shared structure after reveal, and meaningful feedback beyond “right/wrong.” It must allow useful distinctions such as: correct strategy with an arithmetic/sign error; a correct answer without a coherent explanation; confusing rise/run order; or inability to name a first step. The deterministic scorer remains the authority in every case.

The initial preference in v1.2 is a Grade-10 linear-function relation or comparable relation with objectively checkable answers. This is a product-direction preference, **not** confirmation that every proposed item is curriculum-approved. The teacher package asks a Grade-10 teacher to verify current local curriculum fit before any activation.

## Curriculum and source verification boundary

The candidate family is framed against the national 2018 General Education Mathematics programme (Ministry of Education and Training, Circular 32/2018/TT-BGDĐT, programme appendices). Public curriculum access could not be freshly retrieved through the configured Tavily research account on 2026-08-15 because its usage limit was reached. Therefore this record makes only a conservative alignment hypothesis—linear functions/coordinate representations are within the intended Grade-10 functions content direction—and requires a teacher to validate the precise textbook sequence, terminology, and local programme fit. It does not quote or reproduce textbook tasks.

## Rejection gates

Reject or revise a candidate if a teacher finds target mismatch, ambiguous wording/diagram scale, added prerequisites, an easier transfer, mere number substitution, answer leakage, or an intervention that reveals the full solution. Also reject if a judge cannot understand the shared relation quickly, the required visual asset cannot be made unambiguous, or a receipt would need to overclaim.

## Provenance convention for this discovery set

All proposed prompts, answers, interventions, mappings, and receipt wording are **AI-generated project-team candidates** authored for review on 2026-08-15. They are not copied or adapted from a protected item. Their conceptual curriculum context is the official programme citation above; no external exercise supplied their wording or numbers. A teacher modification must receive a new version and record its author/reviewer/source in the eventual approved content record.
