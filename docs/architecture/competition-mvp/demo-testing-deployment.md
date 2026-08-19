# Demo data, testing and deployment boundary

> **Status: Active supporting v1.0 testing/deployment reference.** It does not establish v1.1 provider readiness, Content Studio, hybrid grading or final deployment status; use the final v1.1 plan for those execution gates.

## Fixture specification

Fixtures are structural placeholders, not validated educational content.

```text
fixture-v1/
  skills/demo_skill_001.json
  families/demo_family_graph.json
  families/demo_family_table.json
  tasks/practice_task_001.json
  tasks/transfer_task_001.json
  pairs/pair_001.json
  interventions/hint_001.json
  interventions/hint_002.json
  interventions/hint_003.json
  actors/demo_clean.json
  actors/demo_history.json
  events/demo_history_events.json
```

The content loader rejects missing approved review records, mismatched skill IDs, duplicate versions, a pair whose tasks are not practice/transfer roles, or an answer spec without a supported scorer. Fixtures must remain replaceable through data/configuration, not source edits.

## Demo accounts and reset

| Profile | Purpose | Provenance | Reset behavior |
|---|---|---|---|
| `demo-clean` | live 3-minute story | seeded identity/content; events after reset are `live` | reset deletes only this synthetic actor’s derived/session/event/receipt rows, reseeds its baseline atomically, rotates its session |
| `demo-history` | Home/Progress historical delayed evidence | `historical_seed` and visible timestamp | never used for live walkthrough; can be reseeded separately |
| `demo-audit` | restricted presenter/audit view | synthetic | cannot be reached from normal student nav |

`POST /api/v1/demo/reset` is available only to a presenter session or local protected mode. It uses a fixture version and transaction, records `demo_reset_audit`, invalidates the clean learner session, and returns an explicit completion result. `POST /api/v1/demo/session` bootstraps only the server-selected clean/history learner profiles and the Route Handler sets an HttpOnly cookie. Neither endpoint can reset arbitrary real accounts or issue a presenter/auditor identity. Seeded receipt/history UI carries `Dữ liệu demo` in audit and `Lịch sử · [date]` in student history where relevant.

## Demo-safe fallback

The golden path uses reviewed hints, reviewed pair content, deterministic scoring, server event persistence and receipt policy only. These remain available without an LLM. If optional AI feedback fails/timeouts, return a structured `AI_UNAVAILABLE` sub-result with copy such as: `Phản hồi AI đang gián đoạn. Bạn vẫn có thể tiếp tục với gợi ý đã duyệt.` Never present authored fallback copy as model output.

## Tests before implementation

| Test level | Required cases |
|---|---|
| Domain/unit | content validation; numeric/exact/expression score adapters; transition guards; event projection; receipt eligibility; correction/non-destructive history |
| Integration | start → attempt → open hint → correct practice → start isolated transfer → correct → reveal → one receipt; duplicate idempotency key; recovery after incorrect answer |
| Isolation | transfer DTO, AI adapter input and route queries cannot include practice response, hint body, solution or reveal before scored transfer |
| Persistence | events and current episode survive new request/restart; versioned score remains inspectable |
| Demo | reset gives identical clean start; historical profile visibly tagged; no duplicate receipt from double submit |
| AI contract | malformed JSON, timeout, provider error, unsafe output do not change authoritative score/state/evidence |
| E2E golden scenario | browser performs the exact demo story and sees bridge, transfer isolation wording, receipt conditions, history/audit |

The **deterministic-backend-core** E2E test may use a deterministic local provider stub or disabled-AI path; a live provider is never required to pass that core test. The separately frozen `competition-demo-v1.0` acceptance gate additionally requires a real-provider normal-path browser/runtime test and must not present a stub as live AI.

## Deployment boundary

Recommended topology: one web application service (frontend + route handlers), one PostgreSQL database, optional outbound AI provider. No background worker is required for the demo; `Ôn lại sau` can be a seeded historical fact until real scheduling is introduced.

Required configuration categories, not concrete values: application base URL, database connection, signed-session secret, presenter-reset secret/allow-list, optional AI provider key/model, allowed origin, environment name. Secrets live in the deployment secret manager/environment, never client code, fixture files or prompt logs.

Deployment readiness requires migrations applied, approved fixture version seeded, `/healthz` checks database and reports AI as optional, reset tested on the deployed environment, and a documented offline/AI-unavailable demo path. Cloud provider remains **unselected** because the repository has none; choose the smallest host that supports a Node web service and persistent PostgreSQL rather than designing provider-specific architecture now.
