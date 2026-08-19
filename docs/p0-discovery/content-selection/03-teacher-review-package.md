# Teacher review package — candidate P0 content bundle

**Decision state:** `PENDING REAL TEACHER REVIEW`. This is a proposed candidate package, not an approved bundle and not an activation instruction.  
**Candidate version:** `content-discovery-gradient-v0.1` (2026-08-15).  
**Project task:** ThinkAI-ac5.2.  
**Provenance:** project-team/AI-generated candidate wording; no protected source item copied or adapted. Curriculum context: national 2018 General Education Mathematics programme (MOET Circular 32/2018/TT-BGDĐT); precise Grade-10/local-textbook alignment must be confirmed by reviewer. The configured Tavily research account was quota-limited during preparation; this does not lower the review requirement.

## 1. Proposed micro-skill and curriculum/context justification

**Micro-skill:** determine a linear relation’s gradient/constant rate from two `(x,y)` pairs by `Δy/Δx`.

**Why proposed:** the project’s v1.2 direction calls for one Grade-10 linear-function or comparable objectively scoreable micro-skill, only after teacher confirmation. This item family offers a short numeric response, visible graph/table representation change, and a clear post-score connection. It is a curriculum-alignment hypothesis, not a claim that the teacher has approved a lesson sequence.

## 2. Practice task, authoritative candidate answer, and rubric

**Practice visual and prompt (Vietnamese):** render [`assets/practice-gradient-graph.svg`](assets/practice-gradient-graph.svg) exactly (axes, unit ticks, labelled points, and line), then present:

> Quan sát đồ thị: đường thẳng đi qua A(1; 3) và B(4; 9). Hệ số góc của đường thẳng là bao nhiêu?

**Candidate authoritative answer:** `2` (numeric exact after approved normalization).  
**Working for reviewer:** `(9 − 3)/(4 − 1) = 6/3 = 2`.

**Candidate rubric (for teacher confirmation; not an automated free-text rubric):**

| Criterion | Evidence to accept pedagogically | Role in current MVP |
|---|---|---|
| Target relation | treats gradient as output change/input change between the two points | optional explanation/feedback only |
| Coordinate handling | preserves subtraction signs and pairs y with y, x with x | optional diagnostic feedback only |
| Calculation | obtains `6/3=2` | deterministic numeric score = authoritative |

An empty, alternate, or weak explanation must not override a correct numeric score. The teacher may recommend a constrained rubric later; it is not part of this candidate’s receipt policy.

## 3. Transfer task, answer, and same-target justification

**Transfer visual and prompt (Vietnamese):** render [`assets/transfer-gradient-table.svg`](assets/transfer-gradient-table.svg) exactly, then present:

> Bảng biểu diễn một quan hệ tuyến tính y theo x. Hãy xác định hệ số góc a của quan hệ.

**Candidate authoritative answer:** `3`.  
**Working for reviewer:** `(16 − 7)/(5 − 2) = 9/3 = 3`; the remaining table pair checks the same rate: `(22 − 16)/(7 − 5) = 6/2 = 3`.

**Same-target justification:** both items ask for the constant output change per input change in a linear relation using known pairs. The practice surface is a rendered coordinate graph with two labelled points; the transfer surface is a three-column table. The target relation, `Δy/Δx`, is unchanged, but the transfer uses distinct differences and correct answer (`3`, not `2`). Neither formula, practice numbers, help text, answer, nor connection mapping appears in the isolated transfer workspace before scoring.

**Declared change dimension:** `representation` (primary): coordinate graph/points → input-output table. The contextual sentence is intentionally non-substantive and must not be treated as a second target or required modelling skill.

## 4. Prerequisite analysis and risk controls

Expected prerequisites: reading an ordered pair and a simple coordinate graph, integer subtraction, division, and the course’s introduced meaning of gradient for a linear relation. The transfer must not require graph construction, equation construction, proportional reasoning beyond the defined rate, or real-world modelling. The candidate now uses positive coordinates to avoid negative-integer arithmetic as an unintended burden. The included graph asset labels axes, unit scales and points; the table asset has clear headings. Teacher must confirm these prerequisites and comparative difficulty at the exact curriculum point.

## 5. Three reviewed candidate interventions (practice only)

