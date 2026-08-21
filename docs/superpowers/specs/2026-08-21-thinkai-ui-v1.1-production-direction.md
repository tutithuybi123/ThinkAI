# THINKAI KIDS UI-1 — Production Visual Direction

**Status:** Approved UI-1 direction. No production UI implementation is included.

## Product frame

THINKAI KIDS is an evidence-aware learning workspace for Vietnamese secondary-school learners. A learner practices with bounded help, demonstrates transfer independently, then receives a factual Capability Receipt. The interface must make the current action, result, and next truthful action obvious without turning learning into a dashboard or game.

The Figma P0 v1.1 prototype is authority for information architecture, product terminology, states, and boundaries. This direction evolves the presentation and interaction quality; it does not change authority, scoring, evidence, or content lifecycle rules.

## Approved visual grammar

- **Navigation dock:** one quiet, floating dark dock per desktop screen. It holds product identity, primary destinations (`Trang chủ`, `Học`, `Tiến độ`), current learning context, and the real action `Khám phá môn học`. The dock is the only elevated/floating surface in a normal screen.
- **Canvas:** pale neutral canvas with a single broad document/work surface. Use open layout, typography and dividers before cards.
- **Typography:** retain the approved Inter roles. Large titles are reserved for the current learning task or a rare factual outcome; do not add a display font or decorative editorial layer.
- **Surfaces:** use the approved subtle-learning surface for current learning and bounded help. Controls use the approved compact geometry. Do not create card grids, arbitrary pills, gradients, glow, mascots, or fake metrics.
- **Current path:** the learner's active MicroSkill is the main visual focus. A narrow rail provides context only; it must never compete with the task canvas.

## Content hierarchy

The intended hierarchy is:

```text
Subject → Topic / module → MicroSkill → reviewed Practice / Transfer task
```

`Lesson` is a task/content format inside a MicroSkill, not a universal navigation entity unless the backend later introduces it explicitly.

A MicroSkill is an observable, narrow capability, expressed as **verb + mathematical object + method/use**. A task is not a MicroSkill.

Example for Toán 10:

```text
Subject: Toán 10
Topic: Phương trình quy về phương trình bậc hai
MicroSkill: Phân tích tam thức bậc hai thành nhân tử để tìm nghiệm
Practice task: x² − 5x + 6 = 0
Transfer task: a changed-situation total/product problem, solved independently
```

The Grade 10 mathematics taxonomy should be teacher-authored from curriculum content, not inferred from a textbook chapter name or UI convenience. Relevant official domains include algebra/analysis, geometry/measurement, and statistics/probability.

## Navigation and subject discovery

`Học` is an active learning workspace, not a catalog:

- Default view: the published subject and current eligible MicroSkill, currently Toán 10.
- `Khám phá môn học` is a separate taxonomy view.
- The taxonomy may list planned subjects, but an unpublished subject shows only `Đang chuẩn bị`; it has no CTA, lock graphic, fake path, or implied availability.
- Once a subject has published content, it receives its own content-configured learning workspace. Subject-specific layouts can vary by content structure while retaining the shared shell, primitives and evidence rules.

## Core learner compositions

### Home / Resume

- Current subject/topic and a compact `Tiếp tục` action are primary.
- A factual next action and recent evidence sit in lighter secondary positions.
- Never show invented mastery scores, streaks or future content as if actionable.

### Learn / current path

- Left rail: active, next and later MicroSkills. It answers only “where am I?”
- Main canvas: current MicroSkill, brief concrete description, current Practice action and save status.
- `Khám phá môn học` remains secondary.

### Practice workspace

- Main column: prompt, answer entry, written solution, draft preservation and submission.
- Right rail: bounded Practice Companion only.
- Companion is a compact conversation: learner message, bounded AI reply, sending/loading/blocked/unavailable/retry states. It never decides scoring or transition.
- Practice feedback is visually secondary to the deterministic outcome.

### Adaptive multi-Practice sequence

Practice count is not fixed in the UI.

```text
Server-selected Practice task
→ learner submits
→ evidence is persisted and aggregated within the MicroSkill
→ non-pass: fresh reviewed Practice task
→ aggregate finding, only when server has sufficient evidence
→ aggregate pass: Transfer becomes available
```

Learner copy is concrete: `Bài luyện tiếp theo`, `Điểm cần củng cố`, `Thử vận dụng`. Never show `1/3`, a client-invented diagnosis, or a promised number of remaining tasks.

