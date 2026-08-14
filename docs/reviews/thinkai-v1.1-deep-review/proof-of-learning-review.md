# Proof-of-Learning Protocol review

## What each stage can actually measure

| Stage | Defensible observation | Invalid inference to avoid |
|---|---|---|
| Attempt | prior response, time, declared inability to start | stable ability or effort |
| Assistance | which predefined help artifacts were opened and when | a universal numeric quantity of help |
| Solve | correctness and, where rubricked, method/explanation | learning or independent competence |
| Independent trial | performance under a stated no-help policy on an unseen validated item | broad mastery |
| Near transfer | performance across a defined superficial/representational shift | general transfer unless the item family supports it |
| Delayed check | retrieval at one specified interval | long-term retention in general |
| Level | a product state created by declared threshold | intelligence or permanent competence |

## Assistance metering: 1–5 is not a measurement yet

A short prompt can disclose the decisive schema; a long Socratic exchange can disclose none. The proposed 1–5 scale is a **policy label**, not a valid interval scale. It must not be added, averaged, or presented as “67% help.”

For the MVP, replace it with a structured exposure record:

* intervention ID and immutable text/version;
* whether it reveals the target relation, a solution step, the full answer, or only motivational/process support;
* request time and attempt before/after;
* task/item family; and
* a human-authored rubric tag.

Evaluate inter-rater agreement on a sample. If trained raters cannot consistently tag disclosure classes, kill semantic metering claims and log only UI events.

## The protocol has two claims and two designs

1. **Measurement claim:** this record predicts later independent performance better than end-of-session correctness. It requires held-out outcomes and calibration/comparison.
2. **Learning claim:** forcing attempt/fading help/transfer/retrieval improves later independent performance. It requires controlled allocation and equalized time/content.

The proposed document understands this distinction but repeatedly lets “evidence” imply “improvement.” v1.2 must label every claim accordingly.

## Architecture guardrails

Deterministic: item versioning, access rules, answer checking/symbolic verification, schedule, evidence update rule, audit log, consent/deletion. AI: feedback phrasing, interpretation of free response, and candidate generation. Never let an LLM alone decide transfer equivalence, correctness where a solver applies, the assistance severity of arbitrary text, or a learner label. Existing APIs remain the correct strategy; training is not the bottleneck.
