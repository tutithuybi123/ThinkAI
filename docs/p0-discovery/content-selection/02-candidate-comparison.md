# Candidate Grade-10 micro-skill comparison

**Status:** candidate analysis only — not approved, not active content.  
**Provenance for every mini-package:** AI-generated project-team candidate, 2026-08-15; no copied exercise text; see `01-content-requirements.md` for the curriculum-verification limitation.

## Ranking summary

Scores use 1 (weak/risky) to 5 (strong) and are a product-team screening aid, not a teacher rubric.

| Rank | Candidate micro-skill | Math / transfer | Demo / visual | AI feedback | Deterministic / implementation | Teacher burden / misunderstanding risk | Total / 30 |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Find the gradient (rate of change) from two points in a linear relation | 5 | 5 | 5 | 5 | 4 | **29** |
| 2 | Evaluate a linear function for a given input | 4 | 3 | 4 | 5 | 5 | **26** |
| 3 | Determine the y-intercept of a line from its equation/graph | 3 | 4 | 3 | 5 | 4 | **23** |
| 4 | Construct `y=ax+b` from two given points | 4 | 4 | 4 | 2 | 2 | **16** |

## Candidate 1 — PREFERRED: gradient from two points

**Target micro-skill.** Determine a linear relation’s gradient as change in output divided by change in input: `m = (y₂ − y₁)/(x₂ − x₁)`.

**Practice task.** Render the exact candidate asset [`assets/practice-gradient-graph.svg`](assets/practice-gradient-graph.svg), then ask: `Quan sát đồ thị: đường thẳng đi qua A(1; 3) và B(4; 9). Hệ số góc của đường thẳng là bao nhiêu?`  
**Expected answer / score:** numeric `2` (normalization version to be assigned on eventual implementation).  
**Expected reasoning features:** reads two plotted coordinate pairs; subtracts y-values and x-values in a consistent order; divides the two changes. An optional explanation such as “y tăng 6 khi x tăng 3 nên hệ số góc là 2” is useful feedback input, not required proof.

**Practice interventions.**

| Level | Exact Vietnamese content | Exposes | Proposed tag | Intentionally does not reveal |
|---|---|---|---|---|
| 1 | `Hãy nhìn cả hai tọa độ. Khi đi từ A đến B, x thay đổi bao nhiêu và y thay đổi bao nhiêu?` | first useful comparison | `process` | formula, changes, division, answer |
| 2 | `Hệ số góc cho biết y thay đổi bao nhiêu ứng với mỗi 1 đơn vị thay đổi của x.` | conceptual meaning of gradient | `concept` | which subtraction to perform or any numbers |
| 3 | `Tính Δy = y_B − y_A và Δx = x_B − x_A, rồi lấy Δy/Δx.` | executable strategy | `strategy` | substituted values, intermediate values, final answer |

**Transfer task.** Render the exact candidate asset [`assets/transfer-gradient-table.svg`](assets/transfer-gradient-table.svg), then ask: `Bảng biểu diễn một quan hệ tuyến tính y theo x. Hãy xác định hệ số góc a của quan hệ.`  
**Expected answer / score:** numeric `3`.  
**Declared change dimension:** **representation** (coordinate-pair graph language → two-row input/output table), with a deliberately light contextual sentence only.  
**Why this is transfer:** the learner must recognise the constant relation from a tabular representation and calculate output change/input change; the transfer has a different arithmetic result (`3`, not the just-confirmed `2`), no equation, no graph, and no prior numbers/hints. It is not number substitution because the learner must move from reading a plotted line to inferring the invariant rate in a table. It remains near transfer, not evidence of general rate reasoning.

**Connection reveal.** `Ở bài luyện, ta đọc hai điểm trên đồ thị: y tăng 6 khi x tăng 3, nên 6/3 = 2. Ở bài mới, bảng cho các cặp (x, y): từ x = 2 đến x = 5, y tăng 9; 9/3 = 3. Cùng một quan hệ được dùng: độ thay đổi của y chia cho độ thay đổi của x.`  
**Candidate receipt wording.** `Bạn đã nộp đúng đáp án số cho bài vận dụng chưa từng hiển thị trước, không có gợi ý, về hệ số góc của quan hệ tuyến tính trong bảng. Điều kiện bài luyện và các gợi ý đã mở được ghi nhận. Chưa biết: kết quả này có ổn định ở các bài khác hoặc sau một khoảng thời gian.`

