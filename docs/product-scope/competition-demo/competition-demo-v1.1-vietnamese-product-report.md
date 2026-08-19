# ThinkAI Competition Demo v1.1 — Báo cáo mô tả sản phẩm

**Trạng thái:** Báo cáo giải thích/tổng hợp

**Thẩm quyền:** Được tổng hợp từ các tài liệu source-of-truth của `competition-demo-v1.1`, ADR-011 và kế hoạch triển khai hiện hành.

**Mục đích:** Giúp giáo viên, giám khảo, thành viên đội và người mới hiểu rõ sản phẩm, ranh giới AI, luồng học, và trạng thái triển khai thực tế.

> Tài liệu này là bản giải thích/tổng hợp tiếng Việt, không phải source of truth mới. Nếu có xung đột, `competition-demo-v1.1-amendment.md`, `v1.1-amendment-contracts.md`, ADR-011 và các ADR hiện hành được ưu tiên.

## Tóm tắt một câu

ThinkAI là một sản phẩm học tập cho phép học sinh luyện giải bài với sự hỗ trợ có giới hạn của AI, ghi lại điều kiện hỗ trợ trong Practice (bài luyện), rồi yêu cầu em làm một Transfer (bài kiểm tra vận dụng độc lập) ở dạng khác trước khi tạo Capability Receipt (phiếu bằng chứng năng lực); vì làm đúng khi có trợ giúp chưa đủ chứng minh rằng học sinh tự vận dụng được.

## Vấn đề ThinkAI muốn giải quyết

Một học sinh có thể làm đúng một bài vì đã được gợi ý, được AI hỏi từng bước, hoặc được nhắc công thức. Kết quả đúng đó là thông tin có ích, nhưng chưa đủ để kết luận rằng em đã hiểu ý tưởng và có thể dùng nó khi bài được đổi cách biểu diễn hay bối cảnh.

ThinkAI không cố trả lời câu hỏi “học sinh thông minh bao nhiêu?” hoặc gán nhãn lâu dài cho học sinh. Câu hỏi hẹp hơn, trung thực hơn là:

> Học sinh đã làm được bài trong điều kiện hỗ trợ nào, và sau đó có tự vận dụng được cùng ý tưởng trong một tình huống khác hay không?

Vì vậy, hỗ trợ AI không bị xem là lỗi hay bị trừ điểm. Nó là một điều kiện của bằng chứng cần được ghi nhận rõ ràng.

## Ý tưởng cốt lõi: ba hệ thống phối hợp

### 1. Learning System — hệ thống học

Đây là nơi học sinh chọn nội dung, làm Practice, trao đổi với Practice Companion (AI đồng hành khi luyện tập), nộp lời giải, nhận phản hồi, rồi làm Transfer độc lập.

### 2. Content System — hệ thống nội dung

Đây là nơi giáo viên hoặc người duyệt nội dung chuẩn bị môn học, chủ đề, micro-skill (một kỹ năng nhỏ, cụ thể), bài Practice, bài Transfer, rubric (tiêu chí chấm), đáp án kỳ vọng, lời giải tham khảo, lỗi thường gặp và phạm vi AI được phép hỗ trợ.

### 3. Evidence System — hệ thống bằng chứng

Đây là nơi backend ghi nhận các sự kiện có thể kiểm tra lại: học sinh đã nhận loại hỗ trợ gì, bài được chấm ra sao, phiên bản nội dung nào đã dùng, Transfer có độc lập hay không, và khi nào đủ điều kiện tạo Capability Receipt.

Ba hệ thống này giúp ThinkAI không biến thành một chatbot giải bài đơn thuần.

## Luồng đầy đủ của học sinh

