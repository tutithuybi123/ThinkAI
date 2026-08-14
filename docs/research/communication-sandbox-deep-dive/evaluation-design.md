# Evaluation design

## What can be proven without a large user study

* ASR WER/CER on a held-out, lawfully obtained Vietnamese/English test set.
* Script-alignment precision/recall/F1 against manually labelled omissions, insertions, substitutions and repetitions.
* Pause/filler detection precision/recall using a fixed threshold and blind human annotation.
* Deterministic metric test–retest stability; latency and failure rates.
* English read-aloud model–human score correlation/MAE on a lawful labelled benchmark, bounded to its population.
* For LLM suggestions: repeated-run agreement, rubric adherence, evidence-span precision, and abstention/calibration—not self-reported confidence.

## What requires real users/experts

Teacher agreement on a presentation rubric; helpfulness and comprehension; impact on practice frequency and learning; effects of adaptive scenarios; accent/cultural fairness; anxiety/dependency; and transfer to spontaneous speaking. A model score is not an outcome study.

## Minimum protocol

1. Freeze tasks, reference scripts/rubric, audio conditions, preprocessing versions and pass/fail metrics before runs.
2. Hold out 20–30% clips and have at least two blinded human annotators. Report agreement and disagreements.
3. Keep an evidence ledger: audio time span, transcript span, feature value/threshold, ASR confidence, algorithm/model version and prompt hash.
4. Evaluate LLM output three or more times on the same frozen transcript. Measure exact JSON validity, category agreement, evidence-span precision and inappropriate-certainty rate.
5. Compare against simple baselines: raw transcript/edit distance; rule-based VAD/filler count; generic Yoodli/LLM feedback where allowed.
6. Publish failures, abstentions and subgroup slices. Do not tune on the held-out set.

This follows the repository’s existing fixed-case/held-out-ground-truth evaluation pattern in `docs/research/frontier-reality-check/`; that experiment also demonstrates why high model confidence cannot be treated as calibration.