**Adversarial review / teacher-rejection reasons.** Both tasks still provide pairs, so a teacher may find graph→table insufficiently non-isomorphic despite distinct answers and arithmetic. The actual candidate graph/table assets must stay together with the prompts; a substitute visual could change difficulty. The pair assumes ordered-pair reading, division, and the taught term `hệ số góc`; teacher must confirm those prerequisites. A learner can memorize “y change over x,” so the teacher should judge whether the table really requires relation recognition rather than formula recall. Intervention 3 intentionally exposes strategy and might make practice too guided; it must be logged and must not convert the receipt into a claim about unobserved reasoning. Numeric scoring proves only the numeric response, not the stated reasoning; optional explanation must never change score.

**AI-feedback opportunity.** Strong: sign/reversal error; subtracting x/y in different orders; using `Δx/Δy`; identifying `8` but failing to divide by `4`; correct `2` with an explanation that calls it an intercept. The model can give bounded post-score feedback about the learner’s wording, while the numeric result stays authoritative.

## Candidate 2 — BACKUP: evaluate a linear function at one input

**Target micro-skill.** Substitute a given input into `f(x)=ax+b` and apply multiplication before addition.

**Practice task.** `Cho f(x) = −3x + 11. Tính f(2).`  
**Expected answer:** numeric `5`.  
**Expected reasoning features:** replaces x by 2, preserves the negative coefficient, calculates `−3×2+11`.

| Level | Exact intervention | Exposes | Tag | Does not reveal |
|---|---|---|---|---|
| 1 | `Trước hết, hãy thay x bằng giá trị được hỏi; giữ nguyên dấu và các phép tính.` | process of substitution | `process` | substituted expression/result |
| 2 | `f(2) là đầu ra của quy tắc f khi đầu vào là 2.` | input-output concept | `concept` | rule execution |
| 3 | `Viết f(2) = −3 × 2 + 11, rồi thực hiện phép nhân trước phép cộng.` | exact computation route | `solution_step` | final answer |

**Transfer task.** `Một máy tính nhận số x, nhân số đó với −3 rồi cộng 11. Khi x = 2, máy cho ra số nào?`  
**Expected answer:** numeric `5`.  
**Declared change:** representation (function notation → verbal input-output machine).  
**Why transfer:** function notation is absent and the learner must map words to the same affine rule; it is more than a number change, but close enough for a brief demo.  
**Connection reveal:** `“Nhân với −3 rồi cộng 11” chính là quy tắc f(x)=−3x+11. Cả hai bài cùng tìm đầu ra khi đầu vào là 2.`  
**Receipt:** `Bạn vừa tính đầu ra của cùng một quy tắc tuyến tính trong biểu diễn lời nói, ở bài mới không có gợi ý. Chưa biết: bạn có áp dụng ổn định quy tắc này ở các biểu diễn/bài khác không.`

**Adversarial review / rejection reasons.** The transfer text gives the operation sequence verbatim, so it may be an isomorphic rewrite rather than meaningful transfer—and may even be easier. The task also risks testing order of operations and negative multiplication more than function interpretation. Hint 3 is a near-worked step. This candidate is excellent for deterministic scoring but has a weaker “aha” moment and weak transfer claim. AI feedback can catch sign/order errors and explanations that confuse input/output, but may add little beyond reviewed hints.

## Candidate 3 — y-intercept from graph/equation

**Target micro-skill.** Identify the y-intercept `b` of a linear relation as its value when `x=0`.

**Practice task.** `Cho y = 2x − 3. Khi x = 0, y bằng bao nhiêu?`  
**Expected answer:** numeric `−3`.  
**Expected reasoning features:** sets x to zero; distinguishes intercept from gradient.