1. Học sinh vào **Trang chủ / Học** và xem đường học tĩnh do nội dung đã duyệt quy định.
2. Em chọn **Môn học → Chủ đề → Micro-skill**. Demo chỉ dùng một lát cắt nhỏ, không mở rộng nhiều môn cho có vẻ lớn.
3. Backend chọn một cặp Practice/Transfer đã duyệt trong ngân hàng nội dung, rồi gắn cặp đó với phiên học. Trình duyệt không tự chọn Transfer.
4. Trong **Practice**, học sinh đọc đề, làm bài, viết lời giải và có thể hỏi Practice Companion nếu cần.
5. Học sinh nộp lời giải. Hệ thống chấm bằng các phần chắc chắn có thể chấm máy và, khi nội dung yêu cầu, bằng rubric đã duyệt.
6. Sau khi chấm, **Practice Process Feedback** (phản hồi quá trình Practice) có thể giải thích quá trình vừa diễn ra. Phản hồi này không thay đổi điểm hay cấp pass.
7. Nếu Practice đạt điều kiện, hệ thống dẫn học sinh qua một bước chuyển ngắn sang **Independent Transfer** — bài vận dụng độc lập.
8. Trong Transfer, học sinh làm một bài dùng cùng micro-skill nhưng ở cách biểu diễn hoặc bối cảnh khác. Không còn chat AI, hint hay dữ liệu Practice.
9. Sau khi nộp Transfer, hệ thống chấm bằng dữ liệu của chính Transfer. Nếu đạt điều kiện, learner mới được xem **Reveal connection** — lời giải thích do nội dung đã duyệt so sánh hai bài.
10. Khi Practice và Transfer cùng đủ điều kiện, backend tạo Capability Receipt. Học sinh xem lại tiến độ và kỹ năng tiếp theo do nội dung tĩnh quy định.

## Practice cụ thể trông như thế nào

Thiết kế Demo v1.1 quy định màn Practice có đề bài, vùng làm bài, ô nhập lời giải, khu vực Practice Companion, nút gửi bài, kết quả chấm và phản hồi quá trình. Đây là thiết kế mục tiêu của v1.1; giao diện API-backed hoàn chỉnh vẫn chưa được triển khai trong code hiện tại.

Học sinh không bắt buộc phải biết LaTeX. Với written solution (lời giải viết), em có thể nhập văn bản toán học đơn giản như:

```text
(x-2)(x-3)=0 nên x=2 hoặc x=3
```

Các dạng câu trả lời được định hướng gồm multiple choice (chọn đáp án), numeric (số), expression (biểu thức), structured fields (các trường có cấu trúc), written solution và explanation (giải thích). Code hiện có đã hỗ trợ text, choice và numeric một cách xác định; expression đang bị từ chối trong phần chấm authoritative hiện tại. Các dạng written solution, structured fields và expression có adapter đáng tin cậy là mục tiêu triển khai v1.1, không phải trạng thái đã hoàn tất.

## Học sinh nhập bài Toán vào ThinkAI như thế nào?

Toán có công thức phức tạp, nhưng Competition Demo v1.1 không yêu cầu học sinh biết LaTeX, gõ một tài liệu Word/PDF hoàn chỉnh, hoặc chụp ảnh chữ viết tay để máy tự đoán. Hệ thống dùng cách nhập phù hợp với từng loại bài, ưu tiên sự thuận tiện cho learner và độ tin cậy của grading.

### 1. Nhập có cấu trúc, chấm xác định

Với bài có đáp án ngắn và rõ, learner dùng multiple choice, numeric, các ô riêng như `x₁` và `x₂`, hoặc các trường có cấu trúc khác phù hợp với task. Đây là cách tốt cho những phần mà deterministic validator có thể kiểm tra chắc chắn.

### 2. Vùng viết lời giải

Với bài cần trình bày reasoning, learner gõ lời giải bằng văn bản toán học đơn giản. Ví dụ:

```text
Δ = 25 - 24 = 1
x1 = (5 + 1) / 2 = 3
x2 = (5 - 1) / 2 = 2
```

Điều quan trọng là tính đúng toán học và các tiêu chí rubric, không phải câu chữ giống giáo viên hay lặp lại đúng reference method. Learner có thể dùng một phương pháp đúng khác với lời giải tham khảo.

### 3. Hỗ trợ nhập ký hiệu Toán trong giao diện

Thiết kế learner UI v1.1 dự kiến có các nút trực quan hoặc math keyboard cho ký hiệu thông dụng như `x`, `xⁿ`, `√`, phân số `a/b`, `±`, `Δ`, `π`, `≤`, `≥`, `≠`, `×` và `÷`. Mục tiêu là học sinh không phải tự viết cú pháp LaTeX.

Đây là hỗ trợ nhập liệu trong giao diện, không phải một grading authority mới. Math keyboard/editor đầy đủ vẫn là phần **cần triển khai** của learner UI v1.1, chưa được xác nhận là đã có trong code hiện tại.

