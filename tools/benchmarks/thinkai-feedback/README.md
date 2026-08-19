# ThinkAI Feedback Benchmark Harness

This isolated Node harness sends synthetic cases to OpenRouter only when `OPENROUTER_API_KEY` is present in the process environment. It does not import `src/`, modify production configuration, print the credential, or place it in results.

```powershell
$env:OPENROUTER_API_KEY = '<secure credential only in this shell>'
node tools/benchmarks/thinkai-feedback/run.mjs --out tools/benchmarks/thinkai-feedback/private/benchmark-metrics.json
Remove-Item Env:OPENROUTER_API_KEY
```

Optional `THINKAI_BENCH_MODELS` is a comma-separated list of exact OpenRouter model IDs. Results contain synthetic outputs and blind-review CSV; do not commit results until they have been checked for accidental sensitive material. The live harness follows the frozen methodology in `docs/p0-discovery/ai-model-selection/02-evaluation-methodology.md`.