### Deterministic result and Bridge

- The primary outcome is short (`Đúng`, `Đúng một phần`, `Chưa thể xác nhận`) and has one local next action.
- A compact Evidence Journey may show where the learner is when evidence actually exists.
- Only the aggregate Practice gate opens Bridge to Transfer.
- Process Feedback may explain working but does not restate policy language on normal learner surfaces.

### Isolated Transfer

- Same navigation dock; intentionally quieter workspace.
- No Practice Companion, hints, Practice answer, transcript, reference solution or Process Feedback.
- A narrow independent-session rail says only what the learner needs: this is a new situation they do themselves.
- Transfer failure never reveals a relation or creates a receipt.
- If a fresh independent task exists, offer `Thử bài mới`; if exhausted, offer `Quay lại luyện` and state honestly that no new situation is available.

### Receipt, Progress and Audit

- **Capability Receipt:** factual claim plus the three-node Evidence Journey: Practice, independent Transfer, later revisit. It is not a certificate, score or mastery percentage.
- **Progress:** current evidence history and next truthful action, using the same journey grammar only where it clarifies evidence.
- **Restricted Audit:** separate staff-only document surface for provenance, policy/version and evidence history. Technical terms do not appear in normal learner flows.

## Responsive rules

- **Wide desktop:** floating navigation dock; narrow context rail only where it assists a learning task.
- **Compact desktop:** preserve the dock and primary nav. Move learning context beneath the dock instead of compressing nav labels.
- **Mobile:** approved dark top bar with wordmark and text `Menu`; navigation opens in document flow. Learning rails become sequential context above the task; Companion follows the task rather than consuming a fixed side column.
- Evidence Journey stacks vertically below the desktop width where three labels cannot remain readable.

## Motion rules

- Motion is functional and optional: button press feedback, dock/menu transitions, Companion loading/retry, and rare state reveals.
- Use CSS transitions for interruptible UI. Animate transform/opacity, not layout properties.
- Island/catalog hover is not part of the approved learner home. Where any hover affordance exists, gate it to fine pointers and provide no required hover-only information.
- Respect `prefers-reduced-motion`; no learning result or eligibility depends on animation.

## Explicit anti-patterns

- Generic SaaS dashboards, content-card grids, floating-island subject maps, oversized hero whitespace, decorative gradients, glow, mascots, XP, streaks, leaderboard, rewards, mastery percentages, fake locked content.
- Fixed Practice counts or UI-derived eligibility/diagnosis.
- Any help, content leak or visual continuity from Practice into Transfer.
- Technical evidence/policy/rubric language in learner copy.

## Required backend integration seams

The current implementation supports a reviewed pair bank and fresh Transfer selection, but the approved adaptive sequence requires a follow-up feature:

1. Server selects a fresh reviewed Practice task after each Practice non-pass.
2. Durable evidence aggregates across task instances in one MicroSkill.
3. The server returns a safe aggregate finding and next action only when sufficient evidence exists.
4. The aggregate gate, rather than a single task or fixed count, opens Transfer.

Tracked in Beads as `ThinkAI-gln`.

## UI-2 implementation scope

1. Build the shared dock, shell, type/spacing/token layer and responsive regimes.
2. Implement Home, current-path Learn and subject discovery against server view models.
3. Implement Practice workspace, draft/error handling and bounded Companion states.
4. Implement adaptive Practice sequence after the aggregate backend contract is available.
5. Implement deterministic outcomes, Bridge, isolated Transfer/recovery, Receipt, Progress and Restricted Audit.
6. Implement protected Ops screens with the same foundational tokens but denser utility layout.
7. Validate desktop, compact and mobile in a real browser; inspect console/network, keyboard focus and reduced motion.

## Sources consulted during direction work

- Ministry of Education and Training, Programme of General Education entry point: <https://moet.gov.vn/tin-tuc/chuong-trinh-giao-duc-pho-thong-moi>
- Grade 10 mathematics curriculum copy used to inspect topic/requirement structure: <https://navi.edu.vn/thu-vien/tai-lieu/chuong-trinh-moi-gdpt-2018-mon-toan-lop-10>
- Khan Academy learner-dashboard discussion, used only for layout research; no branding, gamification or visual asset is reused: <https://blog.khanacademy.org/meet-the-new-khan-academy-classroom-experience>
