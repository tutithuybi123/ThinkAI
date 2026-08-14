# Evidence-integrity repair

## Audit and root cause

The pre-repair Codex hook used one broad regular expression that matched secret *labels* (including `authorization`, `api key`, `token`, `oauth`, `password`, and assignments) rather than credential values. A match replaced the complete visible prompt with a `blocked_secret` placeholder. The hook also stored no raw-artifact hash, left exposed runtime metadata empty, and appended every `SessionStart` hook delivery.

The canonical source of truth is `evidence/prompt-log/sessions/*.jsonl`. `index.csv` and `preflight/checksums.sha256` are derived artifacts. Private hook artifacts are ignored and are not a canonical transcript source.

## Pre-repair findings

- 66 private Codex hook events and 69 canonical records were present.
- Canonical records contained 23 `captured`, 13 `blocked_secret`, 30 `session_start`, and 3 legacy records with no capture status.
- `index.csv` had 5 rows, omitting 64 canonical records.
- Three checksum entries mismatched their files.
- One historical canonical session file had a UTF-8 BOM.
- All 69 canonical records lacked model, provider, harness, and raw-source SHA-256 values; 66 had phase `unavailable`.
- Three source session IDs had duplicate historical `SESSION_START` records (5, 2, and 2 records respectively).
- No JSON parse failure or mojibake signature was found.

No authoritative local Codex/session transcript containing an exact previously blocked user message was available. The old private hook artifacts deliberately stored `null` for blocked prompts. Therefore zero historical prompts were recovered; all 13 remain unavailable as historical evidence. No old JSONL line was edited or deleted.

## Repair

Future capture defaults to exact visible prompt preservation. It redacts only high-confidence values: bearer credentials, provider-key-shaped values, private-key blocks, and explicit secret assignments. Each replacement uses `[REDACTED_SECRET]` and records its type/count. Private artifacts now contain only the safe representation and are one immutable event per file, allowing `raw_source_sha256` to link the exact artifact.

New records use UTF-8 without BOM. The one old BOM file remains unchanged to honor append-only preservation; validation identifies it as a documented historical byte anomaly rather than silently rewriting it. No mojibake correction was appended because no exact authoritative source was found.

Session-start deduplication now permits one future logical start per `source_session_id`. Historical duplicates remain visible and produce validator warnings.

## Metadata contract

| Field | Status |
| --- | --- |
| Timestamp, source session/message/parent/agent IDs | auto-captured when exposed by hook payload |
| Model, provider, harness, reasoning | auto-captured when exposed by trusted hook payload; otherwise unavailable (`null`) |
| Raw source reference and SHA-256 | auto-captured for new safe private hook artifacts |
| Phase | explicit hook/session context only; otherwise `unavailable` |
| Beads IDs, tools, files changed, visible response reference | optional observable artifacts; never inferred |
| Hidden reasoning and private tool payloads | unavailable by design and excluded |

## Validator invariants and limits

The validator checks JSON parseability, IDs/references, redaction metadata, duplicate session starts, deterministic index contents, deterministic checksums, and BOM policy. The regression suite verifies Vietnamese Unicode round trips, exact capture of secret-descriptive prompts, value-only redaction, private leak prevention, metadata/linkage, and session-start deduplication.

Historical prompt recovery is intentionally limited to an exact visible user message in an authoritative local source. It never uses assistant reasoning, private tool data, inference, or paraphrase. An exact recovery would be appended as a `PROMPT_RECOVERY` record with provenance; none was justified in this repair.
