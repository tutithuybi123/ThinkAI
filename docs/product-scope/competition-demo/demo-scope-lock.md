# Demo scope lock — `competition-demo-v1.0`

> **Status: Frozen historical record.** Never rewrite. Explicit current v1.1 conflicts govern current Competition Demo work.

Freeze requires `PRODUCT SCOPE REVIEW: PASS` or `PASS WITH FIXES` with no P0/P1 issue. Any P0 alteration afterwards requires an explicit amendment in this file and a new independent review.

## Ratification record

| Field | Recorded decision |
|---|---|
| Status | **COMPETITION DEMO SCOPE: FROZEN** |
| Scope version / freeze date | `competition-demo-v1.0` / 2026-08-15 |
| Accountable owner | **ThinkAI Team Lead** |
| Owner authority | approve/freeze Demo scope; approve or reject amendments; prioritise within approved direction |
| Teacher-required authority | mathematical/educational content, task-pair validity, reviewed intervention status, and educational/learning-effect claims |
| Non-owner role | designers, developers, reviewers and AI agents may propose; they may not approve scope |
| Exact P0 | approved real content; live bounded AI feedback; API-backed Vietnamese flow; evidence/transfer/receipt/progress/audit; browser E2E and runtime acceptance |
| Explicit exclusions | all items in `competition-demo-prd.md` exclusions and `demo-vs-full-product.md` non-Demo rows |
| Human dependencies | teacher content reviewer |
| Design dependencies | current Markdown UI handoff; final Figma export only if supplied for visual fidelity |
| AI dependencies | provider credential, approved model, prompt-template version and provider safety review |
| Acceptance gates | `demo-technical-acceptance.md`, fresh independent AI/backend review and fresh frontend/full-stack review |
| Independent scope review | `PRODUCT SCOPE REVIEW: PASS WITH FIXES` — 2026-08-15; no P0/P1 remaining |

## Amendment record template

| Field | Required record for an approved change |
|---|---|
| Date / scope version | ISO date / incremented scope version |
| Approver | **ThinkAI Team Lead** |
| Change | exact altered invariant/P0 classification |
| Reason / impact | evidence or requirement; implementation/dependency effect |
| Review | fresh independent review verdict |

## Invariants

1. Demonstrate one real evidence loop, not a mocked walkthrough.
2. AI feedback is live, useful and visibly labelled, but cannot score, select an authoritative task, reveal transfer information, issue a receipt or mutate evidence policy.
3. Transfer remains isolated and reviewed.
4. Receipt claims only observed conditions; delayed evidence is historical/seeded only when so marked.
5. Hints are never penalised.
6. Structural fixtures are test-only; actual Demo content has teacher-review provenance.
