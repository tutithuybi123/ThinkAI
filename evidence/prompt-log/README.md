# Canonical Prompt Log System

This directory contains public, normalized, append-only prompt logs for **THINKAI KIDS**.

---

## 1. Rules & Standards

- **Canonical Format**: Session JSONL files under `evidence/prompt-log/sessions/*.jsonl`.
- **Append-Only Policy**: Canonical JSONL files are **STRICTLY APPEND-ONLY**. Records are never edited or rewritten.
- **Corrections**: If a correction is needed, append a new superseding record referencing the original `prompt_id`.
- **Session Completion**: `close-session` appends a closing session summary record; it does not alter prior lines.
- **Privacy Safety**: Public records contain normalized prompt text, metadata, tool usages, file changes, and SHA-256 hashes. Full un-redacted raw logs stay inside `evidence/private/`.

## Codex automatic capture

`UserPromptSubmit` runs the existing Beads hook and a sibling Codex evidence hook. The evidence hook captures an exact prompt only when Codex exposes it as the hook payload's `prompt` field. It never reconstructs text from a session transcript. Missing or secret-bearing prompts append visible sanitized records with `capture_status` (`missing_prompt`, `blocked_secret`, or `failed`). Secret-bearing text is never written, including to private evidence.

Codex does not expose exact assistant responses or delegated subagent prompts through these hooks. Full Codex session transcripts are deliberately not copied because they can include internal reasoning or secrets. Private hook-event artifacts contain only the allowed prompt (when safely captured) and exposed provenance.

JSONL writers use a repository-scoped named mutex, so concurrent Codex and subagent processes serialize prompt-ID allocation and append operations. Corrections use `supersedes_prompt_id` and are append-only.

---

## 2. Derived Files

- `index.csv`: Generated index overview produced by `tools/prompt-log/export-index.ps1`.
- `schema.json`: JSON Schema (v1) validating record structures.
