# AGENTS.md — Codex × Figma Product UI Rules

## Mission

Build and maintain a coherent multi-screen product UI in Figma.

The priority order is:

1. Product clarity
2. Cross-screen consistency
3. Reuse of the existing design system
4. Usability and accessibility
5. Visual quality
6. Novelty

Novelty must never override consistency.

The agent is not allowed to redesign the visual language independently on each screen.

---

## Required project files

Before product UI work, read:

- `DESIGN_SYSTEM.md`
- `ANTI_SLOP.md`

These files are project law.

If Figma and these documents disagree, inspect the approved existing Figma screens and variables before changing anything. Do not silently invent a third interpretation.

---

## Skill routing

Use the existing skills with one clear responsibility each.

### `taste-skill`

Use only for:

- initial visual direction exploration;
- comparing 2–3 visual directions;
- an explicitly requested redesign;
- marketing/landing surfaces where a new direction is genuinely needed.

Do not use it by default when extending an established product UI.

Once a visual direction has been approved, stop re-exploring style unless the user explicitly requests a redesign.

### `frontend-design`

Use for:

- creating or modifying product screens;
- component composition;
- layout;
- responsive behavior;
- interaction states;
- implementation-oriented UI work.

It must obey the existing Figma design system rather than inventing a new one.

### `web-design-guidelines`

Use as a review/audit pass after the screen exists.

Check:

- hierarchy;
- accessibility;
- readability;
- interaction clarity;
- responsiveness;
- consistency;
- common UX mistakes.

Do not let this review pass restyle the product.

### `playwright-cli`

Use only when the UI has a runnable web implementation and browser-level visual or interaction verification is useful.

Typical jobs:

- screenshots;
- responsive checks;
- overflow checks;
- visual regression checks;
- interaction verification.

### Other skills

Do not invoke unrelated skills merely because they are installed.

Use the minimum set needed for the task.

---

## Mandatory workflow for every established product screen

Follow this order.

### 1. Inspect before creating

Before editing or creating a screen:

1. Read `DESIGN_SYSTEM.md`.
2. Read `ANTI_SLOP.md`.
3. Inspect the target area in Figma.
4. Inspect existing variables and styles.
5. Search for reusable components.
6. Inspect at least two existing screens that are structurally or visually closest to the requested screen.
7. Identify which existing patterns can be reused.

Never start by drawing new UI from an empty frame when relevant product UI already exists.

### 2. State the reuse plan internally

Determine:

- existing shell/navigation pattern;
- page header pattern;
- layout/grid pattern;
- components to reuse;
- variables/tokens to bind;
- any genuinely missing component.

A new component is allowed only when existing primitives cannot represent the requirement cleanly.

### 3. Build from system primitives

Prefer this order:

1. existing component instance;
2. existing component variant;
3. composition of existing primitives;
4. new reusable component;
5. one-off frame only when the element is truly unique.

Use Auto Layout for UI structure unless there is a strong reason not to.

Use semantic Figma variables/styles rather than visually matching values by eye.

Do not detach component instances merely to make local styling easier.

### 4. Capture and critique

After a meaningful screen state exists:

1. capture a screenshot;
2. compare it with the two nearest approved screens;
3. run the anti-slop review;
4. run a consistency review;
5. fix mismatches;
6. capture again if meaningful changes were made.

Do not declare completion from the first render.

### 5. Cross-screen audit

Before considering a new screen complete, verify:

- application shell matches;
- page padding matches;
- content width behavior matches;
- typography roles match;
- section spacing matches;
- card treatment matches;
- control sizing matches;
- icon family and sizing match;
- border/radius treatment matches;
- elevation/shadow logic matches;
- empty/loading/error states use existing patterns;
- copy tone matches the product.

---

## Figma source-of-truth rules

### Search first

Before creating any reusable visual element, search Figma for an existing equivalent.

Never recreate an existing design-system component as a visually similar group of frames.

### Variables first

