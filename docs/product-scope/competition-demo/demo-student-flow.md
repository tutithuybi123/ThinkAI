# Demo student flow and states

> **Status: Historical v1.0 student flow.** v1.1 adds bounded Practice Companion, written-solution and hybrid-grading behavior; read current source-of-truth before implementing learner flow.

| Step | Learner sees/does | Server records/does | AI | Failure recovery |
|---|---|---|---|---|
| Home | `Tiếp tục thử` | derived home summary | none | load/error/retry |
| Practice | attempt or `Chưa biết bắt đầu`, input answer/reasoning | starts/resumes session, event | **live bounded reasoning feedback after deterministic score, before bridge**; explicit unavailable fallback | retain draft; neutral retry |
| Help | `Xem gợi ý` | immutable reviewed exposure event | may phrase feedback, not hint truth | fixed reviewed hint |
| Solve/bridge | submit then `Thử vận dụng` | deterministic score, then transition | labelled non-authoritative feedback **after score and before bridge** | show correction, no answer leak |
| Transfer | distinct workspace, no hint | isolated session, transfer score | no pre-score practice context | return to practice or reveal connection recovery only after policy allows |
| Reveal | see approved mapping | append exactly one reveal event | none | n/a |
| Receipt/progress | read result/unknowns | issue/read derived receipt/history | none | no receipt when not qualified |
| Audit/reset | presenter detail/reset | restricted audit and reset record | none | permission/error state |

UX wording/layout must follow `docs/design/competition-ui/`; no final Figma file/export was found in the repository, so its Markdown handoff is the active visual contract.
