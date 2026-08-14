# Domain, feasibility and responsible AI

## First target

**Recommended:** THPT students learning one bounded mathematics unit, ideally through a teacher/club the team can actually access.

Why mathematics first:

| Domain | Ground truth | Transfer tasks | Misconception evidence | Frontier baseline | First-domain verdict |
|---|---:|---:|---:|---:|---|
| Mathematics | High with symbolic/teacher verification | High for controlled near transfer | Strong but labels can overlap | Very strong | **Best** |
| Physics | High in bounded quantitative topics | Strong; authentic contexts | Moderate | Strong; Harvard result raises baseline | Good alternative |
| Chemistry | Mixed; notation/safety/labs complicate | Moderate | Moderate | Strong | Later |
| Programming/algorithms | Tests provide ground truth | Strong but code execution can mask reasoning | Moderate | Extremely strong coding agents | Interesting, baseline hard |
| English | Many outcomes subjective; mature competitors | Transfer/retention harder to bound | Varied | Strong | Reject first |
| General school learning | Inconsistent | Hard | Hard | Strong | Reject scope |

The initial user should not be “all students.” Strong or average THPT learners who already use AI and must later solve exam-style mathematics independently provide the clearest problem and measurable consequence. Struggling learners remain important, but false diagnosis and frustration risks are higher; include them only with teacher oversight and accessible design.

## Data and models

Use teacher-authored or licensed public problems, fixed skill/prerequisite tags, worked solutions, symbolic verification and synthetic error cases. Real learner data is required only for the learning-effect experiment and must be consented/minimized. Training from scratch and fine-tuning are not justified initially. Existing frontier models can interpret concise reasoning, select scaffolds and generate candidates; every scored task needs deterministic or teacher verification.

## Responsible constraints

* Never use “intelligence,” “ability,” personality or fixed learner labels.
* Never penalize a learner for using permitted help; separate assisted from independent evidence.
* Do not expose arbitrary mastery percentages or false precision.
* Allow correction/appeal when task interpretation or model diagnosis is wrong.
* Store concise observable work, not hidden chain-of-thought or unnecessary chat history.
* For minors: consent, minimal identifiers, short retention, deletion, access control and no model training/reuse by default.
* Avoid high-stakes grading; ThinkAI supplies evidence to learner/teacher.
* Monitor whether forced struggle increases anxiety or causes disengagement; “minimum help” is not “withhold help indefinitely.”

## Reliability and competition operations

A hybrid design is implied only at the capability level, not selected architecture: deterministic verification for answers/metrics; AI for varied-language reasoning and task/scaffold candidates; teacher-defined domain boundaries. Cache a verified challenge bank so a six-hour round or API outage does not depend on live generation. A single math unit is easier to modify and explain than a general learning operating system.