Do not introduce arbitrary raw values when a semantic variable exists for:

- color;
- spacing;
- radius;
- typography;
- sizing;
- elevation.

If the design system uses different token names than this repository documentation, preserve the real Figma names.

### Existing components win

If a component exists, use it.

If it almost fits:

1. check variants/properties;
2. check whether composition solves the problem;
3. only then propose extending the component.

Do not fork a component just to change appearance for one screen.

---

## Consistency budget

For an ordinary new product screen, the default budget is:

- new colors: `0`
- new typography styles: `0`
- new radius values: `0`
- new shadow styles: `0`
- new icon families: `0`
- new reusable components: `0–1` when genuinely required
- new layout patterns: `0–1` when genuinely required

Exceeding the budget requires a product/design reason, not a desire to make the screen look more interesting.

When a new primitive is approved, update the system rather than leaving it as an undocumented exception.

---

## Screen modification rules

When changing one existing screen:

- preserve the product shell;
- preserve established spacing rhythm;
- preserve component grammar;
- change only what serves the requested requirement;
- do not opportunistically redesign unrelated regions.

When a change would affect multiple screens, prefer updating the reusable component or system primitive instead of patching each screen independently.

---

## Visual direction rules

Once approved anchor screens exist, they define the product's visual grammar.

New screens must feel like additional pages of the same application, not new portfolio pieces.

Never use instructions such as the following as permission to redesign the system:

- "make it modern";
- "make it premium";
- "make it beautiful";
- "make it more engaging";
- "make it futuristic".

Interpret these requests inside the existing design language unless the user explicitly requests a new direction.

---

## Product UI over decoration

Every visual element should support at least one of:

- hierarchy;
- grouping;
- navigation;
- status;
- feedback;
- affordance;
- comprehension;
- brand recognition.

If an element exists only to make an empty area look "designed", remove it unless the product explicitly requires decorative art.

---

## Copy rules

Prefer concise product copy.

Avoid generic AI-generated marketing language inside functional product UI.

Bad examples:

- Unlock your potential
- Master your learning journey
- Level up your knowledge
- Discover a smarter way to learn
- Your journey starts here
- Ready to crush your goals?

Prefer concrete labels and useful instructions.

Do not invent fake statistics, testimonials, scores, progress, users, courses, teacher names, rankings, or activity data unless clearly marked as mock data and required by the design task.

---

## Accessibility baseline

At minimum verify:

- readable text contrast;
- clear interactive states;
- touch/click targets are not unnecessarily small;
- focus/selection is not communicated by color alone;
- text is not embedded into decorative imagery when normal text works;
- hierarchy remains understandable without shadows or decorative effects.

Accessibility fixes should remain consistent with the design system.

---

## Completion criteria

A UI task is complete only when all are true:

- requested functionality/information is represented;
- existing Figma components were searched before creating new ones;
- semantic variables/styles are used where available;
- no unexplained new visual primitive was introduced;
- the screen was visually compared with existing screens;
- `ANTI_SLOP.md` review passes;
- major consistency mismatches were fixed;
- the result looks like the same product at first glance.

The goal is not "a beautiful screen".

The goal is **a coherent product**.

---

## Visual references

For initial visual-direction exploration, read:

- `DESIGN-linear.app.md`
- `DESIGN-notion.md`

These files are references only, NOT the product source of truth.

Use `DESIGN-linear.app.md` primarily for:
- layout discipline
- hierarchy
- information density
- restrained surfaces
- borders/elevation
- precision

Use `DESIGN-notion.md` primarily for:
- content-first presentation
- readability
- calmer spacing
- warmer and less technical feeling

Do NOT merge their tokens mechanically.
Do NOT copy their branding, colors, landing-page patterns, or components blindly.

Before the product visual direction is approved:
- references may influence exploration.

After Home + Lesson are approved:
- approved Figma screens, variables and components become the source of truth;
- these reference files must no longer drive new styling decisions.