### Competition Demo v1.1 không phụ thuộc vào điều gì

Demo hiện tại không phụ thuộc vào việc upload Word, upload PDF lời giải, handwriting OCR (nhận dạng chữ viết tay), tự động chấm trực tiếp từ ảnh chụp, hoặc nhận dạng hình học từ sơ đồ. Giới hạn này giữ Demo nhỏ, đáng tin và phù hợp với một vertical slice có thể kiểm tra.

### Hướng photo / handwriting trong tương lai

Một phiên bản tương lai có thể hỗ trợ learner viết trên giấy, chụp hoặc upload ảnh, rồi dùng AI/OCR tạo bản chép lại. Nhưng luồng đúng phải là:

```text
Ảnh bài làm
→ AI/OCR tạo bản chép lại
→ ThinkAI hiển thị bản diễn giải cho learner
→ learner xem, sửa nếu cần và xác nhận rõ ràng
→ chỉ bản đã xác nhận mới đi vào grading
```

Raw OCR interpretation không được âm thầm trở thành bài làm authoritative của learner. Luồng “ảnh → AI đoán → chấm → pass” không phải thiết kế dự định. Chữ xấu, nét tẩy xóa, phân số, số mũ/chỉ số dưới và ký hiệu Toán rất dễ bị đọc sai; nếu máy đoán sai, một lời giải đúng của learner có thể bị chấm sai vì lỗi OCR. Khi nhận dạng không chắc, hệ thống phải yêu cầu learner sửa hoặc xác nhận thủ công thay vì đoán.

Vì vậy ThinkAI hướng tới ba mức thực tế: câu trả lời đơn giản bằng structured input; reasoning Toán thông thường bằng lightweight written/math editor; và, trong tương lai, learner dùng giấy bằng photo transcription kèm learner confirmation. Cách này không ép mọi learner phải gõ Word document, đồng thời không overclaim độ tin cậy của handwriting AI.

## AI Companion trong Practice làm gì

Practice Companion chỉ tồn tại trong Practice. Nó có thể hỏi học sinh đang mắc ở đâu, đặt câu hỏi gợi mở, nhắc khái niệm, đưa conceptual hint (gợi ý khái niệm), strategic hint (gợi ý chiến lược), scaffold mạnh hơn khi cần, và phản hồi dựa trên reasoning (lập luận) mà học sinh tự gửi.

Mức hỗ trợ được ghi theo taxonomy sau:

| Mức | Ý nghĩa dễ hiểu |
|---|---|
| `NONE` | Không có hỗ trợ AI được ghi nhận. |
| `PROMPT` | Lời nhắc rất ngắn để học sinh tiếp tục suy nghĩ. |
| `CONCEPTUAL_HINT` | Nhắc ý nghĩa của khái niệm. |
| `STRATEGIC_HINT` | Gợi ý hướng giải hoặc bước nên xem xét. |
| `STRONG_SCAFFOLD` | Hỗ trợ mạnh hơn nhưng vẫn bị giới hạn bởi nội dung đã duyệt. |

Đây không phải thang điểm phạt. Ví dụ, hai học sinh đều làm đúng Practice: bạn A không dùng AI, bạn B dùng strategic hint. Cả hai không bị trừ điểm; hệ thống chỉ biết điều kiện làm đúng của hai bạn khác nhau.

## AI tuyệt đối không được làm gì

AI không được tự quyết score cuối, tự cấp pass, tự mở khóa progression (trạng thái học tiếp), tự cấp Capability Receipt, tự tuyên bố mastery (đã thành thạo), biết hoặc tiết lộ Transfer trước thời điểm cho phép, xuất hiện như trợ lý trong Transfer trước khi nộp, hoặc tự publish nội dung giáo dục.

Browser cũng không có các quyền này. Backend và policy (quy tắc máy chủ) mới là nơi quyết định chuyển trạng thái, pass, reveal và receipt.

## Bằng chứng về AI assistance

Khi AI tạo một câu trả lời, model chỉ tạo **candidate learner reply** — câu trả lời ứng viên cho học sinh — và có thể gợi ý metadata. Model và client không được tự khai báo bằng chứng authoritative.

Server phân loại trước khi gửi và ghi ba sự kiện khác nhau:

| Trường | Ý nghĩa |
|---|---|
| `answerRevealAttempted` | Câu trả lời ứng viên có dấu hiệu cố hoặc vô tình tiết lộ đáp án/lời giải bị cấm. |
| `responseBlocked` | Server đã chặn câu trả lời trước khi nó tới học sinh. |
| `answerRevealed` | Đáp án/lời giải bị cấm thực sự đã tới học sinh. |

Ví dụ AI tạo: “Đáp án cuối cùng là x = 2 và x = 3.” Nếu server phát hiện trước khi gửi, evidence ghi `answerRevealAttempted = true`, `responseBlocked = true`, `answerRevealed = false`. Nếu lỗi khiến học sinh thật sự nhìn thấy, evidence phải ghi `answerRevealed = true`; hệ thống không được viết lại lịch sử như thể an toàn đã xảy ra.

Classifier của Demo chỉ là cơ chế có giới hạn cho nội dung Toán đã duyệt. Nó phải trả `SAFE`, `BLOCK` hoặc `UNCERTAIN`; chỉ `SAFE` mới có thể gửi. `BLOCK` và `UNCERTAIN` đều bị chặn. Điều này không phải tuyên bố rằng hệ thống có thể nhận diện mọi lời giải toán trên đời.

## Hệ thống chấm bài như thế nào

ThinkAI dùng hybrid grading (chấm kết hợp), nghĩa là không giao toàn bộ việc chấm cho một mô hình AI tự do.

### Deterministic validator — bộ kiểm tra xác định

Khi có thể chấm chắc chắn, hệ thống dùng luật máy: chọn đáp án, số, dung sai, giá trị đã chuẩn hóa, tập hợp, trường có cấu trúc, hoặc biểu thức khi có adapter đã được duyệt và đủ tin cậy. Nếu một validator áp dụng được và cho kết quả, đó là evidence authoritative cho phần đó.

### Reviewed-rubric AI evaluator — bộ đánh giá rubric đã duyệt

Với written solution hoặc reasoning mà luật máy không đủ, AI nhận rubric đã duyệt và trả về các facets/criteria (các mặt bằng chứng/tiêu chí), không trả verdict cuối. `referenceSolutions[]` là lời giải tham khảo không canonical: learner không phải lặp lại đúng phương pháp, thứ tự bước hay câu chữ của giáo viên.

Server làm lần lượt: kiểm tra schema, kiểm tra ID tiêu chí, kiểm tra đủ tiêu chí bắt buộc, kiểm tra mâu thuẫn ngữ nghĩa, kết hợp deterministic evidence và rubric evidence, rồi mới tạo outcome:

| Outcome | Ý nghĩa |
|---|---|
| `CORRECT` | Bằng chứng đủ nhất quán để thỏa full grading gate. |
| `PARTIALLY_CORRECT` | Có phần đúng nhưng chưa đủ full pass. |
| `INCORRECT` | Evidence nhất quán cho thấy lời giải chưa đúng. |
| `UNCERTAIN` | Hệ thống không có evidence đủ đáng tin để cấp pass. |

Chỉ `CORRECT` mới được thỏa full grading gate. Confidence do model tự báo chỉ là thông tin benchmark/chẩn đoán; nó không được tăng/giảm outcome, pass, receipt hoặc giải quyết conflict.

## Vì sao learner không cần giải giống giáo viên

Giả sử giáo viên tham khảo cách phân tích nhân tử:

```text
(x-2)(x-3)=0 → x=2 hoặc x=3
```

Học sinh lại dùng công thức nghiệm:

```text
Δ = 25 - 24 = 1
x = (5 ± 1)/2 → x=2 hoặc x=3
```

Nếu các tiêu chí toán học đều đúng, lời giải thứ hai vẫn là `CORRECT`. Reference solution hỗ trợ evaluator hiểu các phương án hợp lệ, không bắt học sinh sao chép một con đường duy nhất.

Ngược lại, nếu đáp án cuối đúng nhưng learner viết sai reasoning, ví dụ tính discriminant sai rồi tình cờ ra đúng nghiệm, hệ thống có thể cho `PARTIALLY_CORRECT`. Đáp án cuối đúng không tự xóa lỗi reasoning.

## `UNCERTAIN` là gì

`UNCERTAIN` là trạng thái fail-closed: hệ thống chọn không cấp pass khi evidence chưa đủ chắc. Nó có thể xảy ra khi provider AI không sẵn sàng, output malformed, schema-invalid, thiếu tiêu chí bắt buộc, có tiêu chí mâu thuẫn, hoặc deterministic evidence và rubric evidence conflict.

