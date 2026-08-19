# Persistence, isolation, security and resilience

> **Status: Active supporting v1.0 persistence/security reference.** It remains current for PostgreSQL, session isolation and privacy baselines. Apply v1.1 amendment contracts for new content revisions, assistance provenance and operational conversation retention.

## Persistence decision

Use PostgreSQL as the canonical deployed store because the existing `.env.example` already declares a PostgreSQL URL and the MVP needs transactional append-only history across a resettable demo. Use migrations from the first implementation; the exact TypeScript ORM/query builder is not yet installed and is intentionally not frozen here. SQLite is acceptable only for fast, isolated local unit tests if migration parity is checked.

### Minimum relational schema

```text
actors(id PK, kind, display_name, seed_provenance, created_at)
skills(id PK, version, title, target_relation, review_status)
task_families(id PK, skill_id FK, version, representation, review_status)
tasks(id PK, version, family_id FK, role, content_json, answer_spec_json, review_json)
task_pairs(id PK, version, skill_id FK, practice_task_id FK, transfer_task_id FK,
           change_dimensions_json, reveal_json, review_json)
interventions(id PK, version, task_id FK, content_json, exposure_tags_json, review_json)
challenge_sessions(id PK, actor_id FK, pair_id FK, practice_task_id FK, status,
                   content_snapshot_json, started_at, closed_at)
transfer_sessions(id PK, actor_id FK, pair_id FK, transfer_task_id FK, status,
                  isolation_nonce_hash, allowed_context_json, started_at, closed_at)
evidence_events(id PK, actor_id FK, correlation_id, type, occurred_at, schema_version,
                provenance, payload_json, scorer_version, policy_version)
capability_receipts(id PK, actor_id FK, skill_id FK, policy_version, issued_at,
                    claim_json, conditions_json, source_event_ids_json, provenance)
demo_reset_audit(id PK, actor_id FK, reset_by_actor_id, fixture_version, occurred_at)
```

Indexes: `evidence_events(actor_id, occurred_at desc)`, `(challenge_session_id)` and `(transfer_session_id)` expressed either as indexed payload reference columns or dedicated columns, `capability_receipts(actor_id, skill_id, issued_at desc)`, and a unique receipt idempotency index on `(actor_id, transfer_scored_event_id, policy_version)`. Add only indexes required by actual query plans.

### Transaction boundaries

Each command transaction: validate session/content snapshot → append command event(s) → update session projection/status → derive/append score or receipt event when applicable → commit. A receipt creation transaction must lock or uniquely constrain its qualifying transfer score to prevent two tabs issuing duplicates.

No event may be “half logged”: if score/receipt fails, the server returns a typed error and leaves the prior submitted event only if the business rule explicitly permits queued scoring. For MVP, synchronous scoring means a failed scorer produces no authoritative score event.

## Transfer isolation contract

`TransferSession` is a separate server session and response DTO. It has access only to:

| Allowed | Forbidden |
|---|---|
| actor id, selected pair/transfer task content snapshot, skill title, neutral condition labels, its own attempts/submissions | practice answer/reasoning, worked solution, intervention body/tags beyond neutral condition, practice feedback, previous AI conversation, audit history, hidden pair solution |

Enforcement:

1. Server creates transfer task from the pair linked to the solved `ChallengeSession`; the client sends no task ID.
2. Transfer endpoints query by `TransferSession` and serialize a transfer-specific DTO, never a generic task DTO with practice context joined.
3. AI calls for transfer receive only transfer prompt + current optional reasoning + approved safe feedback policy. They cannot receive practice transcript or hints.
4. On refresh, the server resumes the same transfer session and same task snapshot. Browser caches/drafts may contain only current transfer draft, and must be cleared when leaving/resetting.
5. Connection reveal becomes available only after a transfer score; it is a separate endpoint. The transfer page cannot prefetch reveal/solution content.

This is product isolation, not a claim that a learner cannot remember or use prior learning. It prevents **system leakage** of the prior answer/hint.

## Security and privacy baseline

* Use synthetic demo profiles by default; collect no real child data for the competition path.
* Minimize identity to a random actor ID and optional display name. No date of birth, school, personality profile or behavioral risk label.
* Do not request chain-of-thought. Reasoning input is optional, length-limited and excluded from analytics/model training by default.
* Keep provider credentials server-only; never expose model keys or raw environment configuration to the browser or docs.
* Validate all route payloads and enforce answer/reasoning size limits, rate limits appropriate to a single demo, and server-side authorization on every actor/session relation.
* Content/review metadata is server-owned. Client-provided `receipt`, score, event type, provenance or task-pair IDs are rejected/ignored.
* Audit detail is role-gated. Student history omits intervention taxonomy/version IDs unless the product chooses a learner-friendly explanation.
* Logs redact answer/reasoning and tokens by default. Operational logs contain request/correlation IDs and error categories, not PII.

## Error model and observability

| Error code | HTTP family | Frontend state / recovery |
|---|---|---|
| `INVALID_TRANSITION` | 409 | reload server state; preserve draft |
| `TASK_NOT_AVAILABLE` / `TRANSFER_NOT_ELIGIBLE` | 409 | return to current next action; no client workaround |
| `SUBMISSION_INVALID` | 400 | inline input guidance |
| `SCORING_FAILED` | 503 | keep draft; `Thử lại`; no inferred result |
| `AI_UNAVAILABLE` | 503 or embedded optional-feedback status | deterministic score/hints continue; show honest service message |
| `CONTENT_INTEGRITY_FAILED` | 503 | stop affected episode; presenter recovery/reset |
| `DEMO_STATE_CONFLICT` | 409 | reset only through presenter action |
| `FORBIDDEN` | 403 | no detail leakage |

Lightweight structured logs and counters: request ID, correlation ID, endpoint/status, state-transition rejection, scorer error, AI latency/outcome, content integrity failure, database error, demo reset, `/healthz` status. Do not install a monitoring platform before the core runs; a console/structured sink plus health endpoint is sufficient.
