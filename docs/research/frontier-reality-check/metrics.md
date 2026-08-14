# Metrics

Model: `gpt-5.6-terra` via configured provider `codex-pooler-ws`. The run used fresh native Codex CLI calls with fixed case order. All scoring uses evaluator-side ground truth only.

## Forced choice — 150 executed

| Metric | Result |
|---|---:|
| Top-1 accuracy | 67.3% (101/150) |
| Wrong predictions | 49 |
| Wrong, confidence >=80 | 45 |
| Wrong, confidence >=90 | 40 |
| Mean confidence, correct | 94.0 |
| Mean confidence, wrong | 93.3 |

## Abstention allowed

One five-case batch remained malformed after the one permitted formatting retry, so EEDI-051 through EEDI-055 are `EXECUTION_ERROR` and excluded from conditional accuracy. Of 145 structurally executed cases, 33 abstained and 112 were accepted.

| Metric | Result |
|---|---:|
| Coverage among executed | 77.2% (112/145) |
| Coverage of all planned cases | 74.7% (112/150) |
| Abstention rate among executed | 22.8% (33/145) |
| Accepted-set accuracy | 66.1% (74/112) |
| Incorrect accepted diagnoses | 38 |
| High-confidence (>=80) incorrect accepted diagnoses | 38 |

## Frequency buckets

| Eedi label frequency | Forced accuracy | Abstention accepted / planned | Abstention accepted accuracy |
|---|---:|---:|---:|
| 1 occurrence | 76.7% (23/30) | 24/30 | 70.8% (17/24) |
| 2 occurrences | 70.0% (21/30) | 22/30 | 68.2% (15/22) |
| 3–4 occurrences | 63.3% (19/30) | 21/30 | 57.1% (12/21) |
| 5–9 occurrences | 60.0% (18/30) | 21/30 | 66.7% (14/21) |
| 10+ occurrences | 66.7% (20/30) | 24/30 | 66.7% (16/24) |

The non-monotonic pattern does not support a simple conclusion that lower Eedi frequency causes poorer performance. It is a label-frequency measure, not an LLM-pretraining exposure measure.

## Risk–coverage information

For accepted abstention outputs, raising a confidence threshold does not materially reduce risk: at threshold 0, error risk is 33.9% at 74.7% all-case coverage; threshold 90 gives 34.0% risk at 64.7% coverage; threshold 99 still gives 29.4% risk at 22.7% coverage. Verbal confidence is therefore not a useful selective-reliability signal in this run.
