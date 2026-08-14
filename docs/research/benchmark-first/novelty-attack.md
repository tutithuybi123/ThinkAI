# Novelty attack

## A — misconception diagnosis

- **Closest prior art:** Eedi's official [winner retrospective](https://www.eedi.com/news/from-wrong-answers-to-real-insights-how-we-used-a-kaggle-challenge-to-map-student-misconceptions) documents Qwen retrieval/LoRA, synthetic augmentation, generated rationales, and listwise reranking for the competition's misconception-ranking task. General calibration/selective-prediction research exists, but this recovery did not complete a direct 2023–26 misconception-specific audit sufficient to establish a gap.
- **Methods already common:** lexical and dense retrieval, cross-encoder reranking, retrieval augmentation, multi-hypothesis prompting, self-consistency, generic confidence calibration, selective prediction, abstention, and conformal methods.
- **What is not novel:** combining any of those components, or showing ranked labels in an educational UI.
- **Potentially defensible research gap:** a pre-registered taxonomy-/construct-held-out evaluation in which every method is evaluated at matched coverage. The only claim would be that a particular policy lowers accepted-set wrong-diagnosis risk relative to BM25, dense retrieval, and a documented retrieve–rerank baseline.
- **Strongest novelty objection:** this may be only a recombination of mature components. The claim fails without a direct recent task-specific novelty audit, and Eedi licence/schema/split uncertainty can prevent reproducibility.
- **Novelty status: CONDITIONAL.**

## B — semantic accessibility auditing

- **Closest prior art:** PDF validators and an existing rule/LLM/VLM/hybrid PDF accessibility benchmark.
- **Methods already common:** rules, layout parsing, VLM inspection, hybrid checking, reading-order analysis.
- **What is not novel:** a generic hybrid document checker.
- **Potentially defensible research gap:** none recovered with distinct, lawful expert semantic-accessibility ground truth.
- **Strongest novelty objection:** the benchmark and commercial tools directly overlap while end-outcome labels remain inadequate.
- **Novelty status: ELIMINATED.**

## C — Vietnamese LLM reliability

- **Closest prior art:** HaluEval, SelfCheckGPT, and unverified Vietnamese reliability benchmark work.
- **Methods already common:** response classifiers, LLM judging, generic NLI, retrieval grounding, calibration.
- **What is not novel:** another Vietnamese hallucination classifier or a chat interface around it.
- **Potentially defensible research gap:** claim-level evidence attribution under frozen noisy/OOD Vietnamese evidence, but only if a lawful dataset exposes claim/evidence labels.
- **Strongest novelty objection:** ViHallu data/card/licence and overlap with that exact evaluation were not verified.
- **Novelty status: WEAK.**

## D — environmental sensor AI

- **Closest prior art:** [in-field calibration transfer](https://zhouzimu.github.io/paper/ubicomp19-cheng.pdf), AQ-SPEC [data-adjustment guidance](https://www.aqmd.gov/docs/default-source/aq-spec/resources-page/air-quality-sensors-and-data-adjustment-algorithms.pdf), and established transfer/calibration literature.
- **Methods already common:** linear and ML calibration, RF/XGBoost, domain/site/device transfer, uncertainty intervals, conformal prediction, drift/anomaly detection, and abstention.
- **What is not novel:** any one of those methods or their untested combination.
- **Potentially defensible research gap:** none for AQ-SPEC+AQS. A future paired dataset could at most support a tightly scoped blocked-split robustness evaluation.
- **Strongest novelty objection:** the proposed sources have not yielded a lawful paired raw benchmark, and the method family is already mature.
- **Novelty status: ELIMINATED.**
