# Priority and dependency matrix

> **Status: Historical planning matrix.** Its completion/status claims are time-bound and not current v1.1 execution authority.

Current state for all application areas is **NOT STARTED** unless marked otherwise in the audit.

| Product area | Competition target / gap | Priority | Complexity | Uncertainty | Demo risk | Depends on | Blocks |
|---|---|---:|---|---|---|---|---|
| Product freeze | micro-skill, task format, receipt rule, active/locked map | P0 | Low | Medium | Critical | teacher/content decision | every core screen |
| Reviewed content bank | 6–10 valid pairs, fixed hints/rubrics/solutions | P0 | Medium | High | Critical | teacher review | Transfer Quest, scoring, receipt |
| Event schema/persistence | append-only attempt/exposure/result/receipt events | P0 | Medium | Medium | Critical | product freeze | all evidence/progress/demo reset |
| Core challenge workspace | attempt/help/solve flow | P0 | Medium | Medium | Critical | content, event schema | signature interaction |
| Deterministic scorer | exact answer + limited rubric policy | P0 | Medium | Medium | Critical | task format | solve/transfer/receipt |
| Isolated Transfer Quest | no leakage, changed-representation pair | P0 | Medium | High | Critical | reviewed pairs, sessions, scorer | ThinkAI thesis |
| Capability Receipt | rule-driven card/history entry | P0 | Medium | Low | High | event schema + transfer result | visible differentiation |
| Demo reset/fallback | repeatable seeded account, retry/error | P0 | Medium | Medium | Critical | persistence/state | reliable presentation |
| Live AI feedback | bounded free-text feedback or reviewed-hint selection | P1 | Medium | High | High | provider, prompt/schema, fallback | polish only; must not block deterministic path |
| Home/path/history | coherent shell and real derived progress | P1 | Medium | Medium | Medium | event persistence/receipt | product completeness |
| Compact audit view | item/hint/version/condition/review details | P1 | Low | Low | Medium | event schema/content metadata | judge credibility |
| Loading/error/empty/responsive | complete product behavior | P1 | Medium | Medium | Medium | active routes/state | shell quality |
| Memory Return | labelled historical card + history display | P1 | Low | Low | Low | event schema | long-term narrative |
| Tests for deterministic path | core-path repeatability | P1 | Medium | Medium | High | stable vertical slice | demo readiness gate |
| Animations/copy/icons | receipt moment and visual coherence | P2 | Low | Low | Low | stable screen flow | polish |
| Adjacent locked nodes | at most 2–3 honest future nodes | LOCK | Low | Low | Low | stable active path | nothing |
| Teacher LMS, auth, subjects, paths, diagnosis | broad scope | FUTURE/HIDDEN | High | High | High | validated core | nothing in demo |
| XP/leaderboard/coins | decorative gaming | REMOVE | Low | Low | Medium | none | distracts/core risk |

## Single greatest dependency

**Teacher-reviewed task-pair bank with a valid changed-representation relationship.** Without it, the Transfer Quest is only Question 2; then the receipt and controlled-evidence thesis collapse. This blocks the entire demo even if the UI is polished.
