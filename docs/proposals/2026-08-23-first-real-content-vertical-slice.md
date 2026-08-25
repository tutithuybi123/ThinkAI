# THINKAI v1.1 — Thiết kế lát cắt nội dung thi đầu tiên

> Trạng thái: review-only. Tài liệu này không phải nội dung đã được nhập vào Ops,
> chưa được đưa vào lifecycle và chưa được xuất bản.

## Mục tiêu demo

Chứng minh luận điểm sản phẩm trung tâm:

> Thành công trong Practice có hỗ trợ không tự động đồng nghĩa với năng lực độc lập.
> Bằng chứng capability chỉ xuất hiện sau một Transfer mới, cô lập và được xác minh.

Lát cắt cần đủ ngắn để demo trực tiếp, nhưng đủ khác biệt để Practice và
Transfer không trở thành hai bài cùng khuôn chỉ đổi số.

## Các MicroSkill đã cân nhắc

| Hạng | MicroSkill | Đánh giá |
| --- | --- | --- |
| 1 | Xác định dấu của tam thức bậc hai từ hai nghiệm và dấu của hệ số `a` | Tốt nhất: Companion có ích, Transfer đổi biểu diễn rõ, rubric ngắn và đáng tin. |
| 2 | Giải bất phương trình bậc hai bằng bảng xét dấu | Giá trị toán cao nhưng đáp án khoảng tạo nhiều biến thể text khi chấm. |
| 3 | Dùng `Δ` để xác định số nghiệm phương trình bậc hai | Dễ chấm nhưng AI hỗ trợ ít giá trị và Transfer dễ thành đổi số. |
| 4 | Xác định đỉnh và chiều mở của parabol | Nhanh, trực quan nhưng chưa đủ mạnh để chứng minh capability. |
| 5 | Dùng Viète để suy ra dấu, tổng và tích nghiệm | Hữu ích nhưng cần nhiều tiền đề hơn, không tối ưu cho demo ngắn. |

## Quyết định

### Metadata

| Trường | Nội dung |
| --- | --- |
| Môn học | Toán 10 |
| Chủ đề | Dấu của tam thức bậc hai |
| Kỹ năng nhỏ | Xác định dấu của tam thức bậc hai từ hai nghiệm và dấu của hệ số `a` |
| Mục tiêu review | Học sinh xác định được một điểm nằm trong/ngoài hai nghiệm, kết hợp đúng chiều mở của parabol để suy ra dấu của tam thức tại điểm đó. |
| Practice gate | `requiredCorrectCount: 2`, `maxPracticeItems: 3` |

