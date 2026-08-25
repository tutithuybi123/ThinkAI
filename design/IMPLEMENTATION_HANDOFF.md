# THINKAI Implementation Handoff

This is the implementation map for the approved PC-first THINKAI system. It
does not replace [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md); Figma remains the source
for exact variables, styles, component geometry, and approved screen output.

## Source Of Truth

Use this order when translating the UI:

1. Approved Figma variables.
2. Approved Figma text styles and component masters.
3. Canonical desktop production frames.
4. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for behavior and constraints.
5. This document for the implementation map.

Do not use exploratory frames, mobile audit frames, external references, or
taste-skill as visual sources.

## Canonical P0 Screen Inventory

The canonical Figma source is `P0 — Vietnamese competition MVP (canonical)`. All copy is Vietnamese. These production states supersede the old generic catalog and dashboard inventory.

| Surface | Required implemented states |
| --- | --- |
| `Trang chủ` | Active, first use/no active session, loading, load failure. |
| `Bài luyện` | Working, hint viewed, deterministic scored result, AI unavailable, submit recovery, loading. |
| `Cầu nối sau khi giải` | Solved practice context and transfer invitation. |
| `Thử vận dụng` | Intro, working, recovery, loading. |
| `Reveal mối liên hệ` | Available only after verified transfer success. |
| `Xác nhận kỹ năng` | Confirmed receipt with observed and not-yet-checked conditions. |
| `Tiến độ / Lịch sử` | Event-derived evidence path, no events, loading. |
| `Restricted presenter audit` | Complete provenance, loading, unavailable/retry. |

`Courses`, `Course Detail`, `Tasks`, `Library`, `Settings`, generic `Lesson`, and their generic Exercise/Results frames are legacy historical references. They are not canonical MVP screens, routes, or prototype destinations. In Figma they live on the separate `Legacy — Historical References` page.

## Product Flow

Use this as an information-flow map, not a URL contract:

```text
Trang chủ -> Bài luyện -> optional Xem gợi ý -> Kết quả chấm xác định
-> Cầu nối -> Thử vận dụng -> Reveal mối liên hệ -> Xác nhận kỹ năng
-> Tiến độ / Lịch sử

Primary learner destinations: Trang chủ, Học, Tiến độ
```

`Chi tiết lần làm` is restricted presenter/audit detail reached only from receipt or progress detail. It is not learner navigation. Do not infer router paths from frame names.

## Canonical Components

| Component | Purpose and semantic constraints |
| --- | --- |
| `Navigation / Item` | Persistent application-shell destination. Active alone owns the green marker. |
| `Button / Primary` | Compact contextual next-step action; editable label only. |
| `Callout / Learning` | One bounded explanatory region with a learning-emphasis edge. |
| `Answer / Input` | P0 answer entry with Default, Has value, Invalid, Submitting, Submitted, and Retry states. Submitted preserves the answer after scoring. |

The old course, exercise, settings, and list components remain frozen legacy
references; they are not scope for the competition MVP implementation.

## Component State Matrix

| Component | Product states | Proven transient states |
| --- | --- | --- |
| Button / Primary | Default, Disabled | Hover, Pressed, Focus-visible |
| Text action | Default | Hover, Focus-visible |
| Navigation Item | Default, Active | Hover, Focus-visible |
| Answer / Input | Default, Has value, Invalid, Submitting, Submitted, Retry | Focus-visible follows the existing input grammar |

Pointer input maps to hover and pressed. Keyboard input maps to
focus-visible. Persistent state maps to active, selected, current, or on.
Do not treat these as interchangeable.

## Variables And Styles

Map these exact Figma variable names to code tokens. Do not add aliases unless
the codebase needs a technical naming convention; retain the semantic role.

```text
color/canvas
color/navigation
color/text/primary
color/text/secondary
color/text/muted
color/text/on-navigation
color/text/navigation
color/accent
color/active
color/progress/track
color/divider
color/navigation-divider
color/surface/subtle

spacing/8, spacing/12, spacing/16, spacing/24, spacing/32, spacing/48
radius/control, radius/callout, radius/marker
```

Approved text roles are all Inter:

| Figma style | Weight / size / line height | Use |
| --- | --- | --- |
| `THINKAI / Page Title` | Bold / 31 / 43 | Page-level title. |
| `THINKAI / Section Title` | Semi Bold / 20 / 28 | Major content section. |
| `THINKAI / Content Title` | Semi Bold / 24 / 34 | Major skill, receipt, and learning-content heading. |
| `THINKAI / Body` | Regular / 16 / 24 | Readable prompt, explanation, feedback, and audit content. |
| `THINKAI / Secondary Body` | Regular / 15 / 22 | Supporting explanation. |
| `THINKAI / Label` | Semi Bold / 11 / 15 | Compact contextual label. |
| `THINKAI / Metadata / Caption` | Regular / 12 / 17 | Concise metadata only. |
| `THINKAI / Control` | Semi Bold / 14 / 20 | Buttons and controls. |

## Layout And Responsive Contract

- The desktop P0 reference uses a 1400px viewport, fixed 184px sidebar, and
  48px content inset.
- Practice and Transfer use a readable two-column desktop workspace: prompt on
  the left, answer/reasoning and action on the right. Long content grows in
  the main document scroll area; 900px is a reference viewport, not a clipping
  contract.
