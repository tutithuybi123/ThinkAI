# Differential Testing

`gpt-5.6`, `gpt-5.6-sol`, `gpt-5.6-luna`, and `gpt-5.6-terra` were included in the 200-call matrix, alongside protocol-family models. The harness survived different returned model IDs, 50 normalized request failures, missing reasoning telemetry, and schema variance without a parser crash. Codex results are qualification-only and must never enter the OpenRouter ranking.

## Matrix-v3 failure forensics

All 50 non-completed calls were normalized `requestStatus: error`, `schemaStatus: not_run`, and none was counted as schema-valid or success. They divide exactly into 25 requests for `gpt-5.2` and 25 for `gpt-5.3-codex-spark`, all `reasoningEffort: high`, all HTTP 503 after the bounded single-attempt policy. There were 200 unique run IDs and zero duplicate groups. The same failure shape by requested model, absence of parser exceptions, and preserved HTTP status indicate reference-backend availability/incompatibility rather than a parser, concurrency, or retry conversion bug. They are retained as normalized transport failures and excluded from success metrics.
