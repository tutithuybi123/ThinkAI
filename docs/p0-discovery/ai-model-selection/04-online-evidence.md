# Current Online Evidence and Shortlist

Snapshot date: 2026-08-15. Availability, price, context and supported parameters were read from the public [OpenRouter Models API](https://openrouter.ai/api/v1/models), not recalled from model memory. OpenRouter structured-output request semantics were checked against its [Structured Outputs documentation](https://openrouter.ai/docs/structured-outputs), using `response_format.type=json_schema` with a strict schema. The public catalog is dynamic: rerun the harness/catalog check before any live purchase or integration.

## Evidence limits

The Tavily research CLI was installed but returned a plan-quota error on 2026-08-15. The built-in web search endpoint returned HTTP 404. Therefore this report relies on direct primary OpenRouter API/documentation observations, and makes no claim about current third-party latency or generic benchmark rankings. Generic leaderboards do not measure ThinkAI’s authority, withholding, Vietnamese-feedback, or injection contract and are not selection evidence.

## Candidate shortlist

| Configuration | Why included | Context | Input / output USD per 1M tokens | Strict structured output advertised by catalog | Evidence status |
|---|---|---:|---:|---|---|
| `openai/gpt-5-mini` (default/no extra reasoning) | mid-price reasoning/instruction candidate with catalog `response_format`, `structured_outputs`, and `reasoning_effort`; likely practical baseline | 400k | $0.250 / $2.000 | yes | catalog verified; task quality untested |
| `anthropic/claude-sonnet-4.5` | high-quality-price frontier comparison; catalog supports structured output | 1M | $3.000 / $15.000 | yes | catalog verified; task quality/latency untested |
| `google/gemini-3-flash-preview` | fast/mid-cost candidate; exposes structured output and reasoning effort | 1,048,576 | $0.500 / $3.000 | yes | catalog verified; preview stability untested |
| `qwen/qwen3.5-27b` | economical multilingual/instruction candidate with structured output; tests whether lower cost preserves utility | 262,144 | $0.195 / $1.560 | yes | catalog verified; Vietnamese/safety quality untested |
| `deepseek/deepseek-v3.2` | very low output-price candidate with structured output; tests value frontier | 163,840 | $0.269 / $0.400 | yes | catalog verified; reliability/quality untested |
| `qwen/qwen3.5-flash-02-23` | qualifying cheapest interactive Qwen frontier candidate; included so inexpensive candidates are treated fairly | 1M | $0.065 / $0.260 | yes | catalog verified; reliability/quality untested |

Inclusion criteria are: interactive (not batch) availability, >=100k context, `response_format` and `structured_outputs` catalog support, and representation of a non-dominated published-price tier. Batch variants are excluded because the Demo requires interactive feedback. Qwen3.5 Plus is excluded as price-dominated by the included Qwen tiers pending live evidence.

## What the evidence does and does not establish

OpenRouter’s catalog establishes that these exact IDs were offered, their published token rates/context, and that `response_format`/`structured_outputs` appeared in supported parameters at observation time. It does **not** prove provider routing stability, strict schema behaviour across every provider, Vietnamese pedagogy, math accuracy, attack resistance, P95 latency, or real billed cost. The strict JSON claim must be verified per configuration using the harness. The OpenRouter docs establish request syntax, not that every listed model meets ThinkAI gates.

## Published-price planning estimate

For an illustrative 750 input / 80 output-token feedback call (including instruction and JSON), published-rate estimates are: GPT-5 Mini $0.0003475, Claude Sonnet 4.5 $0.0034500, Gemini 3 Flash Preview $0.0006150, Qwen3.5-27B $0.0002711, DeepSeek V3.2 $0.0002338. That implies 1,000 calls of approximately $0.35, $3.45, $0.62, $0.27 and $0.23 respectively. These are **inferred estimates**, exclude provider-specific routing/caching/reasoning charges and are not observed billable costs.

## Source quality

| Source | Measures | Relevance / limitation |
|---|---|---|
| [OpenRouter Models API](https://openrouter.ai/api/v1/models) | live catalog metadata, published per-token price, context, parameters | strongest source for what OpenRouter currently exposes; mutable and not a performance test |
| [OpenRouter Structured Outputs docs](https://openrouter.ai/docs/structured-outputs) | JSON-schema request contract | directly supports harness design; does not guarantee every provider/model response is valid |
| [OpenRouter provider routing docs](https://openrouter.ai/docs/guides/routing/provider-selection) | optional provider sorting/availability routing | useful operational context; deliberately not used to hide model/provider failures in the benchmark |

No independent benchmark is cited as a winner signal. All quality, safety, consistency, and latency claims remain not tested until real calls are run.
