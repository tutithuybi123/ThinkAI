# 3-minute demo design and attack

## Proposed demonstration, if the narrow reality check passes

1. **Problem (20 s):** a student rehearses a two-minute teacher-provided Vietnamese presentation and cannot consume repeated teacher feedback.
2. **Practice (45 s):** simulator gives one audience question or interruption; the user delivers a short prepared segment.
3. **Evidence (50 s):** show audio waveform/timeline and transcript: exact reference omission, an inserted repetition, silent-pause duration, filler count, total duration and ASR uncertainty. Show a clearly labelled *suggestion* tied to a rubric/transcript span, not a global confidence score.
4. **Retry (35 s):** replay a revised attempt and show only comparable facts changing, plus one retained weakness.
5. **Proof/failure (30 s):** show the benchmark card and an intentional failure: valid paraphrase or ASR error is marked “needs review,” not penalized.

## Demo evidence vs benchmark evidence

| Demo evidence | Benchmark evidence |
|---|---|
| A real end-to-end interaction and transparent feedback | Held-out ASR WER; alignment/filler/pause precision-recall; stability; human-rater agreement; sample size/subgroups/failures |
| One retry improves a predeclared measurable item | Pre/post aggregate cannot be claimed until user study |
| A visible abstention protects a user | Report rate of abstentions/false certainty on held-out cases |

The demo is cherry-pickable unless the same frozen test set, thresholds, cases, outputs and failures are available. Do not use a perfect scripted case alone. The intentional failure is essential: it demonstrates the system refuses to translate ASR uncertainty, dialect or paraphrase into a false defect.
