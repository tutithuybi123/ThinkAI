# Prior-art attack

## Candidate B

| Prior art | What it already provides | Remaining structural gap |
|---|---|---|
| [Turnitin AI detection](https://guides.turnitin.com/hc/en-us/articles/28294949544717-AI-writing-detection-model) | AI-writing indicator with explicit false-positive precautions | Detects writing patterns, not whether a conclusion follows from the learner's experiment; cannot be ground truth for misconduct. |
| Generic LLM/rubric feedback | Fast prose, structure and reasoning suggestions | Often judges only the report text and can invent scientific support. |
| Scientific claim verification | Claim/evidence retrieval and entailment; OECD notes rapid progress | OECD also reports scientific discourse and realistic deployment remain difficult; most systems search publications, not a student's bounded raw evidence. |
| q.e.d Science / manuscript-review category | Commercial claim/evidence and manuscript stress testing (vendor claims) | Research-paper audience and external literature; not school experiment evidence or learner repair. |

Closest category: scientific manuscript claim/evidence review. Closest widely recognized education product: Turnitin, but B intentionally rejects authorship detection. B's reason to exist is a different adjudication object—**evidence fidelity** rather than provenance or writing quality.

Kill B if a generic multimodal frontier model with a calculation tool matches teacher labels and produces an equally clear evidence map, or if structured lab templates/checklists deliver at least 80–90% of the measured value.

## Candidate C

| Prior art | What it already provides | Remaining structural gap |
|---|---|---|
| [Google Fact Check Explorer/API](https://toolbox.google.com/factcheck/apis) | Search across already-published ClaimReview fact checks | New local claims may have no fact check; no crisis-specific time/location safety contract. |
| [CrisisFACTS](https://crisisfacts.github.io/) | TREC disaster temporal summarization, multimodal data and gold fact lists | Designed for responder summaries, not one-message user-facing authoritative evidence triage. |
| [DisFact](https://par.nsf.gov/servlets/purl/10578794) | Disaster claim verification against FEMA documents; reported 40K+ generated pairs | Research benchmark, primarily text/US/FEMA, not verified Vietnamese community workflow. |
| General grounded chat/search | Extracts and searches claims conversationally | Can hide source/time mismatch and answer beyond evidence unless tightly constrained. |

Closest competitor: Google Fact Check Explorer for public use; CrisisFACTS/DisFact technically. C exists only if its fixed source policy, claim atomization, temporal/geographic validation and safe `not confirmed` state outperform ordinary search.

Kill C if clean official-site search matches its performance, if authoritative coverage is too delayed for the chosen use case, or if users systematically interpret uncertainty as reassurance.

## Frontier-model attack

Both ideas can be prototyped with existing multimodal models; that fact weakens novelty but improves feasibility. Neither may claim model orchestration as innovation. The contribution must be the verifiable task contract, held-out evaluation, evidence exposure and calibrated failure behavior. If those do not change decisions or reduce error versus simple baselines, the ideas should die.
