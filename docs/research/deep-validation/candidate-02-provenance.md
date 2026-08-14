# Candidate 02 — Auditable school/community information provenance

**Status: BORDERLINE.** Recast from “fact-checker” to source/provenance ledger or eliminate.

## Evidence and root cause

Global research establishes misinformation/correction complexity ([Lazer et al., 2018](https://doi.org/10.1126/science.aao2998); [Yu et al., 2022](https://doi.org/10.1177/14614448221116569)); correction evidence is conditional ([Guess et al., 2020](https://doi.org/10.1073/pnas.1920498117), [Nyhan & Reifler](https://doi.org/10.1007/s11109-010-9112-2), [Wood & Porter](https://doi.org/10.1007/s11109-018-9443-y)). No adequate Vietnam school/community prevalence evidence was found. Root cause may be governance/communication, not missing software.

Prior art: Google Fact Check Explorer/Markup, ClaimReview, Data Commons, Full Fact, Meedan, Logically, ClaimBuster, ClaimsKG, FactCheck Insights, NewsGuard, Ground News, InVID-WeVerify. Dataset: [ClaimReview download](https://www.datacommons.org/factcheck/download), compiled metadata CC-BY but article rights retained; [ClaimsKG](https://data.gesis.org/claimskg/), 74,066 claims/72,128 reviews, research-only; both are nonrepresentative and weak for Vietnamese school notices.

## Test and kill condition

Non-AI: URL, issuer, timestamp, archive hash, source-type ledger. AI: claim/source extraction, retrieval, conflict/missing-source flagging—never truth verdicts. Evaluate on a manually verified bounded corpus: provenance-field extraction/retrieval precision/recall, abstention, audit time; compare structured rules. **AI necessity 5/10.**

Eliminate if interviews do not show recurring consequential provenance failures or if rules achieve the required result. Local questions: last conflicting notice; source checked; frequency; consequence; current confirmation pathway. Privacy low for public notices; technical risk high around false authority.
