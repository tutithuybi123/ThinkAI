# ANTI_SLOP.md — Product UI Linter

## Purpose

This document prevents generic AI-generated UI patterns from entering the product by default.

"AI slop" means decorative or repetitive design decisions that make a screen look superficially polished while weakening:

- hierarchy;
- consistency;
- information density;
- usability;
- brand specificity;
- product credibility.

The correct response to slop is usually subtraction, not another styling layer.

---

## 1. Hard defaults

The following are banned by default in functional product UI unless the approved product language or requirement clearly justifies them.

### Decorative effects

- random gradients;
- blue/purple gradient blobs;
- glow around cards or buttons;
- glassmorphism used without layering/function;
- frosted translucent panels everywhere;
- colored drop shadows;
- excessive blur;
- shiny "premium" highlights;
- decorative noise textures on normal product surfaces.

### Container abuse

- card inside card inside card;
- wrapping every section in a rounded rectangle;
- one giant rounded "hero dashboard" container around the main page;
- separate tinted card backgrounds for every content category;
- arbitrary floating panels that do not express layering;
- putting text into a card when spacing alone would group it.

### Radius abuse

- pill-shaped normal buttons everywhere;
- huge radii on all containers;
- mixing many radii on one screen;
- rounded icon boxes for every icon;
- nested rounded containers with no hierarchy reason.

### Typography slop

- oversized headlines in routine product screens;
- uppercase eyebrow label above every heading;
- many font sizes with tiny differences;
- excessive bold text;
- muted low-contrast paragraphs used as decoration;
- decorative display typography in dense learning/task flows.

### Dashboard filler

- fake charts;
- fake metrics;
- fake activity;
- fake avatars;
- meaningless percentages;
- decorative spark lines;
- empty "insight" cards;
- statistics invented only to balance the grid;
- progress indicators when no real progress concept exists.

### Product-copy slop

Do not generate generic motivational filler such as:

- Unlock your potential
- Master your journey
- Take your learning to the next level
- Learn smarter, not harder
- Your success starts here
- Keep crushing it
- You're on fire
- Ready to level up?
- Discover what's possible

Use concrete product language instead.

### Illustration slop

- generic AI illustration used to fill empty space;
- random 3D object;
- mascot invented without a brand requirement;
- decorative character on every empty state;
- stock-style floating shapes around content;
- confetti for ordinary success states.

### Icon slop

- emoji as interface icons;
- mixed icon families;
- icons added to every label;
- icon bubble beside every section title;
- decorative icons with no semantic meaning.

---

## 2. Educational-app-specific traps

Do not automatically add:

- streak counters;
- XP;
- badges;
- trophies;
- leaderboards;
- flame icons;
- stars;
- daily quests;
- achievement banners;
- confetti;
- motivational banners;
- "AI tutor" sparkle icons;
- progress rings everywhere.

These are product features, not visual decoration.

Use them only if the product requirements actually contain the corresponding system.

Learning UI should first optimize:

1. what am I learning?
2. where am I?
3. what should I do next?
4. what is my state/progress?
5. what feedback did I receive?

---

## 3. "Premium" is not a visual primitive

Requests like:

- make it premium;
- make it modern;
- make it elegant;
- make it more engaging;
- make it beautiful;

must not automatically produce:

- gradients;
- glow;
- glass;
- huge whitespace;
- giant radius;
- floating cards;
- many subtle borders;
- tiny gray metadata;
- oversized typography.

Within an established product, improve quality through:

- better hierarchy;
- better alignment;
- better spacing;
- clearer copy;
- fewer competing elements;
- stronger component consistency;
- better states;
- more intentional density.

---

## 4. One reason per decoration

Before keeping a decorative treatment, name its job.

Valid jobs include:

- focus;
- hierarchy;
- state;
- grouping;
- navigation;
- affordance;
- feedback;
- brand.

If the only explanation is:

- "looks nicer";
- "adds visual interest";
- "fills the space";
- "feels premium";
- "makes it more modern";

remove or simplify it unless the user explicitly requested a decorative direction.

---

## 5. Surface test

For every card/container ask:

1. Is this an independent object?
2. Is it selectable/clickable?
3. Does it need separation from adjacent content?
4. Does it represent a reusable product entity?
5. Does the boundary improve comprehension?

If all are "no", try removing the card and grouping with spacing/alignment instead.

---

## 6. Pill test

Use pill geometry only when the element naturally benefits from a capsule shape, such as:

- compact status;
- tag/chip;
- filter;
- segmented choice;
- small toggle-like choice.

Do not default to pills for:

