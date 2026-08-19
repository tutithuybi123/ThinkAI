# Structured Output

The frozen non-authoritative schema has `summary`, `whatWasUseful`, `nextStep`, `feedbackType`, and `shouldWithholdSolution`; no score, mastery or Receipt field. Invalid JSON, missing/extra/wrong/empty/overlong values are fail-closed by `validateFeedback`; no repair result is counted as valid.

Clean matrix-v2 evidence: 200 requests over 8 requested models, 150 completed, 146 schema-valid. The variation is qualification evidence for the adapter, not a quality leaderboard. Stress evidence: 200/200 completed/schema-valid/hard-gate-clean on returned `gpt-5.4-mini-2026-03-17` with concurrency 16.