| Order | Exact text | Exposure tag | Information exposed | Explicitly withheld |
|---:|---|---|---|---|
| 1 | `Hãy nhìn cả hai tọa độ. Khi đi từ A đến B, x thay đổi bao nhiêu và y thay đổi bao nhiêu?` | `process` | first comparison | formula, values, division, answer |
| 2 | `Hệ số góc cho biết y thay đổi bao nhiêu ứng với mỗi 1 đơn vị thay đổi của x.` | `concept` | meaning of target relation | subtraction order, this item’s values, answer |
| 3 | `Tính Δy = y_B − y_A và Δx = x_B − x_A, rồi lấy Δy/Δx.` | `strategy` | general calculation strategy | substituted numbers, intermediate values, final answer |

The actual event record must store immutable intervention ID/text/version and opening time. No intervention is available during transfer. The teacher should decide whether level 3’s strategy disclosure is acceptable under the receipt conditions and whether tag order is sufficiently consistent.

## 6. Authored candidate connection reveal

> Ở bài luyện, ta đọc hai điểm trên đồ thị: y tăng 6 khi x tăng 3, nên `6/3 = 2`. Ở bài mới, bảng cho các cặp `(x, y)`: từ x = 2 đến x = 5, y tăng 9; `9/3 = 3`. Cùng một quan hệ được dùng: độ thay đổi của y chia cho độ thay đổi của x.

This reveal is only unlocked after transfer policy/scoring allows it. It must be independently versioned and reviewed; it is not live AI output.

## 7. Candidate Capability Receipt wording

> Bạn đã nộp đúng đáp án số cho bài vận dụng chưa từng hiển thị trước, không có gợi ý, về hệ số góc của quan hệ tuyến tính trong bảng. Điều kiện bài luyện và các gợi ý đã mở được ghi nhận. Chưa biết: kết quả này có ổn định ở các bài khác hoặc sau một khoảng thời gian.

This is deliberately conditional. It does not state mastery, learning gain, broad competence, retention, or a learner trait. Final receipt conditions must be derived by the existing receipt policy and cite actual event IDs/exposure records.

## 8. AI compatibility without model dependence

After deterministic practice scoring, a bounded feedback adapter could meaningfully distinguish: `Δx/Δy` reversal; inconsistent subtraction direction; sign error; correct rate with a mistaken explanation; or a learner who cannot name a first step. It must receive only allow-listed practice prompt/objective, bounded learner reasoning, and deterministic score outcome; it cannot see answer keys, transfer content/mapping, hints/tags, receipt data, or any authority state. It cannot score, change eligibility, or issue the receipt. The package works with no AI response because reviewed interventions and deterministic scoring remain sufficient.

## 9. Known risks requiring a teacher decision

1. Both items provide coordinate/value pairs, so the teacher must judge whether the rendered graph→table change is non-isomorphic and comparable in difficulty.
2. The transfer uses the term `hệ số góc` but does not disclose the calculation route; teacher should decide whether it is sufficiently recognition-demanding for the intended lesson.
3. Reading a graph and a table may have unequal representation load even with positive arithmetic.
4. Level-3 support may be too close to an algorithmic solution; exposure must be visible in audit and receipt language must remain conditional.
5. A numeric answer cannot establish productive reasoning; no such claim may be made.
6. Curriculum fit, terminology, graph conventions, and the exact grade/lesson placement remain unverified until a Grade-10 mathematics teacher records a decision.

## 10. Teacher checklist and decision record

Please mark each item and add corrections. A real teacher—not a project agent—must complete the decision block.

- [ ] Both tasks measure the same target relation/strategy.
- [ ] The declared change dimension is genuine, not only changed numbers.
- [ ] Neither item introduces an unintended prerequisite.
- [ ] Neither task or required visual is ambiguous.
- [ ] Answers and candidate rubric are mathematically correct.
- [ ] Interventions are correctly ordered by information exposure.
- [ ] No intervention accidentally reveals the full solution.
- [ ] The transfer is genuinely unseen and non-isomorphic enough for a near-transfer claim.
- [ ] The Capability Receipt wording is justified and does not overclaim.

**Teacher decision (manual only):** ☐ Approve  ☐ Approve with changes  ☐ Reject  
**Reviewer name/role:** ____________________  
**Date:** ____________________  
**Curriculum/textbook context checked:** ____________________  
**Required changes / reasons:** ________________________________________________  
**Approval/version/provenance record to create if approved:** ____________________

No checkbox above is currently checked. Approval must be recorded in the eventual reviewed-content workflow, then implemented as a new immutable version; this document itself cannot confer `approved` status.
