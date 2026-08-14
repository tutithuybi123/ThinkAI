# Failure analysis

Quantitative ground truth remains the original Eedi label. This review examines representative forced-choice failures; it does not relabel them.

| Case | Confidence | Inspection classification | Evidence |
|---|---:|---|---|
| EEDI-001 | 95 | Near-equivalent candidate labels / taxonomy mapping | Both labels concern order of operations; the model chose a broad statement while Eedi specifies addition-before-multiplication. |
| EEDI-006 | 95 | Insufficient information / taxonomy ambiguity | The selected and Eedi labels attribute different operations to the same `p < -4` response; one selected distractor cannot identify the student's internal operation. |
| EEDI-008 | 99 | Near-equivalent candidate labels | The model correctly identified intercepts, but chose the broader “x or y intercepts” label rather than Eedi's y-intercepts label. |
| EEDI-019 | 99 | Correct reasoning but wrong taxonomy mapping | It correctly described 4 as the second significant digit; Eedi instead labels it as confusing a decimal place with a significant figure. |
| EEDI-027 | 99 | Near-equivalent candidate labels | Both candidate explanations make `(-3)^3` positive; the model selected the direct power formulation rather than Eedi's broader negative-multiplication formulation. |
| EEDI-034 | 94 | Correct reasoning but wrong taxonomy mapping | It recognized that rectangle properties give the missing length, but selected a generic composite-shape label rather than conservation of perimeter. |
| EEDI-039 | 99 | Correct reasoning but wrong taxonomy mapping | It correctly used the horizontal coordinate difference to explain 6; Eedi labels the same observation as width/height confusion. |
| EEDI-041 | 98 | Mathematical reasoning / taxonomy mismatch | The model describes dividing by 10 rather than 100, yet Eedi's label is the specific mistaken belief that division by 10 gives 1%. |
| EEDI-048 | 99 | Candidate-set artifact / taxonomy ambiguity | `4/20` directly matches adding numerators and multiplying denominators, while Eedi labels a different common-denominator error. |
| EEDI-049 | 99 | Insufficient information / near-equivalent labels | The output `(3,-3)` is consistent with sign-switching and with swapping coordinates; one response cannot reliably distinguish the stated causes. |
| EEDI-065 | 97 | Near-equivalent candidate labels | “symbol for equal lengths” and “dashes on sides” are effectively paraphrases here. |

The dominant observed pattern is not inability to solve the mathematics. It is confident selection of an alternative, often semantically overlapping Eedi taxonomy label. That is still a real diagnostic reliability failure for a system that must return the dataset/teacher taxonomy exactly. The abstention instruction did not remove it: 38 incorrect accepted diagnoses remained, all at confidence >=80.

Five abstention cases (EEDI-051–EEDI-055) are execution errors after the allowed formatting retry; they are kept out of accepted-set accuracy rather than manually interpreted.
