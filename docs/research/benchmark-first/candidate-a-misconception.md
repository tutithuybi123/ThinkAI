# A — Uncertainty-aware mathematical misconception diagnosis

## Gate status

- **Data gate: CONDITIONAL.** The public competition page is reachable, but the logged-in file inventory, displayed license at access time, full competition rules, additional access conditions, and any redistribution restriction are **HUMAN VERIFICATION REQUIRED** before download, reuse, or redistribution.
- **Novelty gate: FAIL / CONDITIONAL.** Retrieval, reranking, prompting, augmentation, multi-hypothesis output, generic confidence, and generic abstention are not novel; the proposed protocol lacks a sufficient 2023–26 direct-prior-art audit to support a pass.

## Dataset: facts and unresolved details

[Eedi — Mining Misconceptions in Mathematics](https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/data) asks models to predict affinity between misconception descriptions and an incorrect multiple-choice answer (“distractor”). Eedi describes each diagnostic question as one correct answer plus three distractors and reports that its task is label ranking, not a longitudinal/student-trace diagnosis ([competition retrospective](https://www.eedi.com/news/from-wrong-answers-to-real-insights-how-we-used-a-kaggle-challenge-to-map-student-misconceptions)). The benchmark reports MAP@25; its exact official evaluation implementation is **HUMAN VERIFICATION REQUIRED** from the authenticated competition materials.

| Required fact | Recovery status |
|---|---|
| Exact downloadable filenames and columns | **HUMAN VERIFICATION REQUIRED** — inaccessible authenticated view |
| Examples/questions/taxonomy count | **HUMAN VERIFICATION REQUIRED** — do not infer from blog posts |
| Label representation | misconception-ID/descriptive-label ranking, confirmed at task level |
| Train/test labels | hidden-test labels existed for competition scoring; reproducible post-competition availability **needs verification** |
| Terms / research reuse / redistribution | **HUMAN VERIFICATION REQUIRED** |
| Attribution | **HUMAN VERIFICATION REQUIRED** |

## Closest prior art / what it already solves

| Work / source | Year / venue | Dataset/task | Method and metric | Already solves | Does not establish |
|---|---|---|---|---|---|
| [Eedi competition winners](https://www.eedi.com/news/from-wrong-answers-to-real-insights-how-we-used-a-kaggle-challenge-to-map-student-misconceptions) | 2024 retrospective | Eedi distractor→misconception ranking | Qwen retrieval/LoRA, synthetic/real examples, Claude rationales, listwise reranking; MAP@25 | retrieve–rerank, synthetic augmentation, unseen-label awareness | calibrated safety under a pre-registered held-out-label split |
| [Confidence Estimation and Calibration for LLMs](https://aclanthology.org/2024.naacl-long.366.pdf) | 2024, NAACL | LLM confidence | survey/review of calibration methods | calibration/uncertainty methods are mature | Eedi-specific OOD selective ranking |
| [Selective Prediction for Responsible Knowledge Tracing](https://arxiv.org/pdf/2509.21514) | 2025 preprint | knowledge tracing | selective prediction | abstention in educational ML | misconception-ranking evaluation or a new method |

## One falsifiable research question

**Can taxonomy-held-out selective ranking reduce high-confidence wrong misconception predictions at matched coverage, compared with BM25, dense retrieval, and a documented retrieve–rerank baseline?**

| Element | Definition |
|---|---|
| Hypothesis | calibrated selective ranking lowers accepted-set error and ECE under unseen-label shift without unacceptable Recall@25 loss |
| Independent variable | candidate-generation/reranking system and abstention rule |
| Dependent variable | risk at fixed coverage; calibration |
| Ground truth | Eedi misconception mapping |
| Baselines | BM25; dense embedding retrieval; retrieve–rerank baseline |
| Primary metric | selective risk–coverage curve under taxonomy-held-out test |
| Secondary metrics | MAP@25, Recall@k, top-1, ECE, Brier |
| Split | train/validation/test by misconception taxonomy or question/construct—not random rows |
| OOD test | labels absent from training candidate supervision |
| Ablations | hierarchy, retrieval, reranking, calibration, abstention |
| Failure analysis | confident wrong labels; unseen labels; empty/retrieval-miss cases |

## Minimum experiment / value

Download and schema audit: 1–2 hours after approval/access. CPU BM25/dense baseline: 1–3 hours. Optional local cross-encoder: 1–3 days on consumer GPU/Colab. API models are comparators only. Competition value is unproven until a targeted 2023–26 audit establishes that the protocol is not already covered. Kill A if terms prohibit use, leakage-safe split cannot be formed, or selective ranking does not beat dense retrieve–rerank on safe accepted-set performance.
