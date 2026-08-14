# Competitor and prior-art red team

## Bottom line

No source reviewed establishes that ThinkAI’s exact end-to-end sequence is absent from all products. Conversely, no source establishes that any named product already records semantic assistance exposure, administers teacher-validated near-transfer tasks isolated from the earlier solution, and maintains an inspectable contradictory-evidence ledger over delay. Therefore **novelty is unproven, not proven**.

| System | Documented overlap | What is not established by the checked source | Threat |
|---|---|---|---|
| ChatGPT Study Mode | interactive, question-led study support and checks; a strong model can generate quizzes/tasks in one session ([official page](https://help.openai.com/en/articles/11391654-chatgpt-business-release-notes)) | durable controlled help ledger, validated transfer pairing, delayed evidence model | High: recreates tutor, hint, quiz, explanation, reminder with prompt plus external calendar |
| Gemini Guided Learning | guided, step-by-step learning experience ([official announcement](https://blog.google/products-and-platforms/products/education/guided-learning)) | the proposed evidence contract and independent delayed transfer workflow | High: removes any claim that guided pedagogy is novel |
| Khanmigo | Socratic tutoring/answer withholding and education deployment ([official page](https://www.khanacademy.org/khan-labs)) | audited semantic hint exposure and a retained-evidence ledger | High: very close learner-facing tutor positioning |
| ALEKS | adaptive assessment/knowledge space and periodic reassessment ([research](https://www.aleks.com/about_aleks/research_behind), [workflow](https://www.aleks.com/about_aleks/HowALEKSWorks_TextDescription)) | generative-assistance metering and explicit near-transfer proof | High: invalidates “adaptive assessment + delayed checking” as differentiation |
| Duolingo/adaptive systems | practice progression, review, levels, feedback | no conclusion from this review on equivalent assistance protocol | Medium: invalidates generic game/progression claims |
| Knowledge tracing/competency systems | probabilistic mastery estimates, evidence aggregation, interventions | evidence states are not inherently new merely because they are transparent | Medium-high |

## Capability decomposition: prompt versus product

| Capability | Strong tutor prompt can do it? | Small system required? | Defensible residue |
|---|---:|---:|---|
| Ask for an attempt, give Socratic hints, withhold answer | yes | no | none |
| Generate another similar/new question | yes | no | none unless task validity is externally audited |
| Say “prove it” / show level animation | yes | no | naming only |
| Remember recent chat help | partly | yes for persistence | weak; a chat memory can approximate it |
| Record a coarse help level | partly | yes for consistent logging | useful instrumentation, not moat |
| Measure semantic information revealed | no, not reliably | yes plus rubric/human auditing | potentially meaningful but hard |
| Prevent solution/task leakage | not reliably | yes: separated sessions, task versioning, access control | genuine system requirement |
| Serve pre-validated isomorphic/near-transfer item pairs | no | yes: curated bank + metadata + teacher review | strongest MVP residue |
| Schedule and preserve delayed independent evidence | reminder can approximate | yes: identity, controlled conditions, audit trail | moderate residue |
| Update transparent evidence with contradiction rules | prompt can narrate | yes: deterministic policy/version history | useful but ordinary product engineering |

**80–90% answer:** yes, a frontier model plus a tutoring prompt, quiz generator, and reminder can reproduce most of the perceived session. What remains is not AI brilliance; it is **quality-controlled task design, isolation, durable provenance, and calibrated claims**. That is a valid product system only if it yields a decision users value.

## Prior-art consequence

Do not claim invention of hints, retrieval, transfer, adaptive progression, mastery tracking, or delayed review. The potentially distinct claim is narrower: “For AI-assisted work in this bounded skill, ThinkAI reports only the evidence observed under named assistance and independent task conditions.” That is a method/contract, not a protected moat. Its proof must be predictive validity and user adoption.
