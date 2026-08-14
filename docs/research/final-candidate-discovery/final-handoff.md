# Final handoff

## Candidate B

**One sentence:** Evidence-Bound Lab Report checks whether a student's scientific conclusions are supported by their own observations, measurements and method, then exposes the exact evidence or gap.

Strongest reason it matters: GenAI can make unsupported reasoning look polished, while teachers need evidence of scientific reasoning rather than authorship guesses. Closest category: scientific manuscript claim-verification and Turnitin; the genuine difference is closed-world student-experiment evidence. Biggest kill reason: structured forms/checklists or a generic multimodal model may already provide most value. Data/setup: relatively easy—synthetic/teacher-authored cases, 3–5 bounded experiments, and teacher labels. Demo: exceptionally clear table/photo → claim link → deterministic contradiction → learner repair.

## Candidate C

**One sentence:** Crisis Claim-to-Source Triage maps a forwarded screenshot, message or voice note to dated, location-scoped authoritative evidence—or says confirmation was not found.

Strongest reason it matters: during emergencies, plausible but stale or misplaced claims can change real decisions. Closest public competitor: Google Fact Check Explorer; closest research systems: CrisisFACTS and DisFact. The genuine difference is crisis-specific claim atomization plus temporal/location/source boundaries and a safe `not confirmed` state. Biggest kill reason: authoritative information may arrive late, and errors or misunderstood uncertainty can cause harm. Data/setup: moderate to hard—public English benchmarks exist, but Vietnamese official archives, translations and operational user validation are needed. Demo: powerful on frozen historical cases, but must visibly include an ambiguous failure.

## Ranking

1. **A — STRONG FINALIST:** strongest reason to exist and broadest newly AI-created problem.
2. **B — KEEP FOR VALIDATION:** strongest challenger, easiest objective technical test, highest chance of producing honest benchmark evidence.
3. **C — KEEP FOR VALIDATION:** strongest public-safety consequence, but highest operational and responsible-AI risk.

Only Candidate A currently deserves `STRONG FINALIST`. B could earn that status after beating a checklist and a generic frontier multimodal baseline on held-out teacher labels. C requires both benchmark success and evidence that users interpret uncertainty safely.
