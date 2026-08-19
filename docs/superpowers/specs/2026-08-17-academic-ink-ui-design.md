# Academic Ink UI Design

> **Status: Active supporting visual-design specification.** It is not current product/flow authority. Current Competition Demo behavior is governed by `docs/CURRENT.md` and v1.1 source-of-truth.

## Status

Approved visual direction from brainstorming. This spec covers visual redesign only; information architecture, copy intent, data contracts, and the existing student journey remain unchanged.

## Design Read

ThinkAI Kids is a serious learning tool for students and teacher/judge review. The visual language is academic/editorial warmth with a modern AI product feel: calm, readable, distinctive, and evidence-first. The chosen layout is the existing rail + main workspace pattern.

## Goals

- Make the next learning action obvious within the first viewport.
- Make the current skill, evidence state, and next step readable without explanation.
- Give ThinkAI a recognizable academic identity without gamification or a generic SaaS dashboard look.
- Preserve the current Vietnamese product language and the one-journey MVP flow.
- Keep visual hierarchy strong across desktop and narrow layouts.

## Non-goals

- No new navigation destinations, learning mechanics, scoring model, profile flow, or teacher dashboard.
- No XP, coins, leaderboard, streak, badges, progress percentage, or reward economy.
- No gradient, glassmorphism, glow, neon, illustration system, or decorative motion.
- No replacement of deterministic evidence/receipt behavior with visual assumptions.

## Visual System

### Color tokens

```text
primary / deep ink:   #173F4F
primary hover:        #102F3C
accent / coral:       #B85C38
accent hover:         #A94D2C
background / ivory:   #F7F5EF
surface:              #FFFDF8
surface secondary:    #EEF2F1
text primary:         #172029
text secondary:       #657078
border / outline:     #D8D8D0
success:              #2E7D5B
info:                 #3568A8
warning:              #B87918
error:                #B84A4A
```

Neutral ivory/white fills 70–80% of the interface. Ink carries navigation and major text at 15–20%. Coral and semantic colors stay below 10% and communicate action/state only.

### Typography

- Serif display face for hero/learning headings and important section titles. It should feel like a contemporary textbook, not ornate or old-fashioned.
- Sans-serif for navigation, buttons, labels, inputs, metadata, progress, and audit information.
- Use readable line lengths, text wrapping for headings, and explicit focus states.
- Use Vietnamese product vocabulary from `docs/design/competition-ui/vietnamese-product-language.md`.

### Shape and elevation

- Cards use `#FFFDF8`, 1px `#D8D8D0` border, 10–12px radius, and no shadow or a very light shadow.
- Buttons use 6–8px radius. Only tags/chips may be pill-shaped.
- Prefer one large workspace surface with internal sections over nested floating cards.
- Use borders, spacing, and type hierarchy before adding decoration.

## Layout

Keep the existing rail + workspace information architecture:

```text
┌───────────────┬────────────────────────────────────────────┐
│ Deep Ink rail │ warm ivory workspace                        │
│ logo          │ kicker + serif heading                      │
│ Trang chủ     │ explanatory lede                             │
│ Học           │ ┌──────── lesson surface ───────┐ ┌ path ┐  │
│ Tiến độ       │ │ focal skill + one coral CTA    │ │ steps│  │
│ profile       │ │ progress + evidence note       │ │      │  │
│               │ └───────────────────────────────┘ └──────┘  │
└───────────────┴────────────────────────────────────────────┘
```

Desktop reference is 1440px. At 1024px the rail may compact while keeping labels readable where space permits. At tablet widths, the rail becomes a top bar or drawer and the lesson surface precedes the path. Below 768px, keep the core interaction usable in one column.

## Screen Treatment: Continue Learning

The screen keeps the existing content and flow, with this hierarchy:

1. Kicker: `HÔM NAY · TIẾP TỤC HỌC` in coral, small sans uppercase.
2. Serif heading: `Tiếp tục từ ý tưởng bạn đang luyện.`
3. Short lede explaining that the next item uses the same idea in a new representation.
4. Lesson surface with `Quan hệ giữa bảng và đồ thị` as focal content.
5. One primary coral CTA: `Tiếp tục thử`.
6. Deep Ink progress indicator with text, never color alone.
7. Subtle secondary status surface: `Đã ghi nhận · 1 lần giải bài luyện` and the unverified condition.
8. Side path: `Bài luyện`, `Dạng mới`, `Ôn lại sau`, with text and markers for done/current/pending.

The side path describes evidence context rather than mastery or a score. `Ôn lại sau` only appears when its event/schedule is real, following the existing state rules.

## Component Rules

- Rail item: deep ink default, light surface active state, restrained hover, visible keyboard focus. Active state uses shape/surface plus text, not color alone.
- Primary button: coral, concise verb, stable width during loading, hover/focus/disabled/loading variants.
- Secondary button: outline or neutral ink treatment.
- Skill card: surface + border, focal title, short explanation, evidence status, one valid action.
- Progress: ink fill and text label; no percentage claim unless the underlying data supports it.
- Status: icon/text plus tinted surface; semantic color is supplementary.
- Inputs: 8px radius, clear border, ink focus ring, associated labels and inline error copy.
- Audit/detail surfaces remain available through receipt/history links and are not promoted into primary navigation.

## Motion and Accessibility

- Keep motion limited to state changes and deliberate reveals; animate transform/opacity only.
- Respect `prefers-reduced-motion` with an immediate state change.
- All icon-only controls have accessible labels; semantic HTML is preferred.
- Buttons are actions and links are navigation.
- Maintain visible `:focus-visible` treatment and logical tab order.
- Errors are adjacent to the affected control and preserve entered work.
- Do not use color as the only state indicator; pair it with text, icon, or shape.
- Use accessible names/alternatives for math charts and diagrams.

## Validation

- Verify the current screen at 1440px, 1024px, 768px, and a narrow mobile width.
- Verify the full journey remains `Trang chủ → Bài luyện → Gợi ý → Gửi bài → Thử vận dụng → Xác nhận kỹ năng → Tiến độ`.
- Verify no new IA, game economy, or unsupported evidence claim is introduced.
- Run TypeScript checks, relevant tests, and Playwright browser checks for the core student flow.
- Review changed UI files against the web interface guidelines before completion.

## Traceability

- Source brief: `docs/design/competition-ui/`
- Selected layout: `rail-workspace-v2` from the visual companion session.
- Selected visual direction: Academic Ink, approved in the user conversation on 2026-08-17.
- Related implementation task: `ThinkAI-4b8`.
