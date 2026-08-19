# Demo AI role

> **Status: Historical v1.0 AI-role contract.** v1.1 current AI boundaries are in `competition-demo-v1.1-amendment.md`, `v1.1-amendment-contracts.md`, and ADR-011.

## P0 call: `reasoningFeedback`

After a learner submits optional bounded reasoning and receives a deterministic practice score, the server sends only this field-level allow-list: `practiceProblemPrompt` (display text without answer specification), `learningObjective` (reviewed public objective), `learnerReasoning` (bounded), `scoreOutcome`, `scoreReasonCode`, and `copyObjective` (allow-listed feedback intent). It receives strict JSON `{message, encouragement?, suggestedFocus?}`. The response is length-limited, schema-validated, labelled `Phản hồi AI`, and logged with provider/model/prompt-template version and request outcome.

It cannot receive or return answer specifications/keys, transfer task/content/mapping, hint body or tags, solution, event/audit history, receipt data, state instruction or any authority signal. It is not called during pre-score transfer. A timeout, malformed response or provider error returns an explicit `AI_UNAVAILABLE` feedback state and reviewed/deterministic guidance; authoritative flow still continues. No credential, prompt body or learner reasoning is exposed to the browser or normal prompt log.

This requires a real provider credential and a provider/model choice. Until supplied, live AI P0 is **BLOCKED BY EXTERNAL SERVICE**; a stub belongs only in automated tests and is never presented as live AI.
