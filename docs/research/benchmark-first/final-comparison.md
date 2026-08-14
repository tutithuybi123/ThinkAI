# Final benchmark-first comparison

Scores are evidence-bounded inferences; no winner or project is selected.

| Candidate | AI depth | Dataset readiness | Ground truth | Gap | Novelty | Benchmark | Experiment | Compute | Demo | Competition | Interview dependency | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| A | 8 | 4 | 6 | 3 | 2 | 6 | 6 | 8 | 7 | 5 | NONE | Conditional; novelty audit incomplete |
| B | 4 | 2 | 2 | 1 | 1 | 2 | 1 | 7 | 5 | 2 | HIGH | Eliminated |
| C | 7 | 3 | 4 | 4 | 3 | 4 | 5 | 7 | 7 | 5 | NONE/LOW | Borderline |
| D | 7 | 1 | 1 | 1 | 1 | 1 | 1 | 8 | 5 | 2 | NONE | Eliminated: proposed data gate fails |

## Final gates

| Gate | A — misconception | D — environmental |
|---|---|---|
| Data access | Kaggle page accessible; actual files need confirmation | **FAIL:** no paired raw export/join demonstrated |
| License | **HUMAN VERIFICATION REQUIRED** | **FAIL:** no dataset-specific reuse terms proved |
| Ground truth | misconception mapping | not constructible from verified AQ-SPEC+AQS sources |
| Baseline | BM25/dense/documented retrieve–rerank | not runnable for proposed data |
| Proposed experiment | selective hierarchical diagnosis | only hypothetical after a different lawful paired dataset |
| Primary metric | selective risk–coverage + MAP@25 | N/A for AQ-SPEC+AQS |
| Novelty claim | strict held-out-label safety evaluation, not RAG | no defensible current claim |
| First estimate | 1–3 hours after lawful download | N/A |
| Biggest risk | terms/leakage/no selective benefit | missing paired ground truth / close prior art |

**ELIMINATED:** B and D (for AQ-SPEC+AQS). **BORDERLINE:** C. **CONDITIONAL, NOT READY FOR COMPARISON:** A. No winner is declared.