`UNCERTAIN` không có nghĩa học sinh chắc chắn sai. Nó chỉ có nghĩa: “Hệ thống chưa có bằng chứng đủ đáng tin để cấp pass.” Vì vậy không có receipt dựa trên kết quả đó.

## Transfer là gì và vì sao quan trọng

Transfer là bài kiểm tra vận dụng độc lập: cùng micro-skill với Practice nhưng khác representation (cách biểu diễn) hoặc bối cảnh. Đây là phần tạo bằng chứng mạnh hơn cho luận điểm trung tâm của ThinkAI: sau khi được hỗ trợ ở Practice, learner có tự dùng ý tưởng được không?

Trước khi nộp Transfer, hệ thống không cung cấp AI Companion, hint, Practice transcript, Practice answer, Practice feedback, reference solution của Practice, Practice AI state, pair connection hay reveal. Post-submit Transfer grader chỉ nhận dữ liệu của chính Transfer: câu trả lời Transfer, expected result, rubric, `referenceSolutions[]` của Transfer, misconceptions cần thiết và metadata evaluator/version.

Đây không phải tuyên bố rằng learner quên toàn bộ điều đã học. Nó là cam kết rằng **hệ thống không tự làm lộ lời giải hoặc đường đi của Practice** trong điều kiện cần kiểm tra độc lập.

## Nếu Transfer thất bại thì sao

Transfer thất bại không reveal connection, không đưa đáp án thành hint và không tạo receipt. Học sinh có thể vào reviewed recovery flow (luồng ôn/recovery đã duyệt).

Nếu hệ thống tạo một new independent attempt (lần thử vận dụng độc lập mới), server chọn pair mới trong ngân hàng đã duyệt, loại trừ các pair hoặc Transfer task đã exposed trong cùng micro-skill learning episode. Việc chọn còn lại phải ổn định, kiểm tra được và do server thực hiện.

Nếu hết nội dung Transfer mới, hệ thống trả trạng thái `NO_FRESH_TRANSFER_AVAILABLE`. Điều này không phải phán xét năng lực hay lỗi của learner; Demo quay về review/recovery, presenter reset hoặc cần content intervention để có bài mới đã duyệt. Không được dùng lại Transfer cũ rồi gọi đó là một lần verification độc lập mới.

## Capability Receipt là gì

Capability Receipt là phiếu bằng chứng năng lực có giới hạn, không phải chứng chỉ mastery. Nó có thể nói rằng hệ thống đã quan sát được: Practice task nào được hoàn thành, học sinh nhận strategic hint hay không, Transfer task nào được làm đúng độc lập, phiên bản nội dung/policy/scorer nào được dùng, và các event nào làm nguồn.

Receipt không được nói “Bạn đã master 92%”, “Bạn chắc chắn biết toàn bộ kỹ năng”, hay suy ra năng lực toàn cục từ một cặp bài. Nó chỉ nói điều evidence thật sự hỗ trợ.

## Flow của giáo viên và Content Studio

Trong Demo v1.1, `/ops` là Content Studio tối thiểu **cần được triển khai**. Đây chưa phải Content Studio online hoàn chỉnh trong code hiện tại.

Luồng nội dung được thiết kế là:

```text
/ops
→ Subject
→ Topic
→ Micro-skill
→ Create/Edit DRAFT
→ Practice task + expected result + rubric + reference solutions
→ common misconceptions + AI guidance
→ Transfer task + Practice/Transfer pair + connection reveal
→ preview
→ submit for review
→ approve
→ publish
```

Vòng đời là `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → DEPRECATED`. Chỉ `DRAFT` được sửa. Khi đã gửi review, thân nội dung bị đóng băng; muốn sửa question, expected result, rubric, reference solution, pair, connection hoặc AI guidance phải tạo version DRAFT mới. Published version là immutable.

## Giáo viên không phải làm gì

Giáo viên không phải viết từng câu chat runtime, soạn sẵn mọi Hint 1/Hint 2/Hint 3 cho mọi tình huống, code hệ thống hoặc chấm tay từng attempt. Giáo viên là knowledge/content authority: xác nhận micro-skill, độ phù hợp của task, rubric, reference solution, tính hợp lệ của Practice/Transfer pair và boundary AI guidance.

