# Learner model, diagnosis, prediction and paths

## Reject the “Learning Twin” framing

“Digital twin” suggests a high-fidelity predictive replica. Student knowledge is latent, contextual and changed by testing itself. A single correct answer may be luck; a wrong answer may be carelessness; assistance changes interpretation. Recent uncertainty-aware knowledge-tracing research explicitly separates uncertainty sources such as knowledge uncertainty, careless errors and guesses ([AAAI 2025](https://ojs.aaai.org/index.php/AAAI/article/view/35007/37162)). Calling the result a twin would overstate validity.

Use **Learning Evidence Ledger** instead.

## Store

For each bounded skill hypothesis:

* task/version and skill tags;
* response and observable reasoning artifact;
* correctness and verifier source;
* assistance level and exact hints/tools exposed;
* same-item versus near-transfer versus delayed-retrieval context;
* timestamp/recency;
* evidence that supports or contradicts the claim;
* uncertainty and next discriminating test;
* intervention tried and subsequent independent outcome.

## Do not store or infer

Do not infer intelligence, motivation, personality, learning style, confidence, diligence, disability, future grades, or “82% risk of falling behind.” Do not treat time-on-task as effort without context. Avoid raw chain-of-thought; accept concise work steps or answer artifacts. Minimize child data and set deletion/retention controls.

## Knowledge representation

A small teacher-approved concept/prerequisite graph is useful as a task index, not a psychological truth. Maintain states such as:

* **not tested**;
* **evidence conflicting**;
* **assisted only**;
* **independent on familiar form**;
* **independent near transfer**;
* **retained after delay**;
* **currently fragile**.

Misconceptions should be hypotheses with evidence and an alternative explanation, never identity labels. The system should ask a discriminating item before choosing an intervention when uncertainty is consequential.

## Defensible prediction

Predict the outcome of a specific next task, not the student's future. Examples:

* “Evidence is insufficient to predict independent success on a two-step equation; test now.”
* “Success occurred only with a denominator cue; schedule a cue-free variant.”
* “This skill has not been retrieved in 14 days; revisit before the dependent topic.”

Evaluate predictions with Brier score/calibration, not impressive-looking percentages. Prediction exists only to select an action: test, review, fade help, or proceed.

## Adaptive path

The path should usually be invisible. The learner sees the next meaningful challenge and why it was chosen. Internally, choose among a few teacher-approved policies:

1. diagnose the smallest uncertain prerequisite;
2. select one intervention;
3. require learner action;
4. verify independently;
5. revisit fragile evidence later.

This is closer to sequential experimentation than “generate a curriculum.” Personalization is only earned when an intervention produces better subsequent independent performance than the baseline policy.
