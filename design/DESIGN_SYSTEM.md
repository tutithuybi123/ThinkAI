# DESIGN_SYSTEM.md — Product UI Source of Truth

## Purpose

This file defines how the product's visual language is governed.

The canonical source for exact values is the approved Figma design system:

1. Figma variables
2. Figma text/effect styles
3. Figma components and variants
4. approved anchor screens
5. this document as the behavioral contract

Do not duplicate token values here merely to give the agent more numbers to imitate.

If exact values already exist in Figma, use them directly.

---

## 1. Design-system policy

### Preserve before extending

For established UI:

- do not replace the existing palette;
- do not create a second spacing scale;
- do not create near-duplicate text styles;
- do not create one-off radii;
- do not introduce another icon family;
- do not fork components for cosmetic differences.

Extend the system only when a real product requirement cannot be expressed with existing primitives.

### One visual grammar

All screens must share the same:

- spacing rhythm;
- type hierarchy;
- control geometry;
- card/surface logic;
- border logic;
- elevation logic;
- icon language;
- navigation shell;
- feedback patterns.

Different screens may have different layouts. They must not have different design languages.

---

## 2. Anchor screens

Approved anchor screens are the strongest visual references for future work.

When anchor screens exist, the agent must inspect at least two relevant anchors before producing a new screen.

Choose anchors that represent different product situations, for example:

- a high-level overview screen;
- a dense content/lesson screen;
- a form or task screen;
- a result/status screen.

Do not create a new visual direction because an upcoming screen has different content.

If the product has not yet selected anchor screens, choose 1–2 strong existing screens with the user before freezing the system.

---

## 3. Color

### Semantic use

Use semantic roles, not arbitrary color picking.

Typical roles include:

- canvas/background;
- surface;
- elevated surface;
- subtle surface;
- primary text;
- secondary text;
- muted text;
- default border;
- strong border;
- brand/accent;
- success;
- warning;
- danger;
- information;
- disabled.

Use the actual Figma variable names if they already exist.

### Rules

- New screens may not introduce new colors by default.
- Accent color is for meaningful emphasis, not decoration.
- Semantic status colors are reserved for semantic status.
- Do not use several unrelated accent hues to make cards visually distinct.
- Do not put tinted backgrounds behind every section.
- Avoid gradients unless the approved system already uses them for a defined role.
- Do not reduce text contrast merely to make the UI look softer.

### Fallback only when no system exists

If starting from zero, establish a restrained semantic palette once, create Figma variables, approve it, then freeze it before scaling to more screens.

Do not continue choosing colors screen by screen.

---

## 4. Typography

### Use roles, not ad-hoc sizes

A product normally needs a small controlled set of roles such as:

- display — rare;
- page title;
- section title;
- component title;
- body;
- secondary body;
- label;
- caption/meta.

Use the real Figma text styles when available.

### Rules

- New screens may not introduce new typography styles by default.
- Do not vary font size merely to make every section feel unique.
- Do not mix multiple unrelated typefaces.
- Do not overuse very bold text.
- Do not use uppercase eyebrow text as a default section pattern.
- Use hierarchy through role, spacing, grouping, and contrast rather than arbitrary size jumps.
- Body text should remain comfortably readable.
- Product labels should be concise.

### Fallback only when no typography system exists

Create and approve one type scale first.

Then use named text styles everywhere.

---

## 5. Spacing

### Principle

Spacing is a system, not decoration.

Use existing Figma spacing variables whenever available.

### Hierarchy

Keep distinct concepts for:

- inline gap;
- control internal padding;
- component internal gap;
- component-to-component gap;
- section gap;
- page padding.

Do not let every container choose its own arbitrary padding.

### Rules

- Similar components must have similar internal spacing.
- Repeated sections should share a rhythm.
- Do not create giant empty gaps just to make a page feel premium.
- Dense functional screens may be denser than overview screens while still using the same spacing scale.
- Prefer Auto Layout gaps/padding over manual coordinates.

### Fallback only when no spacing system exists

Use a 4 px base grid and establish a small scale once.

A reasonable restrained starting scale is:

`4, 8, 12, 16, 20, 24, 32, 40, 48`

Do not add intermediate values casually.

