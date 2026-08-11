# Buzz Importer Adapter Boundary

This directory will host the importer adapter for Buzz / `codex-acp` prompt session logs when verified API/hook interfaces become available.

---

## Adapter Boundary Contract

When Buzz integration hooks are connected:
- Reads incoming user request messages and visible AI agent responses.
- Generates normalized JSONL prompt records using `tools/prompt-log/promptlog.ps1`.
- Preserves full un-redacted raw messages in `evidence/private/raw-transcripts/buzz/`.
- Computes SHA-256 raw source checksums and references them in normalized records.
