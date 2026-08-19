# Competition Demo amendment — `competition-demo-v1.1`

## Authority and relationship to v1.0

This is an explicit amendment to the frozen `competition-demo-v1.0` scope lock; it does not rewrite the historical v1.0 record. It is the current Competition Demo direction from 2026-08-19. Where it conflicts with v1.0, this document governs.

| Field | Record |
|---|---|
| Scope version / effective date | `competition-demo-v1.1` / 2026-08-19 |
| Change authority | Project-owner amendment request recorded in the conversation prompt log |
| Thesis preserved | Assisted practice is not independent capability; only an isolated transfer can provide the stronger evidence for a capability receipt. |
| Demo boundary | One Grade-10 mathematics vertical slice: one subject, one topic, a small authored micro-skill path, and a small reviewed practice/transfer bank. |

## Product delta

The Demo is an end-to-end learning system with three bounded subsystems:

1. **Learning system:** learner selects subject → topic → micro-skill; works a practice task using a bounded AI companion; submits a genuine answer or written solution.
2. **Content system:** a protected minimal `/ops` route manages the same reviewed, versioned content repository consumed by learner runtime.
3. **Evidence system:** records assistance conditions and actual exposure, practice grading, isolated independent transfer, connection reveal, and a capability receipt limited to those facts.

The point remains not “a chatbot that solves mathematics”, but whether a learner can use an idea independently after AI-supported practice.

## New P0 requirements

* Practice supports a written-solution working area in addition to existing deterministic answer shapes. A learner need not know LaTex.
* Practice-only AI Companion is server mediated and bounded by approved task AI guidance. It may ask, hint, explain a step, and respond to learner-provided reasoning; it may not score, issue a receipt, unlock progression, reveal transfer material, or decide mastery.
* Assistance is non-punitive evidence, not a dependency/mastery score. Its taxonomy is `NONE`, `PROMPT`, `CONCEPTUAL_HINT`, `STRATEGIC_HINT`, `STRONG_SCAFFOLD`; server validation records whether answer revelation was attempted, actually exposed to the learner, or blocked before delivery.
* Grading is hybrid: deterministic validators remain authoritative wherever a task is deterministically scorable; a schema-validated reviewed-rubric evaluator can supply reasoning evidence for written solutions. The grading aggregator and backend policy—not an evaluator response alone—produce the final outcome and gate decision. `UNCERTAIN`, unavailable, malformed, schema-invalid, or conflicting evidence cannot manufacture a pass, receipt, or progression transition.
* Teacher-authored content distinguishes expected result, rubric/required claims, one or more non-canonical reference solutions, common misconceptions, and AI guidance. A learner may use a different valid method, step order, or wording.
* Transfer can use the same grading abstraction only after submission. It exposes no chat, hints, practice transcript, practice reference solution, pair relation, or pre-submit grader feedback.
* `/ops` is a minimum viable server-protected Content Studio: create/edit draft, preview, review, approve, publish, and deprecate reviewed task/pair content. A secret URL is not access control.

## Assistance evidence and conversation lifecycle

An assistance event is server-created through the existing append-only evidence system. The model may produce a **candidate learner reply** and optional proposed support metadata only. The client may send a message only. Neither model nor client can declare authoritative support or reveal/exposure facts.

The server owns three stages: (1) validate/classify candidate output and assign authoritative `supportLevel` plus the attempted-reveal/block facts, (2) decide whether a response is delivered, then (3) record the delivery outcome. The final event/provenance includes event identity and timestamp, conversation ID, task/task-family/micro-skill and guidance versions, provider/model/prompt versions when AI was invoked, and these separate booleans:

| Field | Meaning |
|---|---|
| `answerRevealAttempted` | The generated output contained or attempted prohibited final-answer/solution disclosure. |
| `answerRevealed` | The prohibited answer/solution was actually delivered to the learner. It is an observed fact, never hard-coded false. |
| `responseBlocked` | The server validator withheld the output before learner delivery. |

