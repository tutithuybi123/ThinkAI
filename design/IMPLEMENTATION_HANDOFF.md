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

`Courses`, `Course Detail`, `Tasks`, `Library`, `Settings`, generic `Lesson`, and their generic Exercise/Results frames are legacy historical references. They are not canonical MVP screens, routes, or prototype destinations.

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
| `Progress / Linear` | Real course completion only. Never use for exercise question position. |
| `Callout / Learning` | One bounded explanatory region with a learning-emphasis edge. |
| `Outline / Item` | Secondary Lesson section navigation. |
| `Lesson / Row` | Course-sequence item; state remains neutral except current learning context. |
| `Exercise / Choice` | Independently selectable bounded answer option. Correctness remains explicit-text-first. |
| `Control / Switch` | Independent, immediate-apply binary preference; thumb position is meaningful. |
| `Control / Select` | Compact, immediate-apply preference control with an explicit current value. |
| `Answer / Input` | P0 answer entry with Default, Has value, Invalid, Submitting, and Retry states. |

Open rows in Courses, Tasks, and Library are a composition pattern, not a new
generic card or component requirement.

## Component State Matrix

| Component | Product states | Proven transient states |
| --- | --- | --- |
| Button / Primary | Default, Disabled | Hover, Pressed, Focus-visible |
| Text action | Default | Hover, Focus-visible |
| Navigation Item | Default, Active | Hover, Focus-visible |
| Lesson / Row | Completed, Current, Available | None designed |
| Exercise / Choice | Default, Selected, Correct, Incorrect, Disabled/submitted locked | Hover and Focus-visible for pre-submit Default only |
| Switch | Off, On | Hover, Focus-visible |
| Select | Default closed | Hover, Focus-visible, Open reference |

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
| `THINKAI / Content Title` | Semi Bold / 24 / 34 | Lesson and major learning-content heading. |
| `THINKAI / Body` | Regular / 16 / 24 | Readable primary and long-form lesson content. |
| `THINKAI / Secondary Body` | Regular / 15 / 22 | Supporting explanation. |
| `THINKAI / Label` | Semi Bold / 11 / 15 | Compact contextual label. |
| `THINKAI / Metadata / Caption` | Regular / 12 / 17 | Concise metadata only. |
| `THINKAI / Control` | Semi Bold / 14 / 20 | Buttons and controls. |

## Layout And Responsive Contract

- Desktop reference viewport is 1400 x 900 with a fixed 184px sidebar.
- At wide desktop, use a 48px content inset and preserve existing wide
  list-screen measures and Home's two-column composition.
- At compact desktop, retain the sidebar, reduce the inset to 32px, and
  collapse secondary columns before constraining focused reading/interaction
  content below its useful measure.
- Below the useful shell-plus-content measure, replace the sidebar with the
  approved 64px dark top bar and text `Menu` trigger; use a 16px page inset.
- Stack columns and let row actions wrap below their context when required.
  Do not convert rows to cards or shrink learning-body typography.
- On narrow Lesson layouts, relocate the outline into the normal reading flow
  below the header; do not create a drawer by default.
- Use shared components and responsive parent layout. There is no mobile-only
  component library, and the current mobile frames are feasibility references,
  not a requirement to implement every route at 390px.

Desktop frames are approved visual compositions. Their top-level absolute
placement should not be copied literally into code; implement the documented
shell, measures, stack behavior, and component Auto Layout intent instead.

## Surface, Progress, And Actions

Cards are not the default layout primitive. Prefer typography, alignment,
whitespace, and dividers before a bounded surface. A boundary is justified for
an independently interactive or semantically bounded entity such as Exercise
Choice, Learning Callout, Select, or Switch.

`Progress / Linear` means course progress. Exercise position remains explicit
text such as `Question 1 of 3`.

| Verb | Meaning |
| --- | --- |
| Start | Begin unstarted work. |
| Resume | Continue interrupted work. |
| Review | Revisit known work or feedback. |
| Open | Access a resource without a learning-flow verb. |
| Continue lesson | Resume the primary lesson flow. |
| Next question | Advance after submitted exercise feedback. |
| Review answers | Revisit submitted exercise responses. |

## Accessibility And Interaction

- Preserve visible keyboard focus: two-pixel `color/text/primary` outline on
  light surfaces and `color/text/on-navigation` outline on dark or green
  surfaces.
- `Check answer` remains visible and disabled until a valid choice exists.
- Exercise selection, correctness, navigation active state, and switch state
  must never depend on color alone.
- Select open state is a compact anchored option list. `System` is the current
  option in the approved reference. A framework-native accessible popover is
  acceptable when its visual output matches the Figma boundary, spacing, and
  current-selection marker.
- Controls need usable pointer/touch targets; implementation may improve
  semantic HTML and ARIA without changing the visual system.

## Content Boundary

Separate structural UI copy (navigation, headings, verbs), realistic demo data
(course, lesson, task, and resource names), and interaction-state copy
(`Selected`, `Correct answer`, `Not selected`). Do not encode exploration
labels or filler data as product logic.

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

The Figma MCP rate limit was reached before prototype links/start point could be written and verified. Treat all links above as implementation intent until the prototype write is completed; do not report prototype coverage as complete.

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
