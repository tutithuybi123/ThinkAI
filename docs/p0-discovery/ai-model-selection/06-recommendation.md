# Model-Selection Recommendation

## Decision

**No OpenRouter model is selected.** Selecting a Primary or Backup would violate the frozen hard-gate methodology because no real configuration has been tested. This is a deliberate stop, not a provider rejection.

| Role requested | Decision | Evidence confidence |
|---|---|---|
| PRIMARY DEMO MODEL | **Not selected — live benchmark blocked** | none for ThinkAI task quality/safety/reliability |
| BACKUP MODEL | **Not selected — live benchmark blocked** | none for ThinkAI task quality/safety/reliability |
| BEST QUALITY MODEL | **Not tested** | no generic score may substitute for task evidence |
| BEST VALUE MODEL | **Not tested**; `deepseek/deepseek-v3.2` has the lowest published illustrative cost estimate | published-price evidence only |

## Required next input

Provide a funded OpenRouter credential through the local process environment as `OPENROUTER_API_KEY` (never in repository files, chat, command arguments, or results). Configure a provider-side account/project spend cap before use; the harness additionally enforces its six-model allowlist and a call cap, but cannot itself make a key model-scoped. Then run the isolated harness from `tools/benchmarks/thinkai-feedback/README.md`, complete blind teacher/team review, run the pre-created private holdout, and rerun a fresh independent review. No production deployment access is required.

## Provisional execution order after credential

1. Run all six default configurations and the fixed repeat subset under the same strict prompt/schema.
2. Reject any hard-gate failure before interpreting average quality or cost.
3. Blind-review outputs; assess any model-specific reasoning-effort setting as a separate configuration only if justified.
4. Plot quality against observed cost and P95 latency; nominate Primary and Backup only from passing configurations.
5. Record exact returned model/provider, prompt-template hash/version, observed metrics and human-review disagreement, then obtain a fresh reviewer.

The initially most economical public-price candidate is not automatically the best value: its actual Vietnamese feedback, withholding, injection resistance, schema reliability and latency are unverified. Similarly, a premium candidate is not automatically the best quality for this bounded task.