- Home, Bridge, Reveal, Receipt, Progress, and Audit retain shared content
  origin, restrained dividers, and bounded surfaces only where the evidence or
  interaction itself needs a boundary.
- Mobile remains P1 feasibility work. It must reuse the frozen grammar rather
  than create a second visual system.

## Surface, Progress, And Actions

Cards are not the default layout primitive. Prefer typography, alignment,
whitespace, and dividers before a bounded surface. A boundary is justified for
the Transfer explanation, labelled AI assistance, receipt evidence, or answer
entry, not for generic dashboard presentation.

| Verb | Meaning |
| --- | --- |
| Tiếp tục thử | Resume the active practice session. |
| Xem gợi ý | Open reviewed help without a penalty. |
| Gửi bài | Submit the preserved response for deterministic scoring. |
| Thử vận dụng | Begin the isolated new-representation step. |
| Thử lại | Retry after local recovery while preserving the draft. |
| Xem xác nhận kỹ năng | Open the rule-derived receipt. |
| Xem tiến độ | Open learner-facing evidence and history. |

## Accessibility And Interaction

- Preserve visible keyboard focus: two-pixel `color/text/primary` outline on
  light surfaces and `color/text/on-navigation` outline on dark or green
  surfaces.
- Deterministic score, AI availability, and input recovery must never depend
  on color alone; each uses visible Vietnamese text.
- Submitted answers remain visible and are no longer described as in progress.
- Controls need usable pointer/touch targets; implementation may improve
  semantic HTML and ARIA without changing the visual system.

## Content Boundary

Separate structural UI copy (navigation, headings, verbs), teacher-reviewed
Grade-10 task content, deterministic result language, and labelled secondary
AI assistance. Do not encode exploration labels, generic course/catalog data,
or filler content as product logic.

## P0 Feedback, Evidence, And Recovery

`Kết quả chấm xác định` is the primary authoritative result. `Nhận xét của ThinkAI · Hỗ trợ phụ` is bounded explanatory assistance only. An AI failure does not alter the score, event record, reviewed hint, transfer eligibility, or receipt conditions.

`Thử vận dụng` is isolated from the practice answer, hint, and reveal. It uses no new transfer color; the stage label, explicit isolation copy, and removal of the hint action establish the boundary. A transfer recovery state offers `Thử lại` and `Quay lại ôn` without revealing the relationship.

The receipt is rule-derived: practice evidence + transfer evidence + confirmed conditions. It must list both observed and untested conditions, not a mastery percentage. Learner history is plain-language and event-derived; audit detail may expose provenance/version IDs but remains a restrained document surface.

Loading preserves the local hierarchy. Submit recovery keeps the learner draft visible. Required errors are local: Home content load, practice submit, transfer submit, AI unavailable, and restricted audit unavailable.

## Prototype Coverage

Required learner prototype route:

`Trang chủ / Active → Bài luyện / Working → Gợi ý đã xem → Đã chấm → Cầu nối → Thử vận dụng / Intro → Working → Reveal → Xác nhận kỹ năng → Tiến độ / Lịch sử`.

Recovery routes:

- `Bài luyện / Recovery → Thử lại → Bài luyện / Working`.
- `Thử vận dụng / Recovery → Thử lại → Thử vận dụng / Working`.
- `AI unavailable → Cầu nối / Thử vận dụng`.
- `Tiến độ / Lịch sử → Restricted presenter audit → Quay lại tiến độ`.

The Figma prototype is wired and verified with one start point, `P0 learner flow`, at `Trang chủ / Active`. It contains 85 canonical P0 connections, including the happy path, explicit Practice and Transfer submission-recovery routes (`Gặp lỗi khi gửi? Thử lại` → their corresponding Recovery state), AI fallback, and the restricted audit return. No prototype destination points to a legacy frame. Active navigation items are intentionally static because Figma rejects a self-navigation link.

For canvas QA, all canonical P0 frames are normalized to `1400 × 1080` and arranged in a four-column flow grid. `1400 × 900` remains the reference desktop viewport; implementation must allow longer content to grow rather than clip it.

## Accessibility, Keyboard, And Motion

- Answer controls have visible labels, natural editing behavior, logical Tab order, nearby errors, and explicit retry actions.
- Math needs an implementation-level text alternative; long Vietnamese prompts, feedback, history, and audit values must wrap and own main-document scroll.
- Hint, submission, transfer, reveal, and audit-return controls are keyboard reachable by Tab plus Enter/Space as appropriate.
- Functional motion is limited to restrained ease-out hint expansion and progression transitions. Reduced motion uses instant/non-spatial changes; no information depends on animation.

## Out Of Scope

Do not create generic Courses, Tasks, Library, Settings, Course Detail, teacher LMS, chat, gamification, mastery dashboards, fake achievements, or new product-wide mobile routes for this competition MVP. Exact browser keyboard mechanics, semantic HTML/ARIA wiring, API integration, and responsive browser behavior remain implementation work.

## Anti-Drift Rules

Reproduce the approved system. Do not add a new palette, radius, shadow,
typography role, decorative content, generic cards, gradients, glow, status
pills, or a parallel component family merely to make an implementation feel
more complete. Follow [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and
[ANTI_SLOP.md](ANTI_SLOP.md) before extending anything.