Once Figma variables are created and approved, those variables become canonical.

---

## 6. Radius

Use a small number of semantic radius roles.

Suggested roles:

- control;
- card/surface;
- dialog/large surface;
- full/pill.

Use existing Figma variables if present.

### Rules

- Do not give every object a large radius.
- Nested containers should not each compete with different rounded corners.
- Full pill radius is for elements whose form/function benefits from it, such as tags, status chips, segmented choices, or compact filters.
- Normal buttons do not automatically need pill geometry.
- Decorative icon bubbles are not a reason to add another radius.

### Fallback only when no radius system exists

A restrained initial system can be:

- control: `8`
- card: `12`
- large surface: `16`
- full: `999`

Approve once and convert to variables.

Do not treat these fallback values as permission to override an existing Figma system.

---

## 7. Borders and elevation

### Default surface logic

Prefer clear layout, spacing, background contrast, and borders before adding shadows.

### Rules

- Standard cards should not require dramatic shadows.
- Do not use a unique shadow for each component.
- Floating UI such as menus, popovers, and modals may use an approved elevation style.
- Avoid colored/glowing shadows unless explicitly part of the brand system.
- Avoid combining border + strong shadow + tinted background + large radius on every card.
- Use elevation to communicate layering, not "premium feel".

If Figma has effect styles, use them.

---

## 8. Layout

### Application shell

The shell should be stable across screens where applicable:

- navigation placement;
- top bar;
- sidebar width;
- content origin;
- page padding;
- content max-width behavior.

A new page should not invent a new shell without a product reason.

### Page structure

Prefer clear hierarchy:

1. shell/navigation;
2. page header or primary task;
3. main content;
4. secondary/supporting content;
5. contextual actions.

Not every level requires a container.

### Grid and alignment

- Align related content to shared edges.
- Reuse column structures.
- Avoid arbitrary offsets.
- Use Auto Layout and grid constraints.
- Prefer consistent content widths over visually centering each section independently.

---

## 9. Surfaces and cards

A card is a grouping device, not the default representation of content.

Use a card when it meaningfully expresses:

- a reusable object;
- a selectable item;
- a bounded summary;
- a distinct interactive region;
- content requiring visual separation.

Do not use a card only because a section looks empty without one.

### Card grammar

All cards should derive from a small number of patterns.

Keep consistent:

- padding;
- radius;
- border;
- elevation;
- title hierarchy;
- metadata style;
- action placement.

Do not create a completely new card style for each content type.

---

## 10. Components

### Primitive component classes

Prefer a controlled library such as:

- Button
- IconButton
- Input
- TextArea
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Chip/Tag
- Tooltip
- Menu
- Dialog
- Toast
- Progress
- Avatar
- NavigationItem
- Breadcrumb

Use existing names and components if the Figma library already has them.

### Product components

Build product-specific reusable components only when repeated structure exists, for example:

- CourseCard
- LessonRow
- AssignmentItem
- QuizChoice
- ProgressSummary
- ActivityItem

Do not create product components just to wrap a one-off group.

### Variants

Prefer variants/properties over separate near-identical components for:

- size;
- state;
- emphasis;
- selected/unselected;
- icon presence;
- content density.

---

## 11. Icons and imagery

### Icons

Use one approved icon family unless the brand intentionally combines families.

Keep icon:

- stroke/fill language;
- optical weight;
- bounding-box size;
- alignment;
- semantic use

consistent.

Do not use emoji as interface icons.

Do not put every icon inside a colored rounded square/circle by default.

### Illustrations

Illustrations should have a clear product or brand role.

Do not add generic generated illustrations to fill empty space.

---

## 12. States

Reusable interactive components should account for relevant states:

- default;
- hover when applicable;
- pressed;
- focus;
- selected;
- disabled;
- loading;
- error.

Product flows should consider:

- empty;
- loading;
- error;
- partial data;
- completed/success.

Reuse existing state patterns before inventing new ones.

---

## 13. Responsive behavior

Responsive design should preserve the same visual grammar.

Do not turn mobile into a different art direction.

For each layout determine:

- what wraps;
- what stacks;
- what collapses;
- what becomes scrollable;
- what moves into overflow;
- what remains fixed.

