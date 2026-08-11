# Antigravity Importer Adapter Boundary

This directory hosts the importer adapter for Antigravity conversation transcripts stored under `<appDataDir>\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`.

---

## Adapter Boundary Contract

- Extracts user input prompts and assistant responses from Antigravity transcript logs.
- Normalizes records into append-only JSONL files in `evidence/prompt-log/sessions/`.
- Preserves raw transcripts in `evidence/private/raw-transcripts/antigravity/`.
