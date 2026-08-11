# Codex Importer Adapter Boundary

This directory will host the importer adapter for OpenAI Codex CLI session rollout logs (`~/.codex/sessions` / `logs_2.sqlite`).

---

## Adapter Boundary Contract

- Reads completed Codex CLI rollout threads.
- Extracts prompt turns, model parameters, and visible AI response summaries.
- Normalizes records into append-only JSONL files under `evidence/prompt-log/sessions/`.
- Stores original un-redacted rollout JSON files in `evidence/private/raw-transcripts/codex/`.
