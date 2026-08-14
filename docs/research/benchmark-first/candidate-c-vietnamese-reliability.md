# C — Vietnamese LLM hallucination / reliability detection

**Status: BORDERLINE.**

Generic hallucination detection is saturated by work such as [HaluEval](https://github.com/RUCAIBox/HaluEval) and [SelfCheckGPT](https://github.com/potsawee/selfcheckgpt). ViHallu was reported by the Phase-3 reviewer as a 2026 arXiv preprint with response-level Vietnamese triples; its primary dataset download remains **UNAVAILABLE / NEEDS RE-VERIFICATION**.

Only a claim-level evidence-attribution/localization detector under noisy or adversarial Vietnamese context could be distinct. Baselines: Vietnamese/multilingual NLI; BM25/dense retrieval plus entailment; controlled judge comparator. Metrics: claim F1, evidence attribution, AUROC/AUPRC, ECE/Brier, risk–coverage. Kill if a lawful download, evidence spans, frozen OOD split, or a gap beyond existing calibration/grounding work cannot be verified. Interview dependency: **NONE/LOW**.
