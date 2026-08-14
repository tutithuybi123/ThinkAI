# Reproducible baseline map

| Candidate | Strong baseline | Primary metric |
|---|---|---|
| A | BM25, dense retrieval, documented retrieve–rerank | MAP@25; risk–coverage/ECE |
| B | PAC/rule validator | criterion-level accuracy only; no valid end outcome dataset |
| C | multilingual NLI; retrieval + NLI | claim F1, attribution, ECE |
| D | linear correction, RF/XGBoost | only after a verified paired dataset exists |

LLM API calls are comparators, never the contribution or sole baseline.

## A: protocol controls

Use lexical BM25 and a local dense retriever over only training taxonomy items. Add a retrieve–rerank system only when its implementation/data use are reproducible. Evaluate every system without abstention and at the same coverage after applying a common post-hoc selective rule; otherwise a system could appear safer merely by refusing more cases. The primary comparison is accepted-set risk at coverage, with MAP@25 as a secondary retrieval metric. No proprietary API is required for this first test.

## D: blocked baseline

Linear humidity-aware correction and RF/XGBoost would be appropriate only after a paired raw table is audited. AQ-SPEC reports plus separate EPA reference files do not create a valid calibration baseline absent a documented, lawful, non-leaking join.