Nội dung bám phạm vi hàm số/tam thức bậc hai Toán 10 trong CTGDPT 2018. Tham
chiếu: [Bộ GD&ĐT — Chương trình giáo dục phổ thông](https://moet.gov.vn/tin-tuc/chuong-trinh-giao-duc-pho-thong-moi).

### Vì sao đây là lát cắt mạnh nhất

- Practice có thể hỗ trợ learner xây dựng quy tắc: vị trí của `x` so với hai
  nghiệm, rồi mới xét dấu của `a`.
- Transfer không cho biểu thức phân tích nhân tử; learner phải nhận ra cùng quy
  tắc từ hai nghiệm và chiều mở của parabol.
- Cùng MicroSkill, nhưng khác biểu diễn và có dấu kết luận khác, nên không thể
  chỉ chép đáp án Practice.
- Bài giải ngắn đủ cho rubric reviewed; Transfer chứng minh lập luận chứ không
  chỉ đoán một trong hai dấu.

## Quy tắc Practice gate

`2/3` nghĩa là learner cần hai evidence `CORRECT` khác nhau. Bài thứ ba là
recovery khi một Practice bị sai/partial/uncertain. Browser không đếm hay quyết
định gate; server quyết định `CONTINUE_PRACTICE`, `PRACTICE_RECOVERY` hoặc
`READY_FOR_TRANSFER`.

## Pair bank

| Cặp | Practice | Transfer | Biến đổi bề mặt |
| --- | --- | --- | --- |
| 1 | Dạng nhân tử, `a > 0`, điểm nằm giữa hai nghiệm | Hai nghiệm + parabol mở xuống | Từ công thức sang đọc đồ thị bằng lời |
| 2 | Dạng nhân tử, `a < 0`, điểm nằm giữa hai nghiệm | Hai nghiệm + `a > 0` | Buộc nhận ra dấu `a` đảo quy tắc |
| 3 | Dạng nhân tử, điểm ở ngoài hai nghiệm | Hai nghiệm + parabol mở xuống | Buộc phân biệt vùng ngoài và vùng giữa |

Mọi Transfer đều công bằng nếu server chọn; chúng kiểm tra cùng ý tưởng chứ
không phụ thuộc việc learner đã nhìn thấy cặp Practice nào. Không Transfer nào
lặp lại bộ hai nghiệm, điểm xét hoặc mẫu số cụ thể của Practice cùng cặp.

## Practice 1 — Điểm nằm giữa hai nghiệm

### Đề bài

> Cho `f(x) = (x - 1)(x - 5)`. Không nhân trực tiếp hai thừa số, hãy xác định
> dấu của `f(3)` và giải thích ngắn gọn.

### Kỳ vọng và lời giải

Kết luận: `f(3) < 0`.

Vì `3 - 1 > 0` và `3 - 5 < 0`, hai thừa số trái dấu nên tích âm.

### AnswerSpec và rubric

- Answer type: `written_solution`.
- Kết quả mong đợi: `f(3) < 0`.
- Bài giải tham khảo: nội dung lời giải ở trên.
- Các tiêu chí required (đánh giá evidence, không bắt buộc lặp đúng câu chữ):
  1. Có căn cứ toán học đúng cho việc `3` thuộc vùng giữa hai nghiệm.
  2. Nêu đúng quan hệ dấu phù hợp: hai nhân tử trái dấu **hoặc** tam thức có
     hệ số đầu dương âm trong khoảng giữa hai nghiệm.
  3. Suy ra đúng `f(3) < 0` từ căn cứ trên.

Partial: có ý xét dấu nhưng thiếu một bước hoặc ký hiệu chưa đầy đủ.
Không đạt: xác định sai vùng hoặc kết luận dấu sai.

### Misconceptions và guidance

- Nhầm rằng `a > 0` thì tam thức luôn dương.
- Không so sánh `x` với hai nghiệm.
- Nhân máy móc thay vì nhận ra cấu trúc dấu.

## Practice 2 — Hệ số đầu âm đảo dấu

### Đề bài

> Cho `g(x) = -2(x + 1)(x - 3)`. Không tính giá trị số của biểu thức, hãy xác
> định dấu của `g(0)` và giải thích.

### Kỳ vọng và lời giải

Kết luận: `g(0) > 0`.

`0` nằm giữa `-1` và `3`. Khi đó `(0 + 1)(0 - 3) < 0`; nhân với `-2 < 0`
làm dấu đổi thành dương.

### AnswerSpec và rubric

- Answer type: `written_solution`.
- Kết quả mong đợi: `g(0) > 0`.
- Các tiêu chí required:
  1. Có căn cứ đúng cho việc `0` ở giữa hai nghiệm.
  2. Nhận ra đúng tác động của hệ số đầu âm: quy luật dấu bị đảo, hoặc tích
     trong ngoặc âm rồi nhân với số âm thành dương.
  3. Suy ra đúng `g(0) > 0`.

### Misconceptions và guidance

- Quên hệ số `a < 0` làm đảo dấu.
- Kết luận “ở giữa hai nghiệm luôn âm”.
- Chỉ xét hai ngoặc mà bỏ qua hệ số đứng trước.

## Practice 3 — Điểm ở ngoài hai nghiệm

### Đề bài

> Cho `p(x) = 3(x + 4)(x - 2)`. Không nhân trực tiếp hai thừa số, hãy xác
> định dấu của `p(-5)` và giải thích.

### Kỳ vọng và lời giải

Kết luận: `p(-5) > 0`.

`-5 < -4 < 2`; hai thừa số đều âm nên tích dương. Nhân với `3 > 0` vẫn dương.

### AnswerSpec và rubric

- Answer type: `written_solution`.
- Kết quả mong đợi: `p(-5) > 0`.
- Các tiêu chí required:
  1. Có căn cứ đúng cho việc `-5` thuộc vùng ngoài hai nghiệm.
  2. Nêu đúng quan hệ dấu ở vùng ngoài với hệ số đầu dương: hai nhân tử cùng
     dấu **hoặc** tam thức cùng dấu với hệ số đầu.
  3. Suy ra đúng `p(-5) > 0`.

### Misconceptions và guidance

- Nhầm vùng ngoài luôn âm.
- Không phân biệt vùng giữa và ngoài hai nghiệm.
- Nhầm hai số âm nhân nhau là âm.

## Bounded Practice Companion

Mọi assistance chỉ chạy trong Practice. Một interaction chỉ nên đưa một bước
tiếp theo, không đưa kết luận.

| Cấp độ | Được phép |
| --- | --- |
| Prompt | “Em hãy xác định điểm đang xét nằm ở đâu so với hai nghiệm.” |
| Conceptual hint | “Với hai nghiệm đơn, dấu của tam thức thay đổi khi đi qua mỗi nghiệm.” |
| Strategic hint | “Hãy chia trục số thành ba vùng: bên trái, ở giữa và bên phải hai nghiệm; sau đó mới xét dấu của `a`.” |
| Strong scaffold tối đa | “Đừng tính toàn bộ giá trị. Hãy xét dấu từng thừa số rồi nhớ hệ số đứng trước có thể làm đổi dấu.” |

Ví dụ chấp nhận được:

> Em thử đánh dấu hai nghiệm trên trục số trước. Điểm đang xét thuộc vùng nào:
> ngoài hay giữa hai nghiệm?

Ví dụ bị cấm:

> Vì `3` nằm giữa `1` và `5`, nên `f(3) < 0`.

Hoặc:

> Đáp án là `g(0) > 0`.

## Transfer 1 — Đọc từ nghiệm và chiều mở

### Đề bài

> Đồ thị `y = q(x)` cắt trục hoành tại `x = -7` và `x = 4`, đồng thời parabol
> mở xuống. Không cần biết công thức của `q(x)`, hãy xác định dấu của `q(-2)` và
> giải thích.

### Kỳ vọng và lời giải

`q(-2) > 0`. Vì `-2` nằm giữa hai nghiệm `-7` và `4`; parabol mở xuống nên đồ thị nằm phía
trên trục hoành giữa hai nghiệm.

### Rubric required

1. Có căn cứ đúng cho việc `-2` nằm giữa hai giao điểm `-7` và `4`.
2. Nêu đúng ý nghĩa hình học: với parabol mở xuống, phần giữa hai nghiệm ở
   phía trên trục hoành.
3. Suy ra đúng `q(-2) > 0`.

**Transfer distance:** Practice có biểu thức nhân tử; Transfer chỉ có nghiệm và
chiều mở. Learner phải nối “dấu tam thức” với “đồ thị trên/dưới trục hoành”.

## Transfer 2 — Không có biểu thức nhân tử

### Đề bài

> Tam thức `h(x)` có hai nghiệm `6` và `9`, hệ số của `x²` dương. Hãy xác định
> dấu của `h(7)` và giải thích.

### Kỳ vọng và lời giải

`h(7) < 0`. Vì `7` ở giữa `6` và `9`; khi `a > 0`, tam thức âm giữa hai nghiệm.

### Rubric required

1. Có căn cứ đúng cho việc `7` nằm giữa hai nghiệm.
2. Dùng đúng quy tắc dấu khi hệ số bậc hai dương.
3. Suy ra đúng `h(7) < 0`.

**Transfer distance:** learner không còn thấy `(x + 1)(x - 3)`; phải tái tạo
quy tắc từ nghiệm và dấu của `a`.

## Transfer 3 — Vùng ngoài, parabol mở xuống

### Đề bài

> Parabol `y = r(x)` cắt trục hoành tại `x = 10` và `x = 14`, đồng thời mở
> xuống. Hãy xác định dấu của `r(8)` và giải thích.

### Kỳ vọng và lời giải

`r(8) < 0`. Vì `8` nằm ngoài khoảng giữa hai nghiệm; parabol mở xuống nằm
dưới trục hoành ở các vùng ngoài.

### Rubric required

1. Có căn cứ đúng cho việc `8` thuộc vùng ngoài hai giao điểm, về phía trái.
2. Nêu đúng quan hệ hình học với parabol mở xuống ở vùng ngoài.
3. Suy ra đúng `r(8) < 0`.

**Transfer distance:** learner phối hợp hai ý “ngoài hai nghiệm” và “mở xuống”;
không thể sao chép đáp án Practice.

## Reveal sau Transfer

Shared relation cho cả ba cặp:

> Vị trí của `x` so với hai nghiệm và dấu của hệ số `a` quyết định dấu của tam
> thức bậc hai.

### Reveal 1 — Một quy tắc, hai biểu diễn

> Trong Bài luyện, em xét dấu từ biểu thức đã phân tích thành nhân tử. Trong
> Bài vận dụng, em không có công thức nhưng vẫn có hai nghiệm và chiều mở của
> parabol.
>
> Điều không đổi là vị trí của `x` so với hai nghiệm và dấu của `a`. Khi parabol
> mở xuống, vùng giữa hai nghiệm nằm phía trên trục hoành.

### Reveal 2 — Đừng quên dấu của `a`

> Hai nghiệm chỉ cho biết các vùng cần xét; dấu của `a` mới quyết định vùng nào
> dương, vùng nào âm.
>
> Với `a > 0`, tam thức âm giữa hai nghiệm. Với `a < 0`, quy luật đảo lại.

### Reveal 3 — Vùng ngoài cũng mang thông tin

> “Ngoài hai nghiệm” không có nghĩa luôn dương hoặc luôn âm. Dấu ở vùng ngoài
> phụ thuộc vào chiều mở của parabol.
>
> Em vừa dùng cùng một quy tắc ở hai biểu diễn khác nhau: biểu thức nhân tử và
> đồ thị/parabol.

## Capability Receipt

### OBSERVED

> Bạn đã xác định và giải thích đúng dấu của một tam thức bậc hai trong tình
> huống vận dụng độc lập, dựa trên vị trí của giá trị đang xét so với hai
> nghiệm và thông tin về chiều mở của parabol **hoặc** dấu của hệ số bậc hai.

### NOT YET ESTABLISHED

> Bằng chứng này chưa cho thấy bạn luôn làm đúng với mọi tam thức bậc hai, giải
> được mọi bất phương trình bậc hai, hay duy trì được kỹ năng này sau một khoảng
> thời gian.

## Kịch bản demo

Happy path, ước lượng 4–6 phút:

1. Mở MicroSkill.
2. Practice 1: learner hỏi Companion “Em nên bắt đầu từ đâu?”.
3. Companion nhắc learner xác định vùng theo hai nghiệm; learner tự nộp lời
   giải đúng.
4. Practice fresh thứ hai: learner tự làm đúng; server mở `READY_FOR_TRANSFER`.
5. Transfer fresh, không có Companion/hint/Practice context.
6. Learner nộp lập luận đúng.
7. Reveal giải thích liên kết hai biểu diễn.
8. Receipt nêu phần observed và unknown.

Recovery branch nên trình diễn nếu có thời gian: learner quên dấu `-2` ở
Practice 2, nhận kết quả không pass; server không mở Transfer mà chọn Practice
fresh thứ ba. Hai evidence đúng khác nhau mới mở Transfer.

## Mapping chính xác vào Ops

Nhập qua UI Ops, không tự nhập ID/version:

1. Tạo `Toán 10` → `Dấu của tam thức bậc hai` → MicroSkill ở trên.
2. Tạo ba cặp Practice–Transfer.
3. Với sáu task, chọn `Bài giải tự luận`.
4. Nhập đề bài, kết quả mong đợi, bài giải tham khảo và ba tiêu chí rubric.
5. Với Practice, nhập misconceptions/guidance tương ứng.
6. Với Transfer, không author Companion/hint/context Practice.
7. Đặt Practice gate: `2` bài đúng, `3` bài tối đa.
8. Nhập Reveal theo từng pair.
9. Preview Practice, Transfer và Reveal trước review.

Identity, evidence skill, task/pair/revision version phải do server sinh và giữ
read-only. Mục tiêu review ở đầu tài liệu chưa có field riêng trong contract
Ops hiện tại, nên không được cố nhét vào revision body.

## Adversarial review

- Không dùng đáp án khoảng, tránh biến thể text mơ hồ.
- Không dùng Transfer chỉ đổi số.
- Không thêm ngữ cảnh đời sống giả tạo làm tăng tải đọc hiểu.
- Transfer không đòi hỏi phân tích nhân tử; chỉ kiểm tra đúng MicroSkill.
- Companion không được tiết lộ dấu/kết luận cuối.
- Hai Practice đúng khác nhau mới tạo gate; không suy ra capability từ Practice.
- Transfer yêu cầu giải thích, giảm khả năng đoán một trong hai dấu.

## Khuyến nghị chấm: kết luận xác định và lời giải tự luận

Schema authored hiện cho phép `written_solution` có `deterministicFinal`. Tuy
nhiên runtime v1.1 hiện vẫn xem phần deterministic của `written_solution` là
`not_applicable`/pending và đưa toàn bộ kết quả qua reviewed-rubric evaluator;
UI cũng chỉ có một ô bài giải, không có trường kết luận được bind riêng. Vì vậy
không nên đưa “dấu cuối” vào như một kênh deterministic thứ hai cho lát cắt này
nếu không làm một thay đổi runtime có chủ đích.

**Quyết định cho demo:** giữ cả sáu task là `written_solution` với rubric
reviewed theo evidence ở trên. Điều này chấp nhận trade-off: evaluator không
khả dụng hoặc output không hợp lệ sẽ fail-closed thành `UNCERTAIN`, thay vì đoán
từ một dòng đáp án. Bù lại, một learner không thể đạt `CORRECT` chỉ bằng cách
đoán dấu; reasoning độc lập mới là bằng chứng. Đây là lựa chọn đáng tin cậy hơn
cho luận điểm demo hiện tại. Sau này có thể tách riêng kết luận xác định và lời
giải nếu UI/domain runtime hỗ trợ trọn vẹn, nhưng đó không phải thay đổi cần
thiết trước khi author nội dung.

## Pre-content blocker — authored guidance chưa đi vào live Companion

### Root cause đã xác minh

Ops lưu `commonMisconceptions` và `aiGuidance` trong reviewed assessment của
Practice task. Snapshot published đã có body Practice bất biến. Nhưng composition
live hiện gọi Companion với `guidanceVersion: "runtime-v1"` cố định. Provider
chỉ nhận message learner và version chuỗi này; không nhận prompt task, common
misconceptions hay giới hạn support authored. Evidence assistance vì thế cũng
ghi `runtime-v1`, không phải guidance chính xác của revision đã chạy.

Đây là blocker trước khi đưa nội dung giáo viên vào production: guidance xuất
hiện trong Ops nhưng chưa là input thực thi của Companion.

### Contract/data flow tối thiểu cần triển khai

```text
published MicroSkill revision
  -> exact Practice pair/task snapshot đã bind vào session
  -> server-only PracticeCompanionContext
       { taskId, taskVersion, learner-safe prompt,
         aiGuidance.version, commonMisconceptions,
         aiGuidance.allowedSupportLevels }
  -> server policy: classify + cap + answer-reveal block
  -> provider request chỉ chứa prompt/guidance an toàn + learner message
  -> delivered assistance + exact guidanceVersion + provider/model provenance
```

`PracticeCompanionContext` phải được resolve từ exact executable snapshot của
session, không từ “published revision mới nhất”. Context gửi provider **không**
bao gồm expected answer, rubric, reference solution, Transfer content hay
evidence riêng tư.

### Authority boundary

- Server giao authored allowed levels với safe ceiling toàn cục. Guidance chỉ
  có thể thu hẹp kiểu hỗ trợ; không thể nâng support level, vô hiệu hóa answer
  reveal block hoặc biến Companion thành grader.
- Server vẫn phân loại output, block attempted answer reveal, chọn supportLevel
  cuối cùng và append assistance evidence idempotently.
- Nếu snapshot không có guidance hợp lệ, runtime fail closed bằng typed
  unavailable/authoring error — **không** fallback `runtime-v1` hoặc lookup
  bootstrap/latest content.
- Session A tạo từ revision A tiếp tục dùng prompt/guidance version A sau khi
  revision B được publish; session mới B mới dùng B. Evidence ghi pair/task/
  content/guidance version đã bind để lịch sử giải thích được.

### Regression acceptance tối thiểu cho seam

1. Provider request từ session published chứa guidance authored của đúng task;
   không chứa expected answer/rubric/Transfer data.
2. Guidance phiên bản A vẫn dùng cho session A sau publication B; session B
   dùng B.
3. Guidance thiếu/malformed fail closed, không có fallback static.
4. Authored level không thể vượt server policy; answer reveal luôn bị block.
5. Assistance evidence idempotent lưu exact guidance version, provider và model.

Không có real teacher content, publication hay runtime code nào được thay đổi
trong review này.
