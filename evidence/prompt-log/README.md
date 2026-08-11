# Canonical Prompt Log System

This directory contains public, normalized, append-only prompt logs for **THINKAI KIDS**.

---

## 1. Rules & Standards

- **Canonical Format**: Session JSONL files under `evidence/prompt-log/sessions/*.jsonl`.
- **Append-Only Policy**: Canonical JSONL files are **STRICTLY APPEND-ONLY**. Records are never edited or rewritten.
- **Corrections**: If a correction is needed, append a new superseding record referencing the original `prompt_id`.
- **Session Completion**: `close-session` appends a closing session summary record; it does not alter prior lines.
- **Privacy Safety**: Public records contain normalized prompt text, metadata, tool usages, file changes, and SHA-256 hashes. Full un-redacted raw logs stay inside `evidence/private/`.

---

## 2. Derived Files

- `index.csv`: Generated index overview produced by `tools/prompt-log/export-index.ps1`.
- `schema.json`: JSON Schema (v1) validating record structures.