- normal primary buttons;
- large CTA buttons;
- cards;
- search bars;
- navigation rows;
- form fields.

Follow the approved component library if it intentionally differs.

---

## 7. Color test

Every non-neutral color must answer:

- Is it brand?
- Is it semantic state?
- Is it selection/focus?
- Is it data encoding with a real need?

If not, remove it.

Do not use different colors to make otherwise similar cards feel unique.

---

## 8. Density test

Do not equate large empty space with sophistication.

Ask:

- Does the spacing improve scanning?
- Does it communicate section hierarchy?
- Does it make important content easier to use?
- Is the screen becoming inefficient for its task?

Functional product UI should use intentional density.

Overview screens may breathe more.
Lesson, quiz, table, search, or workflow screens may be denser.

Both should use the same spacing system.

---

## 9. Copy test

Every line of UI copy should do at least one of:

- label;
- instruct;
- explain;
- confirm;
- warn;
- provide status;
- reduce ambiguity.

Delete filler.

Prefer:

- "Continue lesson"
- "3 questions remaining"
- "Due Friday"
- "No assignments yet"

over:

- "Keep the momentum going"
- "You're making amazing progress"
- "Stay focused and achieve more"

unless motivational language is explicitly part of the product's voice.

---

## 10. Reference fidelity test

When references are provided, do not imitate their entire aesthetic blindly.

For each reference identify what is being borrowed:

- density;
- hierarchy;
- navigation;
- card structure;
- typography mood;
- color behavior;
- interaction pattern.

Also identify what must not be borrowed.

A reference is evidence for a decision, not permission to collage unrelated styles.

---

## 11. Consistency test

Compare the screen to at least two relevant approved screens.

Flag any unexplained change in:

- page padding;
- content width;
- heading size;
- section gap;
- component padding;
- button geometry;
- card radius;
- border strength;
- shadow;
- icon size;
- icon family;
- accent usage;
- navigation treatment;
- empty-state style;
- tone of copy.

Any difference must be either:

1. required by content/function; or
2. already represented by an approved system variant.

Otherwise normalize it.

---

## 12. Slop score

Audit the finished screen across these dimensions.

Score each `0`, `1`, or `2`.

`0` = clean  
`1` = questionable  
`2` = clear problem

### A. Decorative excess

- effects without function;
- unnecessary gradients/glow/blur.

### B. Container excess

- too many cards;
- nesting;
- excessive rounded panels.

### C. Geometry inconsistency

- random radii;
- random control sizing;
- misaligned structure.

### D. Typography excess

- too many roles;
- oversized text;
- eyebrow-heading repetition.

### E. Color excess

- arbitrary accent colors;
- decorative tinting;
- weak semantic discipline.

### F. Filler content

- fake metrics;
- decorative charts;
- generic copy;
- invented data.

### G. Icon/illustration excess

- meaningless icons;
- icon bubbles;
- generic AI art.

### H. Cross-screen drift

- screen looks like a different product.

### Result

- `0–2`: pass
- `3–5`: revise
- `6+`: fail and simplify before continuing

A single severe cross-screen drift issue can fail the screen even if the numeric score is low.

---

## 13. Design critic output format

When reviewing a screen, report only actionable findings.

Use:

### SYSTEM DRIFT

- mismatch
- expected existing pattern
- proposed normalization

### HIERARCHY / UX

- issue
- why it hurts comprehension or interaction
- smallest fix

### AI SLOP

- offending pattern
- why it is unnecessary
- what to remove/simplify

### ACCESSIBILITY

- concrete issue
- fix

### VERDICT

- PASS
- REVISE
- FAIL

Do not redesign the entire screen during the critique pass.

Prefer the smallest changes that restore system coherence.

---

## 14. Automatic fail conditions

The screen is not complete if any of these are true without explicit justification:

- it introduces a new visual language;
- it introduces arbitrary new colors;
- it introduces arbitrary new radii;
- it recreates an existing component manually;
- it uses multiple unrelated icon styles;
- it wraps nearly every section in a card;
- it contains obviously fabricated dashboard data;
- it uses generic AI motivational copy as filler;
- it adds decorative effects merely to make the UI feel "premium";
- it was not compared with existing product screens.

---

## 15. Final removal pass

Before completion ask:

> What can be removed while preserving the product task?

Try removing, in this order:

1. decorative effects;
2. filler copy;
3. redundant badges/chips;
4. unnecessary icons;
5. unnecessary containers;
6. duplicate metadata;
7. excessive spacing;
8. secondary accents.

If the screen becomes clearer after removal, keep the simpler version.

The target is not minimalism for its own sake.

The target is **specific, coherent, useful product UI**.