For example, a validator-blocked response records `answerRevealAttempted: true`, `answerRevealed: false`, and `responseBlocked: true`. A failure that truly reaches the learner records `answerRevealed: true` and remains auditable; it must not be rewritten as a safe interaction. Such exposure does not punish the learner, but it is a material assistance condition and cannot be ignored by a later policy/review.

During an active Practice session, operational conversation context is available server-side only for bounded companion continuity and **Practice Process Feedback** after Practice submission. Practice Process Feedback cannot operate on Transfer or receive Transfer context. Durable evidence retains structured assistance facts and approved-version references; it need not retain the raw transcript indefinitely. Exact retention duration is **TBD before production deployment**. P0 requires access control, minimization/redaction, no model-training use by default, and no raw conversation in learner-facing transfer DTOs or ordinary logs.

## Content lifecycle and version binding

The content lifecycle is `DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` → `DEPRECATED`.

* A version ID is created when a `DRAFT` is created. Only a `DRAFT` body is mutable; its working body may change only while it remains `DRAFT`.
* Submitting for review freezes the exact body and moves that version to `IN_REVIEW`. `IN_REVIEW`, `APPROVED`, `PUBLISHED`, and `DEPRECATED` versions are immutable.
* After review submission, any change to the question, expected result, rubric, reference solutions, task pair, connection, or AI guidance creates a new `DRAFT` with a new version ID; it never edits the reviewed version.
* Review and approval apply to one concrete frozen version and its complete body. Approval changes review state only; it does not change body or manufacture a version. Publishing exposes exactly that approved version; it also does not change body or manufacture a version. Therefore the exact content body reviewed and approved equals the exact content body published.
* Only `PUBLISHED` versions are selectable for a new learner session. `DEPRECATED` versions are not selected for new sessions but remain available for historical projection/audit.
* A learner session and all derived evidence stay bound to the exact content/task/pair/guidance versions originally consumed. Later review, publishing, or deprecation never mutates that history.

## Explicit simplifications

The Demo does **not** build a broad LMS, school/class management, a full role system, many subjects, handwriting/OCR, a general chat bot, automatic publishing, a dependency/mastery score, or a curriculum recommendation engine. AI-assisted content authoring may create **draft candidates only**; human review is required before approval/publishing.

## Invariants unchanged or strengthened

1. Help is never a penalty; it is an observed condition.
2. Transfer is a separately created server session, with a transfer-specific DTO and no Practice context leakage through any learner-facing or model contract.
3. The server, not AI or the browser, decides grading gates, transfer pass, receipt eligibility, and progression.
4. Content, task-pair validity, and task versions are human-reviewed and immutable once bound to a session.
5. Evidence is append-only and cites content/task/scorer/policy versions. A later edit never changes prior evidence.
6. AI failure must leave deterministic scoring, evidence integrity, and recovery usable.
7. Synthetic demo identities and privacy limits remain mandatory.

## Competition and operational implications

The 2026 regulations require an auditable source history, a complete prompt log, and a declared inventory of AI tools/models/libraries/datasets/APIs for the relevant competition path. The added provider/model, rubric schema/prompt version, content provenance, and any new library must therefore be recorded in the existing evidence manifests without credentials. A stable online demo is encouraged for Bảng B; no paid provider or deployment is selected by this amendment.

## Acceptance additions

In addition to v1.0 gates, prove:

* factorization reference plus a valid quadratic-formula learner solution can be graded `CORRECT`;
* final-answer correctness does not erase invalid reasoning when a reviewed rubric detects it;
* unavailable, malformed, uncertain, and conflicting grading evidence cannot issue a receipt;
* assistance events are server-created and distinguish attempted reveal, actual exposure, and blocked output;
* transfer responses/API/UI expose no companion or practice-context data;
* draft/approved/published/deprecated content boundaries and historical version binding hold.
