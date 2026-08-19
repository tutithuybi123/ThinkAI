# Existing Harness Audit

Date: 2026-08-17. The inherited `run.mjs` is an OpenRouter Chat Completions-only runner. It has synthetic input, a credential guard, deterministic scheduling, basic JSON checks, private ignored artifacts, and small evaluator tests. It does not have a provider abstraction, Responses parser, normalized provider result, retry semantics, exclusive run locks, checkpoint integrity checks, or tool-loop support.

The Cockpit qualification adds `codex-responses.mjs` and `qualify-cockpit.mjs`, preserving the old OpenRouter runner. The new adapter normalizes text, JSON, usage and status; preserves unknown telemetry as `null`; redacts authorization; retries only transient status classes; and records failures as failures. A discovered duplicate-run race was fixed with exclusive per-artifact locks and duplicate-ID rejection.

Unverified before a production-model benchmark: full tool continuation, provider-specific structured-output semantics, retry recovery after an actual process kill, and HTTP compatibility for Responses continuation. The last item is currently blocked by the reference endpoint.
