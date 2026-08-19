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

`UserPromptSubmit` runs the existing Beads hook and a sibling Codex evidence hook. The evidence hook captures the exact prompt only when Codex exposes it as the hook payload's `prompt` field. It never reconstructs text from a session transcript. Descriptive words such as “API”, “key”, “token”, “OAuth”, and “password” are captured exactly. Only concrete credential-like substrings are replaced with `[REDACTED_SECRET]`; those records use `capture_status: redacted`, `redaction_count`, and `redaction_types`. Missing payload prompts remain explicitly unavailable (`missing_prompt` or `failed`).

Codex does not expose exact assistant responses or delegated subagent prompts through these hooks. Full Codex session transcripts are deliberately not copied because they can include internal reasoning or secrets. Private hook-event artifacts contain only the allowed prompt (when safely captured) and exposed provenance.

Each future private hook event is a separate UTF-8-without-BOM artifact. Its safe SHA-256 is linked from the canonical record via `raw_source_ref` and `raw_source_sha256`. JSONL writers use a repository-scoped named mutex, so concurrent Codex and subagent processes serialize prompt-ID allocation and append operations. A logical `source_session_id` receives at most one future `SESSION_START`; repeated hook delivery is deduplicated. Corrections and exact recoveries are append-only (`PROMPT_RECOVERY` records reference `recovery_of`).

Only observable evidence is logged: visible user prompts, exposed runtime metadata, visible response references/summaries, tool names, changed files, test results, and task identifiers. Hidden reasoning, private tool payloads, and reconstructed transcript text are excluded.

---

## 2. Derived Files

- `index.csv`: Deterministic derived index produced by `tools/prompt-log/export-index.ps1`; do not hand-edit it.
- `schema.json`: JSON Schema (v1) validating record structures.