Avoid solving responsiveness by simply shrinking everything.

---

## 14. Educational product guidance

For learning/productivity UI:

- prioritize content comprehension over decoration;
- make progress visible but not visually dominant everywhere;
- make the next action obvious;
- keep lesson/task content readable;
- use gamification only when it serves the product concept;
- do not automatically add streaks, XP, badges, rankings, confetti, mascots, or motivational slogans;
- do not fabricate learning statistics merely to fill dashboard space.

A calm and coherent screen is preferable to a busy "engaging" screen.

---

## 15. Change control

A design-system change is different from a screen change.

If a task appears to require a new:

- color;
- text role;
- radius;
- shadow;
- spacing value;
- icon family;
- base component;
- shell pattern;

first ask whether the existing system can solve it.

If not, treat it as an explicit system extension:

1. state the reason;
2. define the reusable role;
3. add/update the Figma primitive;
4. use it consistently;
5. update this document if the rule itself changed.

Never leave accidental one-off visual values behind.

---

## 16. Definition of consistency

Two screens are consistent when a user can infer they belong to the same product without relying on the logo.

Consistency comes from repeated decisions:

- same hierarchy language;
- same geometry;
- same spacing rhythm;
- same component behavior;
- same surface logic;
- same tone;
- same interaction patterns.

Do not solve consistency by making every page structurally identical.

The goal is **shared grammar, not cloned layouts**.

---

## 17. Approved THINKAI foundation (Home + Lesson)

The approved source of truth is now the Figma file's local foundations and anchors:

1. Figma variables
2. Figma text styles
3. Figma components and their real states
4. `Anchor — Home` and `Anchor — Lesson`
5. this document as the behavioral contract

The selected visual language is structured application chrome with content-first learning surfaces. It is warm without becoming editorial-heavy, and disciplined without reading as an admin dashboard.

### Canonical anchors

- `Anchor — Home` (`15:2`) establishes the overview composition: restrained dark navigation, current learning context, compact primary action, open continue-learning list, and an unboxed next-work column.
- `Anchor — Lesson` (`16:2`) establishes the content composition: the same shell and header grammar, readable lesson column, secondary outline, one bounded learning example, and simple previous/next navigation.
- `Direction C2 — Refined Balanced` (`11:2`) remains the exploration reference only; it is not a production screen.

### Semantic foundations

The local Figma collections are `THINKAI / Color`, `THINKAI / Spacing`, and `THINKAI / Radius`. Color roles cover the canvas, navigation, primary/secondary/muted text, navigation text, accent, active marker, progress track, divider, navigation divider, and subtle learning surface. Spacing roles cover the repeated 8/12/16/24/32/48 rhythm. Radius roles are limited to control, learning callout, and active marker.

Exact values remain in Figma. Do not add screen-specific colors, spacing values, radii, or shadows without a real product requirement and a corresponding semantic role.

### Typography roles

The anchors use Inter only. The frozen roles are Page Title, Section Title, Content Title, Body, Secondary Body, Label, Metadata / Caption, and Control. Body copy is intended for sustained reading; navigation and controls remain concise and sans-serif. Do not add a serif layer or extra editorial roles to Lesson.

### Shell and layout

- Desktop anchor frame: 1400 × 900.
- Navigation shell: 184px wide, dark and quiet; active state is a narrow green marker plus text weight, not a filled pill.
- Navigation uses linked `Navigation / Item / Default` and `Navigation / Item / Active` instances. Their editable labels preserve the fixed shell rhythm; the active marker is structural navigation state, not decoration.
- Main content origin: x=232px. Home and Lesson share page padding and alignment edges.
- Primary controls use the compact 160 × 40 geometry and restrained radius shown in Figma.
- Lesson content uses a readable primary column with a visually secondary outline. The outline is justified when a lesson has multiple sections; it should not become a dashboard rail.

### Responsive behavior

Responsive work rearranges the approved grammar; it does not create a mobile visual direction. No mobile production frame is approved by this section.

#### Layout regimes