AI có thể hỗ trợ tạo candidate nội dung, nhưng luồng bắt buộc là `AI GENERATED → DRAFT → HUMAN REVIEW → APPROVED → PUBLISHED`. AI không tự publish nội dung authoritative.

## Nội dung, phiên bản và Subject → Topic → MicroSkill

Ví dụ đường học có thể là:

```text
Môn: Toán 10
Chủ đề: Phương trình bậc hai
Micro-skill: Nhận diện và giải phương trình có thể phân tích nhân tử
```

Demo dùng static human-authored path: nội dung có display order và/hoặc quan hệ prerequisite/next do người duyệt xác định. Backend/policy quyết định eligibility và unlock; AI không tự chọn curriculum hay tạo mastery score.

Nếu learner A làm `MicroSkill Algebra-01 v3`, rồi giáo viên publish `v4`, evidence của A vẫn trỏ về `v3`. Publication, deprecation, draft mới, đổi thứ tự ngân hàng hay pair version mới không được đổi pair đã gắn vào session cũ.

## Ví dụ xuyên suốt

Giáo viên tạo micro-skill “giải phương trình bậc hai có nghiệm nguyên”, một Practice A, một Transfer B hoặc một bank nhỏ, rubric, `referenceSolutions[]`, misconceptions và AI guidance. Practice A tham khảo phân tích nhân tử, nhưng rubric cũng chấp nhận công thức nghiệm nếu đúng.

Học sinh mở Practice A, tự làm một phần rồi nói chưa biết bắt đầu. Practice Companion đưa conceptual hint, chẳng hạn nhắc learner xem cấu trúc của biểu thức thay vì đưa đáp án. Server ghi conversation ID, support level, guidance/model/prompt provenance và evidence assistance có cấu trúc.

Học sinh dùng công thức nghiệm, viết lời giải bằng văn bản đơn giản và nộp. Deterministic validator kiểm tra các phần áp dụng được; rubric evaluator sau nộp trả facets. Server kiểm tra rồi tạo `CORRECT`, và Practice Process Feedback có thể giải thích rằng learner đã dùng conceptual hint nhưng tự hoàn thành các bước còn lại.

Học sinh vào Transfer B. Chat AI biến mất; Practice transcript, answer, feedback và reference solution không được đưa sang. Em tự giải bài mới cùng micro-skill. Nếu Transfer là `CORRECT`, server ghi transfer evidence, mở reveal connection đã duyệt, rồi receipt trỏ đến Practice evidence, assistance condition, Transfer evidence và các phiên bản nội dung/policy tương ứng.

## Kiến trúc ở mức người không chuyên

```text
Giao diện học sinh / Content Studio
                ↓
Backend và policy của ThinkAI
  ├─ Nội dung
  ├─ Practice
  ├─ Grading
  ├─ Evidence
  ├─ Transfer
  └─ Receipt / Progress
                ↓
           PostgreSQL
                ↘
            AI Provider
```

Browser không phải authority: nó chỉ hiển thị và gửi lệnh. AI provider cũng không phải authority: nó có thể trả candidate reply hoặc rubric facets. Backend mới xác thực dữ liệu, ghi evidence, áp policy, quyết định pass, reveal, receipt và progression.

## Dữ liệu nào được lưu

Durable data (dữ liệu lưu bền) gồm content/task/pair version, grading evidence, aggregate outcome, assistance facts có cấu trúc, policy/scorer/model/prompt provenance, receipt và history. Đây là dữ liệu cần audit và không bị rewrite khi nội dung sau này đổi version.

Operational conversation (hội thoại vận hành) là Practice conversation cần cho continuity, resume khi Practice đang active và Practice Process Feedback sau khi nộp. Raw conversation không cần để evidence bền hoạt động. Thiết kế triển khai dự kiến có `retention_class`, `expires_at` và `cleanup_status`; transcript trở thành purge-eligible khi feedback xong hoặc episode kết thúc. Thời hạn retention production cụ thể vẫn chưa chốt.

Raw conversation không được vào ordinary logs, Transfer DTO, Transfer evaluator context hoặc competition evidence manifest.

## Privacy và safety

