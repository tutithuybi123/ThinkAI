# Frontier model reality check — ThinkAI-9di

This is a diagnostic research experiment, not a product implementation. The raw Eedi directory was read only. `cases.csv` is the preserved reproducible 150-case oracle-25 evaluation set; `evaluation-design.md` contains the exact prompts. `tools/research/build_frontier_reality_check.py` can regenerate the selection with fixed seed `20260811`, but it was not run during execution.

## Execution record

- Initial failed path: the earlier app-server inference client returned `Access is denied`; this historical evidence is preserved.
- Transport used: native `codex exec --ephemeral --json --sandbox read-only --color never`, fresh ephemeral isolated working directory per batch.
- Provider from active Codex configuration: `codex-pooler-ws`.
- Model from active Codex configuration: `gpt-5.6-terra`.
- Reasoning setting: not configured or exposed by the runtime event.
- Temperature/sampling: not configured or exposed.
- Execution timestamp: 2026-08-11 (Asia/Saigon).
- Batching: 5 cases per call (30 batches per condition). The requested 10-case trial was stopped for excessive latency; a five-case native call was validated before the full run.

`forced-choice-native-raw-output.jsonl` and `abstention-native-raw-output.jsonl` preserve allowed final model messages plus transport events. They contain no hidden chain-of-thought.