- **Wide desktop** applies while the fixed 184px shell, 48px content inset, and the existing wide working canvas can coexist (roughly 1360px and above). Preserve the desktop shell, wide list measures, right-aligned row actions, Home's two columns, and Lesson's secondary outline rail.
- **Compact desktop** begins when the wide canvas no longer fits but the 184px shell can coexist with a focused 700px reading or sequence measure (roughly 960px to 1359px). Keep the shell, reduce the content inset to 32px, and collapse multi-column compositions into one content flow. Do not compress the reading or lesson-row measure to retain a secondary rail.
- **Mobile** begins below the point where a 184px shell and useful content measure can coexist (below roughly 960px). Replace the persistent sidebar with a compact dark top bar: wordmark plus an explicit text `Menu` trigger. The trigger reveals one in-flow, text-labelled navigation list directly below the bar, using the existing active marker and text-weight state. It is not a drawer, bottom sheet, icon tab bar, or a second navigation system.

These thresholds express content pressure, not device categories. The first mobile rendering pass may tune the exact hand-off if the approved content wraps earlier, but it must retain the three-regime model.

The first 390px representative frames confirm these hand-offs: the 1360px wide desktop canvas leaves 56px after the existing 1304px Home working edge, while the 960px compact shell leaves 44px after a 700px focused column. The documented breakpoints therefore remain appropriate.

#### Canvas, columns, and widths

- Use the existing spacing roles for page inset: 48px wide desktop, 32px compact desktop, and 16px mobile. Use 24px mobile top padding and preserve section gaps through the existing 24px/32px rhythm rather than desktop empty space.
- The approved 390px mobile top bar is 64px high. Its closed state contains only the THINKAI wordmark and the text `Menu` action; content begins after the existing 24px top gap. The temporary opened state confirms that the text-labelled navigation list appears directly beneath the bar in normal document flow.
- Product/list screens fill the available working canvas within their regime. Focused Lesson, Exercise, and Results content remains fluid up to its approved desktop reading or interaction measure; it never expands indefinitely and is not reduced through a smaller type role.
- Home stacks in this order: current course and its action, Continue learning, then Next work. The secondary column never becomes a carousel or a card.
- At 390px, the current-course action remains compact and content-width; Continue learning retains lightweight right-aligned text actions. Exercise uses the same `Button / Primary` instance at content width for its single dominant step action.
- Course Detail keeps course context and progress before the current lesson; its primary action moves below current-lesson context when it no longer fits beside it. The lesson sequence remains directly scannable in one column.
- Lesson moves the outline out of the right rail before that rail becomes narrow. For lessons with multiple navigable sections, render the existing outline as an in-flow section navigator below the lesson header and before reading content. Omit persistent outline navigation for a single-section lesson. Do not create a drawer or accordion by default.
- The three-item representative Lesson outline fits below the header without displacing the reading content from the initial viewport. It remains text-first and visually secondary; body typography is unchanged.

#### Rows, controls, and actions

- Open rows stay open. At narrow widths, title and metadata wrap naturally; retain useful metadata. A lightweight row action remains right aligned only while it does not constrain the title or metadata, then moves to the next line aligned with the row content. The divider follows the complete row. This applies to Courses, Tasks, and Library.
- Settings rows keep label and description together. On mobile, place a switch on the next line directly associated with that content; allow Select to fill the content width when a right-aligned control would create a cramped row. Do not redesign either control.
- The representative Settings frame validates stacked switch controls with a non-visual 40px hit area and a full-width existing Select control. Immediate-apply behavior remains unchanged.
- Keep compact primary buttons content-width when they are contextual, including the Home and Course Detail continue actions. On mobile, Exercise step actions may fill the content width because they are the single dominant step action; Results may give `Continue lesson` full width only when it is the sole primary action after the review list. Do not make every mobile action full width or sticky.
- Exercise choices fill the available interaction column without becoming oversized cards. Feedback remains directly below the relevant choices; Results stays an in-flow sequence of completion context, learning interpretation, review rows, `Review answers`, and `Continue lesson`.
- Keep the approved typography roles. Page titles may wrap naturally; do not introduce a mobile type scale or shrink long-form body copy to preserve a desktop arrangement.

#### Responsive implementation discipline