Demo dùng synthetic identities, không dùng dữ liệu trẻ em thật. Token/API key không được ghi log. Raw chat không được ghi vào ordinary logs. Practice transcript không được lọt vào Transfer. Báo cáo này không tuyên bố tuân thủ pháp lý ngoài các ranh giới kỹ thuật và riêng tư đã được tài liệu hiện hành quy định.

## Scope của Competition Demo v1.1

**Trong phạm vi thiết kế/Competition Release P0:** một lát cắt Toán 10; một topic hoặc đường micro-skill nhỏ; ngân hàng Practice/Transfer nhỏ đã duyệt; written solution; Practice Companion; hybrid grading; Transfer độc lập; receipt; progress/audit; Content Studio `/ops` tối thiểu; provider thật đủ điều kiện và online persistent deployment cho Competition Release.

**Không trong phạm vi:** broad LMS, quản lý trường/lớp, phụ huynh, payment, gamification, mastery percentage, Learning Twin, adaptive AI curriculum, general chatbot, OCR, handwriting, automatic publishing, hoặc nhiều môn mở rộng.

## Trạng thái hiện tại của dự án

| Hạng mục | Trạng thái trung thực hiện tại |
|---|---|
| Product scope v1.1 | Đã chốt trong source-of-truth và external review. |
| ADR hybrid grading / AI boundary | Đã chốt trong ADR-011; amend ADR-006/ADR-007 theo phạm vi ghi rõ. |
| Final implementation plan | Đã externally reviewed / PASS và được phê duyệt cho execution theo slice; đây không phải bằng chứng implementation đã hoàn tất. |
| Backend v1.0 core | Đã có deterministic scorer, Practice/Transfer session tách biệt, append-only evidence, PostgreSQL persistence, receipt, API/runtime và runtime acceptance evidence. |
| Content lifecycle v1.1 | Chưa triển khai: code hiện tại chỉ có `draft/approved/withdrawn` cho approved JSON bundle. |
| Published content bank / static path v1.1 | Chưa triển khai: repository hiện chọn đúng một approved pair. |
| Hybrid runtime grading v1.1 | Chưa tích hợp. Có foundation `src/grading/*` nhưng nó chưa khớp hoàn toàn contract cuối và chưa gắn vào lifecycle runtime. |
| AI Companion / assistance evidence runtime v1.1 | Chưa tích hợp. Có foundation `src/assistance/*` và `src/ai/contracts.ts`, nhưng cần thay/migrate theo contract cuối. |
| Practice Process Feedback runtime | Chưa triển khai. |
| `/ops` Content Studio | Chưa triển khai. |
| Learner UI | `app/page.tsx` hiện là local-state mock, chưa là luồng API-backed. |
| Browser E2E | Chưa có flow v1.1; `tests/e2e/` mới có hướng dẫn. |
| Real AI provider | Chưa chọn/qualify cho v1.1. |
| Persistent deployment | Chưa chốt host/deploy proof. |

## Những quyết định chưa chốt cho deployment

Các external decision/gate còn lại gồm real AI provider/model/configuration cho các capability được ship, deployment host, PostgreSQL hosting, thời hạn retention raw conversation production và ngân hàng nội dung competition đã teacher-review thật. Đây là những điều cần chốt trước Competition Release P0; không thể giả định đã xong chỉ vì kiến trúc hoặc kế hoạch đã có.

## Tiêu chí thành công của Demo

Demo chỉ đạt mục tiêu khi có thể chứng minh end-to-end: giáo viên publish nội dung đã review; learner làm Practice thật; AI assistance thật và có evidence; learner nộp written solution thật; grading thật; Transfer độc lập; receipt; history/progress/audit. UI mock hoặc video giả không đủ.

## Nếu chỉ nhớ 10 điều về ThinkAI

1. AI giúp học nhưng không tự chứng minh năng lực độc lập.
2. Practice có AI hỗ trợ; Transfer trước khi nộp không có AI.
3. Dùng help không bị phạt.
4. Server ghi điều kiện hỗ trợ thành evidence.
5. Learner có thể giải khác reference solution mà vẫn đúng.
6. Hybrid grading dùng AI facets, nhưng server giữ authority.
7. Chỉ `CORRECT` mới qua full grading gate.
8. Giáo viên/reviewer duyệt nội dung trước khi publish.
9. Published version immutable và evidence cũ không bị viết lại.
10. Capability Receipt là evidence có giới hạn, không phải mastery score.
