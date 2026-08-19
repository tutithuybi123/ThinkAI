# Connection Qualification

`git check-ignore .env.benchmark.local` succeeded. All required benchmark-only variables were present; a secret-value search outside the ignored local file returned zero persistent matches.

Live request: `POST https://ttmapi.site/v1/responses`, Bearer authentication and the three required Cockpit headers; model request `gpt-5.6-sol`, `reasoning.effort=high`, Vietnamese input, 80 output tokens. Result: completed/success, returned model `gpt-5.4-mini-2026-03-17`, Vietnamese output present, input/output usage 42/44, reasoning telemetry `null`, latency 2,039 ms. This proves accepted transport and parser compatibility, not model identity pinning.
