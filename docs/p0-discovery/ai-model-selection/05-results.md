# Benchmark Results

Status: **LIVE OPENROUTER BENCHMARK BLOCKED — CREDENTIAL REQUIRED**.

On 2026-08-15, the process environment was checked for `OPENROUTER_API_KEY` without printing its value. It was absent. No OpenRouter chat completion was attempted, so there are no fabricated request-success, schema, latency, cost, quality, consistency, or safety results.

| Configuration | Real OpenRouter test | Hard gates | P50 / P95 | Observed cost | Human review | Status |
|---|---|---|---|---|---|---|
| `openai/gpt-5-mini` default | not tested | not assessed | not measured | not measured | not run | shortlist only |
| `anthropic/claude-sonnet-4.5` | not tested | not assessed | not measured | not measured | not run | shortlist only |
| `google/gemini-3-flash-preview` default | not tested | not assessed | not measured | not measured | not run | shortlist only |
| `qwen/qwen3.5-27b` default | not tested | not assessed | not measured | not measured | not run | shortlist only |
| `deepseek/deepseek-v3.2` default | not tested | not assessed | not measured | not measured | not run | shortlist only |
| `qwen/qwen3.5-flash-02-23` default | not tested | not assessed | not measured | not measured | not run | shortlist only |

The benchmark specification, executable harness, synthetic data, deterministic checks, repeat subset and blind-review CSV generation are ready at [`tools/benchmarks/thinkai-feedback`](../../../tools/benchmarks/thinkai-feedback/). The command requires a securely supplied `OPENROUTER_API_KEY` in the process environment and writes results only to an explicitly chosen path. Run it against the frozen set, inspect outputs, conduct the blinded review, and then replace this report with observed data.

## Pareto analysis

No empirical Pareto frontier exists. The only preliminary economic inference from published list prices is that DeepSeek V3.2 and Qwen3.5-27B occupy the lowest estimated-cost region, GPT-5 Mini a moderate-cost region, Gemini 3 Flash a higher-cost region, and Claude Sonnet 4.5 the premium region. This is not a quality, safety, or selection ranking.

| Requested label | Result |
|---|---|
| Best quality | not tested |
| Best value | not tested (lowest published-cost estimate: DeepSeek V3.2) |
| Best latency | not tested |
| Most reliable structured output | not tested |
| Best Vietnamese/feedback quality | not tested |
| Primary Demo candidate | no eligible candidate; all hard gates unassessed |
| Fallback Demo candidate | no eligible candidate; all hard gates unassessed |
