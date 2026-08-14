# The learning problem and product principles

## What is actually broken

The sharpest failure is not that frontier AI explains poorly. It is that the interface optimizes the wrong observable: completion while help is available.

**EVIDENCE:** In the Bastani et al. high-school mathematics experiment, unrestricted GPT improved assisted practice grades by 48%, yet learners scored 17% worse than control when AI was removed. The guarded tutor improved practice even more, while unaided exam performance was statistically indistinguishable from control—not better ([PNAS](https://doi.org/10.1073/pnas.2422633122)). This is one context, not a universal effect, but it directly establishes a possible assisted-performance/learning gap.

**COUNTER-EVIDENCE:** A randomized crossover trial with 194 Harvard physics students found a carefully scaffolded AI tutor produced more than twice the immediate learning gains of an active-learning class in less time ([Scientific Reports](https://doi.org/10.1038/s41598-025-97652-6)). The study was short, university-level, content-rich and purpose-designed; it does not establish long-term retention or broad deployment effects.

The combined lesson is not “AI harms learning” or “AI tutors beat teachers.” It is: **learning must be measured after the assistance condition changes**, and pedagogy cannot be delegated to a model's default helpfulness.

## Problems ranked

| Problem | Evidence | Product importance | Decision |
|---|---|---:|---|
| Assisted success is mistaken for independent capability | Direct recent field evidence | Very high | Core problem |
| Learners become dependent on hints/solutions | Supported as a mechanism in the PNAS study; generality uncertain | High | Track assistance and fade it |
| Explanations create an illusion of understanding | Plausible learning-science concern; not independently quantified here | Medium | Never use self-report as mastery |
| Misconceptions persist | Well-established instructional problem; automated fine-grained diagnosis is unreliable in the repository's frontier test | Medium | Test hypotheses; do not assert labels |
| Forgetting over time | Strong spacing/retrieval literature | High | Delayed retrieval is part of the loop |
| Far transfer fails | Transfer is difficult and task-dependent | High | Start with near transfer, label distance |

Retrieval practice has a positive average transfer effect relative to re-exposure in a meta-analysis of 122 experiments, but moderators matter and effects are not automatic ([Pan & Rickard](https://pubmed.ncbi.nlm.nih.gov/29733621/)). Spaced retrieval evidence supports revisiting learning over time, including STEM settings ([Latimier et al.](https://doi.org/10.1186/s40594-024-00468-5)). Self-explanation and productive failure are useful mechanisms, not universal prescriptions ([Bisra et al.](https://doi.org/10.1007/s10648-018-9434-x); [Kapur](https://doi.org/10.1080/07370000802212669)).

## Principles with product consequences

### 1. Assistance is a condition, not evidence of mastery

Consequence: every task records help level. A fully scaffolded solution may be learning evidence, but not independent-mastery evidence.

### 2. A learner claim must be falsifiable

Consequence: “likely fragile on linear equations” must link to tasks and schedule a discriminating challenge. If the challenge contradicts the claim, the model updates.

### 3. Use the minimum help that restarts productive work

Consequence: help escalates from prompt → cue → partial structure → worked step; the learner acts between steps. This is a policy to test, not an assumed universal optimum.

### 4. Mastery requires a new context and a later return

Consequence: exact repetition proves recall of the item. ThinkAI separately records same-format success, near transfer, and delayed retrieval. Far transfer is not promised.

### 5. Difficulty must serve diagnosis or learning

Consequence: every challenge has a reason—discriminate two hypotheses, retrieve a fragile skill, or transfer a principle. No decorative difficulty or punitive streaks.

### 6. Personalization must beat a sensible fixed policy

Consequence: “adaptive” is not a feature claim. The product compares its chosen intervention against teacher/static alternatives and records outcome differences.

### 7. The learner should produce the decisive evidence

Consequence: the signature interaction is solve, predict, explain, compare, correct, or teach back—not read an AI response.
