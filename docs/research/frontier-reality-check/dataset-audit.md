# Dataset audit

Generated from the read-only Kaggle Eedi files on 2026-08-11T15:45:41Z.

| Measure | Recomputed value |
|---|---:|
| Questions (`train.csv` rows) | 1,869 |
| Labeled incorrect-answer distractors | 4,370 |
| Taxonomy size (`misconception_mapping.csv`) | 2,587 |
| Unique misconception labels used in train | 1,604 |
| Minimum / median / maximum label frequency | 1 / 2 / 54 |

Frequency distribution (number of labels):

| Eedi train frequency | Labels |
|---|---:|
| 1 occurrence | 747 |
| 2 occurrences | 343 |
| 3-4 occurrences | 299 |
| 5-9 occurrences | 160 |
| 10+ occurrences | 55 |

`cases.csv` contains one case for every labeled incorrect answer in the selected evaluation set, with QUESTION, CONSTRUCT, SUBJECT, CORRECT ANSWER, STUDENT WRONG ANSWER, and the preserved ground-truth fields. Ground-truth fields are strictly offline evaluation metadata and must not be included in an evaluated-model prompt.

Important: **Eedi-unseen/rare is not equivalent to LLM-unseen.** Frequency measures label occurrence in this train split, not whether the underlying mathematics was in a model’s pretraining data.
