# Competition MVP Definition of Done

> **Status: Historical v1.0 planning gate.** Current v1.1 gates are in the final implementation plan.

All criteria are pass/fail.

## Core product and content

- [ ] One teacher-confirmed Grade-10 micro-skill is active; no second active domain is implied.
- [ ] Six to ten reviewed task pairs exist with target/shift/prerequisite/review metadata, solution, and scoring policy.
- [ ] Three immutable help interventions exist and each has an ID/version/exposure tag.
- [ ] A learner can attempt, declare cannot-start, request help, solve, and enter a separate Transfer Quest.
- [ ] Transfer item is unseen, isolated from the prior solution, and has no answer reveal.

## Evidence and receipt

- [ ] Attempt, exposure, response, result, item/version, conditions, timestamp, scoring version, and review status persist as append-only events.
- [ ] Receipt is generated from persisted qualifying events, not a demo toggle.
- [ ] Receipt states demonstrated capability, conditions, and what remains unknown.
- [ ] Later failure adds contradictory evidence without deleting earlier events.
- [ ] No mastery percentage, fixed ability label, or help penalty appears.

## AI and deterministic logic

- [ ] Deterministic software owns item selection, isolation, exact scoring where possible, event persistence, receipt rule, progress, and reset.
- [ ] Any live AI behavior is visibly bounded, schema-validated where relevant, and has an honest fallback.
- [ ] AI does not autonomously validate task pairs or assign learner identity labels.

## Student UX and shell

- [ ] Home, challenge, Transfer Quest, receipt, history/progress, and compact audit view are coherent at intended demo resolution.
- [ ] All visible controls work, disable honestly, or are absent.
- [ ] Loading, empty, success, failure, retry, and refresh states are handled for active paths.
- [ ] Capability progression is evidence-linked only; no currency/leaderboard/streak economy exists.

## Demo, reliability, and responsibility

- [ ] A resettable synthetic demo account supports the complete live path.
- [ ] Historical delayed event is visibly labelled historical/seeded with timestamp.
- [ ] Pre-authored, live, seeded, and historical data are distinguishable in audit context.
- [ ] Offline/API/network/backend failure has an honest recoverable path for the core demo.
- [ ] No real child data is used without required consent, retention/deletion/access controls, and no-training-by-default policy.
- [ ] Core-path tests and a repeatable demo checklist pass.
- [ ] Official Bảng B criteria are mapped only after a traceable official source is available.
