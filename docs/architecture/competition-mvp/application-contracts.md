# Scoring, AI, API and frontend contracts

> **Status: Active supporting v1.0 contract.** For current v1.1 Practice Companion, reviewed-rubric facets, grading aggregation and Transfer boundaries, [v1.1-amendment-contracts.md](v1.1-amendment-contracts.md) and ADR-011 override any conflicting statement here.

## Authoritative scoring

`ScoringService.score(taskSnapshot, answer)` returns a normalized result; the service is pure and versioned.

```ts
interface ScoreResult {
  outcome: 'correct' | 'incorrect' | 'invalid';
  scorerVersion: string;
  answerSpecVersion: string;
  normalizedAnswer?: string;
  reasonCode?: 'FORMAT' | 'OUT_OF_TOLERANCE' | 'NOT_EQUIVALENT';
}
```

Priority of scorer adapters: exact choice/text → normalized numeric comparison → symbolic equivalence only if a reviewed, deterministic library adapter is available → constrained teacher-reviewed rubric. A task that cannot be scored reliably by the selected implementation is not active MVP content. An LLM may comment on an optional explanation but cannot override `outcome`.

Old events cite both scorer and answer-spec versions. A scoring correction appends `evidence_corrected`; it does not overwrite old scores or receipts.

## Bounded AI adapter

| Call | Allowed purpose | Forbidden input/output | State effect / fallback |
|---|---|---|---|
| `feedbackForReasoning` | phrase optional feedback after authoritative score | no hidden answer, previous transfer solution, raw event history, PII; cannot return score/receipt/next state | non-authoritative; timeout/malformed → `AI_UNAVAILABLE`, show reviewed/deterministic guidance |
| `selectReviewedHint` (optional) | choose among already-approved hint IDs from a supplied allow-list | no new hint text, no task generation, no answer-revealing escalation beyond allow-list | selection validated against allow-list; fallback fixed next hint |
| `explainConnection` (optional later) | paraphrase an approved relation mapping | no unreviewed mathematical claim | cache only after review; MVP uses authored mapping directly |

All calls are server-side, schema-validated, time-bounded, retried at most once for transient failure, and record model/provider/prompt version in a non-authoritative technical log. Do not persist raw free-text reasoning by default; if feedback requires it, redact/limit retention under the privacy policy. Circuit breaker state never changes scoring or receipt behavior.

## Task-oriented API

All JSON endpoints require a valid actor session. Mutation endpoints accept `Idempotency-Key`; retries with the same key must return the original result, never duplicate events/receipts.

| Method/path | Command / response | Errors/events |
|---|---|---|
| `GET /api/v1/home` | `HomeSummary` | `ACTOR_NOT_FOUND` |
| `GET /api/v1/skills` | active skill/path only | — |
| `POST /api/v1/challenges/start` | select/start `ChallengeSession`; returns practice view model | `TASK_NOT_AVAILABLE`; `challenge_started` |
| `GET /api/v1/challenges/{id}` | resumable practice projection; never returns transfer content | `SESSION_NOT_FOUND` |
| `POST /api/v1/challenges/{id}/attempts` | `{ kind: 'attempt' }` or `{ kind:'cannot_start' }` | `INVALID_TRANSITION`; attempt event |
| `POST /api/v1/challenges/{id}/interventions/{id}/open` | reviewed hint view model | `INTERVENTION_NOT_AVAILABLE`; exposure event |
| `POST /api/v1/challenges/{id}/submissions` | response + authoritative practice score + next action | `SUBMISSION_INVALID`, `SCORING_FAILED`; submit/score events |
| `POST /api/v1/challenges/{id}/transfer/start` | isolated `TransferSession`, transfer view model | `TRANSFER_NOT_ELIGIBLE`; `transfer_started` |
| `GET /api/v1/transfers/{id}` | transfer view model; excludes practice response/hints | `TRANSFER_NOT_FOUND` |
| `POST /api/v1/transfers/{id}/submissions` | transfer score and recovery/reveal availability | `INVALID_TRANSITION`, `SCORING_FAILED`; transfer events |
| `POST /api/v1/transfers/{id}/connection/reveal` | approved connection reveal | `CONNECTION_NOT_AVAILABLE`; reveal event |
| `GET /api/v1/receipts/{id}` | receipt view/detail | `RECEIPT_NOT_FOUND` |
| `GET /api/v1/progress` | path + learner-language history | — |
| `GET /api/v1/audit/receipts/{id}` | restricted provenance detail | `FORBIDDEN`, `AUDIT_NOT_FOUND` |
| `POST /api/v1/demo/reset` | presenter-only reset receipt; invalidates the clean learner session | `DEMO_RESET_FORBIDDEN`, `DEMO_STATE_CONFLICT`; reset audit record |
| `POST /api/v1/demo/session` | server-controlled synthetic learner bootstrap; Route Handler sets an HttpOnly session cookie | `INVALID_DEMO_PROFILE` |
| `GET /healthz` | dependency-safe service status | no learner data |

### Submission example

```json
POST /api/v1/challenges/ch_demo_001/submissions
{
  "answer": "2",
  "reasoning": "Em tính độ thay đổi của y trên x."
}
```

The mutation idempotency value is the required `Idempotency-Key` HTTP header; `clientRequestId` is not part of the frozen API contract.

```json
{
  "score": { "outcome": "correct", "scorerVersion": "score-v1" },
  "nextAction": { "kind": "TRANSFER_AVAILABLE", "label": "Thử vận dụng" },
  "feedback": { "source": "deterministic", "message": "Bạn đã giải được bài này." }
}
```

## Frontend boundary

The frontend may retain drafts locally and choose visual transitions. It requests view models and sends user commands. It must not derive conditions, select a transfer item, infer history states, issue a receipt, suppress a recorded hint, or decide that a score is correct.

The API returns product-ready language keys/structured conditions where this avoids duplicated policy; the frontend owns Vietnamese presentation style using the frozen language guide. For example, receipt data returns `claim`, `observedConditions[]`, `unknownConditions[]`, provenance and timestamp—not an opaque “mastery” value.
