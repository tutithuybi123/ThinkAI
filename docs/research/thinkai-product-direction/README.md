# ThinkAI product direction: learning that survives without AI

**Status:** product discovery for human review. No MVP, architecture, or final project has been selected.

## Executive finding

ThinkAI should not become a general AI tutor, a “Learning Twin,” or a visible personalized curriculum map. Those elements are either commodity or too easy to overclaim. The strongest problem is narrower and newly urgent:

> **AI-assisted success can look like learning even when the learner cannot solve a related problem independently later.**

The strongest current direction is a **Proof-of-Learning Challenge System** for secondary-school mathematics. The system allows carefully metered assistance during learning, records how much cognitive work the learner actually performed, and then schedules short, AI-free “independence trials” using new near-transfer and delayed-retrieval tasks. A learner state changes only when evidence changes.

Its signature is not an explanation or dashboard. It is the moment ThinkAI says: **“You solved it with help. Now prove what stayed.”**

This is a demanding frontier baseline: Google now reports a preregistered 2026 Guided Learning mathematics RCT with 1,763 Sierra Leone students and improved outcomes ([official LearnLM research page](https://cloud.google.com/solutions/learnlm)). ThinkAI therefore cannot win by merely adding pedagogical prompts; it must show that assistance-aware independent trials classify or improve learning beyond a strong guided tutor.

## Why this direction survives

A 2025 high-school mathematics field experiment found that unrestricted GPT access greatly improved assisted practice performance but produced 17% worse unaided exam performance than control; a guarded tutor removed the harm but did not produce a positive unaided effect ([Bastani et al., PNAS](https://doi.org/10.1073/pnas.2422633122)). Conversely, a short 2025 Harvard physics RCT found a carefully designed AI tutor produced larger immediate learning gains than an active-learning class ([Kestin et al.](https://doi.org/10.1038/s41598-025-97652-6)). Together, these studies do not prove ThinkAI. They show that product behavior and measurement matter—and that frontier model quality alone is not the outcome.

## Recommended portfolio

1. **Best current direction:** Proof-of-Learning Challenge System—assistance ledger, fading support, independent near-transfer and delayed retrieval.
2. **Best alternative:** Teacher-Connected Intervention Lab—diagnose a bounded error, test competing teacher-approved interventions, then measure which one improves independent transfer.
3. **Most interesting high-risk direction:** Transfer Quest—a challenge/game world where the same mathematical principle must be rediscovered across changing contexts; progression depends on unassisted transfer, not points.

Read [problem evidence](problem-and-principles.md), [product forms](product-forms.md), [direction options](direction-options.md), [learner model](learner-model-and-adaptation.md), [prior art](prior-art.md), [evaluation](evaluation-and-next-test.md), [competition fit](competition-fit.md), and [final recommendation](final-recommendation.md).

## Evidence posture

* **FACT/EVIDENCE:** directly supported by a cited source.
* **INFERENCE:** a bounded product conclusion drawn from evidence.
* **HYPOTHESIS:** must be tested before product claims.
* Vendor pages establish features, not efficacy.
* No user study or new learning experiment was performed in this pass.
* No official Bảng B 2026 rulebook was found in the repository; competition analysis uses the criteria provided in project prompts and is not presented as an official rubric interpretation.
