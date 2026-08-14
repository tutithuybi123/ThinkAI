# Proving learning and the next experiment

## Measurement hierarchy

| Outcome | Meaning | Use |
|---|---|---|
| Assisted task success | Can finish with current help | Product telemetry, never mastery |
| Help efficiency | How much/what type of help preceded success | Dependency/fading evidence |
| Immediate independent same-format | Can reproduce familiar procedure | Weak mastery evidence |
| Immediate independent near transfer | Can apply principle in changed surface/representation | Primary MVP learning outcome |
| Delayed independent retrieval | Can retrieve/apply after time | Primary durability outcome |
| Far transfer | Can apply in substantially different domain | Research outcome; do not promise early |

Also measure misconception persistence, time to independent success, calibration of next-task predictions, false-mastery rate and student dropout/frustration. Satisfaction is secondary.

## Single most important experiment

Run a small randomized **frontier guarded tutor vs ThinkAI proof loop** experiment in one bounded THPT mathematics skill.

### Participants and scope

Target 30–60 consented learners if access permits; if not, first run a technical/teacher-labelled task study and do not claim learning outcomes. Choose one skill with prerequisites and many equivalent/transfer items—for example linear equations or proportional reasoning. Use teacher-reviewed items and a predeclared split.

### Conditions

* **Baseline:** the same frontier model, content and answer key, using a strong pedagogical prompt that asks questions and gives incremental hints.
* **ThinkAI:** identical model/content plus mandatory initial attempt, metered help, assistance ledger, cue fading, an immediate unseen near-transfer item, and a delayed independent item 3–7 days later.

Do not compare against unrestricted ChatGPT alone; that would manufacture an easy win.

### Outcomes

Primary: delayed independent near-transfer accuracy. Secondary: immediate near-transfer, assistance required on the next item, time, dropout, and calibration of ThinkAI's fragile/mastered predictions. Predefine item equivalence, scoring and missing-data policy. Evaluators must not see condition or tutoring transcript.

### Decision rule

Proceed to MVP scoping only if the loop is operationally usable and shows a practically meaningful improvement or clearly more accurate mastery classification than the guarded-tutor baseline. If it merely increases friction or repeats quizzing without better evidence/action, reframe or kill it.

## Technical evaluation before users

* Generate task variants, then have a symbolic solver/teacher verify answer, skill and transfer relation.
* Measure LLM diagnosis against held-out teacher labels, with abstention and calibration.
* Audit leakage: verification tasks must not expose training answers or reuse surface templates.
* Test evaluator independence: tutoring context is withheld except the declared assistance summary.
* Repeat model calls to quantify task-generation and diagnosis stability.

## Existing repository warning

The repository's oracle-25 misconception experiment found 67.3% forced-choice accuracy and many high-confidence errors from a strong reasoning model. It is not a learner study, but it is direct evidence that ThinkAI must not turn an LLM's plausible misconception label into ground truth.
