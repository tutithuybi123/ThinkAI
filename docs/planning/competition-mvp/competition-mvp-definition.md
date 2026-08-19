# Exact Competition MVP definition

> **Status: Historical planning definition.** Do not use as current v1.1 scope; see `../../CURRENT.md`.

## What a judge opens

A polished student application under a seeded demo learner. It opens on a Home screen that names one active mathematical capability, offers **Continue challenge**, and shows one truthful prior Capability Receipt plus one clearly labelled historical Memory Return. It does not pretend to be a broad curriculum product.

## What the learner can actually do

1. Continue one active micro-skill challenge.
2. Enter a first attempt or select “I cannot start.”
3. Open any of three legitimate fixed/reviewed help interventions.
4. Submit a mathematically scoreable response and, if used, a short method/explanation.
5. Enter a separately isolated changed-representation **Transfer Quest**.
6. Submit independently under the stated no-answer-reveal condition.
7. See why the two tasks use the same mathematical relation.
8. Receive a Capability Receipt on a valid pass; on failure receive a neutral recovery action and no status loss.
9. See current capability summary/history derived from persisted events.

## Functional boundary

| Area | MVP target |
|---|---|
| Active content | one teacher-confirmed Grade-10 micro-skill; not an entire unit |
| Item bank | 6–10 reviewed primary/transfer pairs plus fixed solutions/rubrics |
| Help | three immutable reviewed interventions, not unbounded LLM tutoring |
| AI visible role | live interpretation/feedback phrasing or selection among reviewed interventions; must be labelled/fallback safely |
| Verification | isolated unseen transfer item, pair metadata, deterministic answer scoring where possible |
| Persistence | event log, current progress, receipt/history, resettable demo account |
| Audit | one compact read-only event/detail screen |
| Historical layer | seeded/timestamped Memory Return, explicitly historical |

## Deliberately absent

No general chat, multi-skill adaptation, automatic misconception diagnosis, model-created live transfer items, broad personalized path, leaderboard/XP/coins, teacher LMS, parent portal, Learning Twin, or claim of learning gain.

## Capability Receipt

One compact card, history entry, and progress-node state—not a collectible economy or share flow. Student text must include:

* **Demonstrated:** “Applied relation X independently in representation Y.”
* **Conditions:** unseen item; independent challenge; no answer reveal; task family; date/result.
* **Still unknown:** delayed retrieval has not yet been checked, or its actual recorded outcome.

The audit expansion may reveal item/version, intervention IDs, scoring version, pair-review status, timestamps, and contradictory events.

## Valid Transfer Quest

For each pair, pre-author metadata: same target relation/strategy; declared representation/context/givens/route shift; no unintended prerequisite; no reused wording/numbers/solution order; independent review; solution/rubric; deterministic verification when possible. Different numbers or a harder problem alone are invalid.