| Level | Exact intervention | Exposes | Tag | Does not reveal |
|---|---|---|---|---|
| 1 | `Điểm cắt trục Oy có hoành độ bằng 0.` | start condition | `process` | the intercept/result |
| 2 | `Trong y = ax + b, b là giá trị của y khi x = 0.` | relation | `concept` | b for this line |
| 3 | `Thay x = 0 vào y = 2x − 3.` | direct step | `solution_step` | final answer |

**Transfer task.** A graph asset of the line through `(0,−3)` and `(2,1)`: `Đường thẳng cắt trục Oy tại giá trị y nào?`  
**Expected answer:** numeric `−3`.  
**Declared change:** representation (symbolic equation → graph).  
**Why transfer:** requires linking a coordinate-axis feature to an equation’s zero-input meaning.  
**Connection reveal:** `Ở phương trình, x=0 cho y=−3. Trên đồ thị, điểm có x=0 nằm trên trục Oy, nên giao điểm cũng có y=−3.`  
**Receipt:** `Bạn vừa xác định giá trị ban đầu/y-intercept của một quan hệ tuyến tính ở biểu diễn đồ thị chưa thấy trước đó; chưa kiểm tra khả năng ở các dạng khác hoặc sau thời gian.`

**Adversarial review / rejection reasons.** The graph item can be much easier—visual reading without calculation—or ambiguous if tick marks/line thickness are poor. Candidate may test vocabulary (`trục Oy`) rather than the relation `x=0`; phrases that disclose it make transfer too cue-rich. Hint 1 is already close to the decisive relation. The visual is clear, but feedback opportunities are narrower (confusion with x-intercept or gradient). Teacher must decide whether this is sufficiently rich for ThinkAI.

## Candidate 4 — equation from two points (not recommended)

**Target micro-skill.** Determine `y=ax+b` from two points by finding gradient then intercept.

**Practice task.** `Đường thẳng qua (1;3) và (3;7) có phương trình nào?` with reviewed multiple-choice options, correct `y=2x+1`.  
**Expected answer:** constrained choice.  
**Expected reasoning features:** gradient, substitution for intercept, equation checking.

**Interventions:** (1) `Tách bài thành: tìm hệ số góc, rồi tìm giá trị b.` (`process`); (2) `Với y=ax+b, a là mức thay đổi của y theo x và b là y khi x=0.` (`concept`); (3) `Từ hai điểm, tính a; sau đó thay một điểm vào y=ax+b để tìm b.` (`strategy`). None gives actual values or answer.

**Transfer task.** A table with `(x,y)=(0,1),(2,5)`, four equation choices; answer `y=2x+1`.  
**Declared change:** representation (points → table).  
**Connection reveal:** `Cả hai biểu diễn đều cho hai cặp (x,y); cùng xác định a từ mức thay đổi và b từ một cặp phù hợp.`  
**Receipt:** `Bạn vừa lập quy tắc tuyến tính từ hai dữ kiện trong biểu diễn bảng chưa thấy trước đó; chưa biết mức ổn định ngoài cặp bài này.`

**Adversarial review / rejection reasons.** It combines at least two micro-skills and can be solved by testing choices, so the current scorer cannot verify the intended strategy. Transfer likely changes both representation and route/answer format. It is harder to explain in three minutes and imposes a higher teacher-review burden. AI feedback could be valuable, but that does not redeem the atomicity/scoring weakness.

## Decision

### Preferred candidate

**Find a linear relation’s gradient from a graph, then identify it in a table.** It best represents ThinkAI because the judge can see a genuine plotted-line representation become a table while the reveal makes the invariant `Δy/Δx` visible with distinct arithmetic (`6/3` and `9/3`). It supports recorded fixed help, an isolated no-hint transfer with a different answer, numeric scoring, and useful non-authoritative feedback on common strategy/execution errors. The principal educational-validity risk is that graph→table may still be too close or unequal in difficulty; a real Grade-10 teacher must reject/revise it if the final rendered assets or wording fail the near-transfer test.

### Backup candidate

**Evaluate a linear function at a specified input, equation notation → verbal input-output rule.** It is highly reliable technically but weaker as a transfer demonstration because the verbal rule can disclose the route.

Neither designation means approved, teacher-reviewed, seeded, or live.