- The approved desktop anchors are positioned canvas compositions. Future responsive frames or implementation must recompose page sections into Auto Layout groups that can stack, fill the canvas, and hug content; do not scale or distort the fixed desktop geometry.
- The existing fixed-width desktop components establish visual rules. Mobile instances should use the same colors, text styles, borders, radius, and state semantics while their parent composition controls fill width, wrapping, ordering, and visibility of secondary rails. Do not add responsive-only visual variants unless a representative mobile screen proves a repeated need.
- `Button / Primary` now centers its label through its existing Auto Layout master, so both the 160px desktop instance and the expanded Exercise instance share one source. `Control / Select` already distributes its contents through Auto Layout. `Exercise / Choice`, Switch, Progress, Outline, and Navigation Item instances were reused without mobile-only variants.
- Preserve dividers where they aid row and sequence scanning. Do not add cards, elevation, bottom sheets, decorative mobile-only components, or horizontal content carousels.
- Interactive controls keep their approved visual geometry. Provide at least a 40px usable hit area for buttons, navigation controls, and text actions; switches retain their visual size but receive a non-visual vertical hit area when needed. This must not create visible padding drift.

No responsive tokens are required. The approved 48/32/24/16 spacing roles express the needed page and section behavior.

### Surface and content rules

Cards are not the default container. Use this order:

1. typography;
2. alignment;
3. whitespace;
4. subtle divider;
5. bounded surface only for a real semantic or interactive boundary.

The Home current-course area is an open composition with one semantic green vertical accent, progress, and one clear action. Continue-learning rows are grouped by alignment and dividers. Next work is an open secondary column. The Lesson example block is bounded because the surface improves comprehension; it is not a general card pattern.

The green accent is semantic only for primary actions, active navigation, links/actions, progress, current learning context, and limited learning emphasis. Course colors, decorative dots, arbitrary badges, fake metrics, charts, illustrations, gradients, glow, glass, and heavy shadows are out of scope.

### Content width, rows, and actions

Product/list screens use the wider working canvas while keeping related rows and dividers on a clear, scannable measure. Focused Lesson, Exercise, and Results screens retain a deliberately narrower reading or interaction column; Lesson may add a secondary outline only when it materially aids navigation.

Open rows are the default repeated-entity grammar: primary label, concise supporting context, optional right-aligned action or control, then a subtle divider when it improves scanning. Do not componentize an open row merely because it repeats.

Action vocabulary is semantic: `Start` begins unstarted work, `Resume` continues interrupted work, `Review` revisits known material, `Open` accesses a resource with no more specific learning-flow verb, `Continue lesson` resumes the main lesson flow, `Next question` advances an exercise, and `Review answers` revisits submitted responses. `View all` is reserved for collection-level disclosure, not a substitute for an object action.

Course completion uses `Progress / Linear` with explicit course context. Exercise position remains explicit text such as `Question 1 of 3`; it is not course progress. Completed lesson rows stay neutral and explicit-text-first. Green is reserved for the current lesson state.

### Frozen local component inventory

The current Figma library contains only patterns evidenced by both anchors or by a repeated semantic need:

- `Button / Primary` — compact contextual next-step action with an editable label and only `Default`, `Hover`, `Pressed`, `Focus-visible`, and `Disabled` states;
- `Progress / Linear` — track/value pair for real course completion;
- `Navigation / Item / Default`, `Hover`, `Active`, and `Focus-visible` — shell navigation states;
- `Callout / Learning` — bounded example/explanation with one edge accent;
- `Outline / Item` — secondary Lesson section navigation.
- `Lesson / Row` — course sequence row with only `Completed`, `Current`, and `Available` states. The component uses neutral row treatment, dividers, and the existing green semantic accent for the current state.
- `Exercise / Choice` — bounded interactive answer option with semantic `Default`, `Selected`, `Correct`, `Incorrect`, and `Disabled` states. Pre-submit `Default` alone also exposes `Rest`, `Hover`, and `Focus-visible` interaction treatments. It uses the existing control radius, dividers, muted text, subtle surface, and accent variables; it introduces no new feedback colors.
- `Control / Switch` — compact binary immediate-apply control with `On` and `Off` semantic states plus `Rest`, `Hover`, and `Focus-visible` treatment. Thumb position and the existing accent role communicate state; use only for independent settings.
- `Control / Select` — immediate-apply preference control with an editable value, restrained disclosure mark, and `Default`, `Hover`, and `Focus-visible` closed states. Use it when a compact explicit choice is needed; do not add a global Save action for this control.
- `Field / Multiline` — bounded multi-line written-solution/content field with `Empty`, `Has value`, and `Read-only` states. Reuse for learner written solutions and staff draft/preview content; bind to the existing canvas/subtle-surface, divider, text, spacing, and control-radius foundations. It is not a general-purpose card or chat surface.

