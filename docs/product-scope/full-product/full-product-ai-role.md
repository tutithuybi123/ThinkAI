# Full Product AI role

AI is useful for bounded semantic work, never for authoritative educational truth.

| Capability | Need / I-O | Authority and validation | Evidence/privacy/failure |
|---|---|---|---|
| Reasoning feedback | bounded learner explanation + deterministic result → concise Vietnamese feedback | non-authoritative JSON schema; cannot change score/state/receipt | provider/model/prompt version log; redact/minimise text; reviewed fallback on timeout/malformed output |
| Reviewed-hint choice | learner state + allow-listed reviewed hint IDs → one ID/rationale | selection validated against allow-list; fixed hint fallback | log choice; no generated hint body |
| Next-action phrasing | event-derived summary → learner-language wording | cannot select unavailable task/policy | fall back to deterministic copy |
| Candidate content | teacher request → candidate hint/task | offline, human-reviewed before content repository | no learner data; never ground truth |
| Hypothesis/summaries | bounded evidence → abstaining teacher-facing hypothesis | never a learner label or automatic intervention | preserve uncertainty/correction path |

AI must not be sole authority for deterministic mathematical correctness, pair equivalence, receipt eligibility, permanent labels, mastery probabilities or misconception truth. Transfer context excludes practice answers, hint bodies, solution, feedback, audit history and unrevealed mappings.
