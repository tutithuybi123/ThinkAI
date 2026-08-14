# Candidate B — Evidence-Bound Lab Report

### The problem

Students can now produce polished scientific explanations and lab reports that outrun what their experiment actually showed. Teachers must determine whether each conclusion follows from messy observations, tables, charts, methods and uncertainty—not merely whether the prose sounds scientific. If unsupported claims pass as success, students learn presentation without evidence-based reasoning and teachers lose a trustworthy view of experimental understanding.

### Who experiences it

Secondary/high-school science students and teachers running bounded classroom experiments with known procedures, expected variables and teacher rubrics.

### Why current solutions are insufficient

Rubrics check structure; plagiarism/AI detectors estimate writing origin; generic LLM feedback improves prose. None makes authorship the target here. Turnitin explicitly says its AI indicator does not determine misconduct and requires professional judgment ([official statement](https://www.turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities)). Scientific claim-verification research has advanced but still faces realistic evidence and uncertainty challenges ([OECD review](https://www.oecd.org/en/publications/artificial-intelligence-in-science_a8d820bd-en/full-report/using-machine-learning-to-verify-scientific-claims_a7f2d5e8.html)).

### The idea

The system receives the learner's original evidence package—photos/scans of observations, measurements/table, method, chart and draft report. It creates a reviewable map from each conclusion to supporting or contradicting experiment evidence, recomputes simple quantities, flags missing uncertainty or evidence, and asks the learner to repair the reasoning. It never labels text “AI-written” and never writes the conclusion for them.

### Why AI is necessary

Classroom evidence is heterogeneous and messy: handwriting, tables, plots, photos and varied natural-language claims. Fixed forms and formulas handle clean numbers but cannot realistically align every paraphrased claim to the relevant multimodal evidence. AI performs extraction and semantic matching; deterministic calculations and the experiment specification verify what can be verified.

### What makes it different

Closest categories are Turnitin (authorship/integrity signal), generic rubric-feedback tools, and scientific claim-verification systems. The structural difference is **closed-world personal evidence**: the question is not “Who wrote this?” or “Is this scientifically true on the internet?” but “Does this student's conclusion follow from this student's recorded experiment?”

### Example user flow

A student uploads a pendulum table and report claiming that doubling length doubles period. The system links the sentence to the relevant rows, recomputes ratios with a visible formula, shows that the measurements do not support “doubles,” notes missing repeated trials, and asks the student to revise the claim. The teacher sees the original evidence, extraction confidence and revision—not an opaque grade.

### 3-minute demo

Show two visually similar polished reports based on the same fixed dataset: one conclusion is supported, one overclaims. Input a photo/table plus report; AI extracts the claim and evidence; a deterministic calculation verifies the mismatch; the student revises; the evidence map turns from “unsupported” to “bounded by data.” Then show one unreadable cell being escalated rather than guessed.

### How we prove it works

Create 60–100 synthetic or teacher-authored cases across 3–5 simple experiments with deliberately supported, contradicted and insufficient-evidence claims. Teachers label claim–evidence links and dispositions. On held-out cases measure extraction accuracy, link precision/recall/F1, disposition accuracy, calculation agreement, abstention calibration and false-accusation rate. Compare against a rubric checklist and a generic frontier LLM given the same artifacts. A later small study tests whether students make more evidence-faithful revisions without receiving the answer.

### Data/setup needed

No child data is needed initially. Use public experiment protocols plus synthetic tables/reports and teacher-authored variants; licensing must be recorded. Validation needs one or two science teachers for rubric and label agreement, ordinary document photos, and no special hardware. Existing OCR/VLM/LLM APIs can perform extraction; training from scratch is unnecessary.

### Biggest risks

* Scope may collapse into generic document feedback if the closed-world evidence contract is weakened.
* OCR/table extraction errors could falsely challenge a correct learner.
* Only narrow experiments have defensible ground truth; open-ended investigations are much harder.
* Teacher-authored synthetic cases may not represent real classroom messiness.
* A checklist/spreadsheet may win on sufficiently structured labs.

### Competition potential

**8/10 (inference).** Strong one-sentence problem, visible AI necessity, objective evidence and an excellent failure-aware demo. It loses points because local user need, teacher access and multimodal reliability remain unvalidated, and it is adjacent to Candidate A's assisted-performance concern.

**Recommendation: KEEP FOR VALIDATION.**