Do not expand this inventory speculatively. Add a component only when a second real screen or interaction demonstrates the need.

### Exercise interaction states

Exercise answer choices are a permitted bounded-surface exception because each option is independently selectable. Before submission, selection is communicated by an accent border and explicit `Selected` text, not color alone. After submission, all answer borders return to the neutral divider treatment: `Your answer · Incorrect` identifies the learner's choice, while `Correct answer` identifies the valid choice. Correct answers may use the existing subtle surface for calm emphasis; brand green continues to mean selection or learning/action emphasis, never correctness. Disabled options use muted text with explicit `Not selected` copy.

Use one coherent `Callout / Learning` region for explanatory feedback where it improves comprehension. Its green edge remains learning emphasis rather than success status.

For this flow, `Check answer` is always visible and is disabled until a learner selects a valid choice. Its disabled treatment uses the existing progress-track surface, divider, and muted readable label, never an active-looking green fill. `Next question` is enabled after submitted feedback is available.

### Interaction-state grammar

Interaction treatment is a restrained modification of an existing component, not an alternate visual design. No interaction state adds glow, shadow, scale, gradients, or a new radius.

- `Button / Primary`: hover uses a fine on-accent border, pressed uses the existing secondary dark surface, focus-visible uses a stronger on-accent outline, and disabled uses the neutral track surface with a divider and muted text. Geometry and the green action role stay unchanged.
- Text actions: default remains a lightweight accent text action; hover adds an underline only; focus-visible adds a compact two-pixel outline. Hover does not gain a pill, background, or arrow.
- Navigation: hover raises the label to the existing on-navigation text color without adding the active marker. Active alone owns the green marker. Focus-visible uses a white outline without a marker, so keyboard focus is not confused with the current location.
- Exercise choices: before submission, hover uses only the existing subtle surface and focus-visible uses a dark two-pixel outline. Both remain distinct from the accent-border `Selected` state. Submitted choices are `Rest` only: correctness remains explicit-text-first and does not receive pointer feedback.
- Switch: hover and focus-visible use one- and two-pixel contextual outlines. Off remains neutral and On remains green; thumb position remains the primary structural state cue. Pressed is intentionally not represented because it adds no useful desktop distinction.
- Select: the closed control has a subtle-surface hover and dark two-pixel focus-visible outline. The temporary opened reference uses a compact bordered option list with no search, icons, modal, or shadow. The current option is identified by the existing green edge marker rather than a new checkmark treatment.

Focus-visible uses a consistent two-pixel outline with existing contrast-safe semantic colors: `color/text/primary` on light surfaces and `color/text/on-navigation` on dark or green surfaces. No new focus color variable was required. Pointer interaction uses hover/pressed; keyboard interaction uses focus-visible; persistent product state uses selected, active, or on. These meanings must not be conflated.

### Exercise completion results

Exercise completion is a focused learning summary, not a celebration or analytics surface. Keep the result concise in the header, then use a learning-oriented interpretation and neutral, divider-separated review rows to identify understood concepts and concepts needing review. Correctness and review remain explicit-text-first; do not introduce score cards, charts, status colors, or completion decoration.

### Settings controls

Settings reuse the open-row grammar from Tasks and Library: a concise section heading, left-aligned label and explanation, a right-aligned actual control, and a divider only where it improves scanning. Preferences represented by the current screen apply immediately. Do not add Save/Cancel actions, settings cards, decorative category icons, or disabled states unless an actual preference dependency is designed.

### Anti-slop contract

Do not compensate for removing containers with decorative styling. Reject filler copy, oversized CTAs, unnecessary pills, stacked card-inside-card layouts, arbitrary accent colors, fake progress, gamification filler, random icons, and premium-feeling whitespace that does not improve comprehension or hierarchy.

### Remaining ambiguity

The frozen desktop interaction grammar does not automatically create mobile-only visual variants; mobile behavior should reuse the same state semantics once an actual interaction is implemented. The icon family and any future status colors remain open; they must derive from the approved anchors rather than from the Linear or Notion reference files.

## 18. Canonical Vietnamese competition P0

The canonical product is the Vietnamese Grade-10 competition flow in Figma's `P0 — Vietnamese competition MVP (canonical)` section. It supersedes the generic Courses, Tasks, Library, Settings, generic Lesson, and generic Exercise frames as implementation sources. Those frames remain historical visual references only.

### Learner IA and screen grammar

The only ordinary learner destinations are `Trang chủ`, `Học`, and `Tiến độ`. `Chi tiết lần làm` is a restricted presenter/audit surface reached from a receipt or progress detail, never from normal learner navigation.

The canonical sequence is `Trang chủ → Bài luyện → (Xem gợi ý) → kết quả chấm → Cầu nối → Thử vận dụng → Reveal mối liên hệ → Xác nhận kỹ năng → Tiến độ / Lịch sử`.

Local first-use, loading, load-failure, submit-recovery, AI-unavailable, no-history, and audit-unavailable states are part of this same flow. Preserve learner drafts on submission failure; do not blank the workspace.

### Answer entry

`Answer / Input` is the one proven P0 component addition. Its real variants are `Default`, `Has value`, `Invalid`, `Submitting`, `Submitted`, and `Retry`. `Submitted` preserves the learner's answer after a deterministic result; it must not retain an in-progress message or imply that the answer can still affect the recorded result. Use the existing text, divider, subtle-surface, control-radius, and focus grammar. Errors are adjacent to the affected answer area and say what was interrupted plus the recovery action. Optional reasoning remains visually related but is not an invitation to collect unrestricted chain-of-thought.

### Deterministic result and AI assistance

Authoritative scoring is presented first under `Kết quả chấm xác định`. ThinkAI feedback is secondary, bounded, and labelled `Nhận xét của ThinkAI · Hỗ trợ phụ`. AI assistance may explain; it never changes a score, transfer eligibility, evidence record, or receipt. If AI is unavailable, preserve the deterministic outcome, reviewed hint availability, and next action.

### Transfer and receipt semantics

`Thử vận dụng` is a distinct, isolated new representation, not question two. It has no hint control and does not expose a prior answer or reveal. The existing green accent remains reserved for action, active state, and limited learning emphasis. No distinct transfer color is needed: stage label, explicit copy, isolation note, and neutral surface communicate the semantic boundary.

`Xác nhận kỹ năng` exists only when observed practice and transfer evidence meet the rule-derived conditions. It states both `Đã ghi nhận` and `Chưa kiểm tra`; it is not a score, mastery percentage, certificate, or decorative achievement. Learner progress translates events into a small evidence path and plain-language history. The restricted audit may show versioned provenance, but does not become an admin dashboard.

### Long content, accessibility, and motion intent

The main document/content area owns vertical scroll. A 1400 × 900 reference frame is a viewport, never permission to clip long prompts, Vietnamese feedback, history, or audit data. Use local loading treatments that retain hierarchy; do not introduce a global skeleton library by default.

Keyboard intent is logical Tab order; Enter/Space activate buttons and text actions; natural text editing remains available in answer controls; retry, reveal, and audit return are keyboard reachable. Controls retain visible focus, explicit non-color correctness/state text, readable Vietnamese measures, and implementation notes for mathematical alternatives.

Motion is functional only: hint expansion, a restrained feedback/bridge/reveal state transition, and optional receipt appearance may use a fast ease-out. No bounce, scale-pop, animated gradient, or motion-required information. With reduced motion, the equivalent transition is instant/non-spatial and the full sequence remains understandable.

The canonical Figma prototype has exactly one learner start point: `P0 learner flow` at `P0 — Trang chủ / Active`. It covers the happy path, local practice and transfer recovery, the AI-unavailable continuation, and the restricted audit return. No P0 prototype destination may target a legacy generic frame; active navigation items are intentionally static self-destinations. Legacy generic frames are retained only on Figma's separate `Legacy — Historical References` page.
