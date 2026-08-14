# THINKAI

## Tài liệu đề xuất và phản biện ý tưởng dành cho nhóm

**Mục đích:** Giúp nhóm và giáo viên quyết định liệu ThinkAI có nên chuyển sang một **prototype xác thực hẹp** hay phải dừng/định khung lại.

**Trạng thái:** Đề xuất nội bộ — chưa phải hồ sơ dự thi, chưa phải tuyên bố hiệu quả học tập, chưa phải đặc tả MVP cuối cùng.

**Phiên bản:** v1.2 — chuyển từ “đo mức hỗ trợ” sang **bằng chứng năng lực có điều kiện**  
**Cập nhật:** 14/08/2026  
**Nguồn nội dung:** v1.1 và gói phản biện `docs/reviews/thinkai-v1.1-deep-review/`.

> **Sứ mệnh:** AI phải giúp người học thực sự học, không chỉ lấy đáp án.

> **Câu hỏi quyết định sớm:** Liệu một hệ thống bằng chứng được kiểm soát của ThinkAI có tạo giá trị vượt qua gia sư AI mạnh + quiz/lịch nhắc tốt hay không?

---

# 1. ThinkAI trong một phút

Một học sinh có thể làm đúng bài sau khi AI gợi ý, giải thích hoặc lộ chiến lược. Kết quả đó có giá trị, nhưng **không tự động là bằng chứng rằng em có thể dùng cùng công cụ toán học khi bài thay đổi**.

ThinkAI là một đề xuất **challenge-first**, không phải chatbot gia sư tốt hơn. Hệ thống ghi điều kiện của lần thành công có AI hỗ trợ, rồi tạo một cơ hội được kiểm soát để học sinh dùng **cùng quan hệ/chiến lược** trong một biểu diễn hoặc tình huống mới. Nếu bài mới hợp lệ và học sinh làm độc lập, ThinkAI phát hành một **Bằng chứng năng lực / Capability Receipt**: điều đã được chứng minh, trong điều kiện nào, và điều gì vẫn chưa biết.

**Trải nghiệm học sinh:**

> **Học với AI → Dùng cùng công cụ ở tình huống mới → Nhận bằng chứng năng lực.**

Một cách nói ngắn gọn hơn có thể là:

> **Học nó. Dùng nó ở chỗ khác. Biến nó thành kỹ năng của mình.**

**Luận điểm hẹp hiện tại:**

> ThinkAI ghi điều kiện mà người học thành công với trợ giúp AI, rồi tạo cơ hội có kiểm soát để người học thể hiện cùng năng lực một cách độc lập trong tình huống đã thay đổi, và giữ lại bằng chứng đó theo thời gian.

Đây là một **giả thuyết sản phẩm và đo lường**. ThinkAI chưa có bằng chứng rằng nó cải thiện học tập, chưa có bằng chứng người dùng Việt Nam, và chưa chứng minh tính mới so với mọi sản phẩm khác.

| Hạng mục | Đề xuất v1.2 |
|---|---|
| Người dùng đầu tiên | Học sinh THPT tự học Toán và đã dùng AI |
| Phạm vi prototype | Một **vi kỹ năng** Toán lớp 10; chưa chốt quan hệ cụ thể trước khi giáo viên xác nhận |
| Khoảnh khắc đặc trưng | Nhận ra cùng công cụ toán học trong biểu diễn mới, sau đó nhận **Capability Receipt** |
| Lõi kỹ thuật | Proof-of-Learning Protocol: điều kiện hỗ trợ, bài mới được kiểm soát, bằng chứng theo thời gian |
| Điều phải kiểm tra | Tính hợp lệ task pair, giá trị với người học, và khả năng dự báo kết quả tự lực sau này |
| Quyết định cần nhóm phê duyệt | Thử feasibility + desirability; chưa xây platform rộng |

---

# 2. Vấn đề thật sự

## 2.1 Thành công có AI và năng lực tự lực là hai quan sát khác nhau

Một học sinh có thể nhận lời giải, theo các bước và nhập đáp án đúng. Khi gặp bài mới, em có thể vẫn không biết bắt đầu từ đâu. Quan sát đầu tiên là **hoàn thành có hỗ trợ**; nó không đủ để kết luận về khả năng áp dụng độc lập.

Nghiên cứu thực địa Toán THPT của Bastani và cộng sự cho thấy kết quả trong lúc dùng AI và kết quả bài kiểm tra không AI có thể khác nhau trong bối cảnh đó [1]. Ngược lại, một thử nghiệm ngắn trong Vật lý đại học cho thấy gia sư AI được thiết kế kỹ có thể cải thiện kết quả tức thời trong bối cảnh khác [2]. Hai nguồn này không cho phép nói “AI làm hại việc học” hoặc “AI tutor luôn đủ tốt”; chúng cho thấy ThinkAI không thể lấy việc có gợi ý Socratic làm điểm mới.

## 2.2 Vấn đề ThinkAI chọn giải

ThinkAI không cố trả lời mọi câu hỏi về học tập. Nó hỏi thêm một câu mà giao diện hỏi–đáp thường không buộc phải trả lời:

> **Sau trợ giúp cụ thể này, người học đã thể hiện được điều gì một cách độc lập ở một tình huống mới — và điều gì chưa được kiểm tra?**

Đây trước hết là vấn đề **readiness/measurement**. Nó chỉ trở thành vấn đề cải thiện học tập nếu giao thức làm thay đổi kết quả tự lực sau này; v1.2 không giả định điều đó.

## 2.3 Giá trị có thể có — và điều chưa biết

* Học sinh có thể muốn biết mình đã sẵn sàng cho dạng bài kiểm tra hay chưa.
* Giáo viên có thể muốn xem điều kiện của kết quả, thay vì chỉ thấy “đúng”.
* Hệ thống có thể chọn bước tiếp theo dựa vào bằng chứng hạn chế hơn là suy đoán tính cách/năng lực.

Tuy nhiên, việc học sinh có tự nguyện chọn thêm một challenge hay chỉ xem đó là “bài tập thêm” **chưa được xác minh**. Không được biến giả định này thành tuyên bố sản phẩm.

---

# 3. ThinkAI là gì — và không là gì

## Là gì

* một ứng dụng challenge-based cho một kỹ năng Toán hẹp;
* một giao thức ghi điều kiện của thành công và tách bài xác minh khỏi lời giải trước;
* một trải nghiệm phát triển năng lực với output rõ ràng: **Capability Receipt**;
* một nguồn dữ liệu sự kiện có thể kiểm tra cho giáo viên/nghiên cứu, không phải hồ sơ “biết toàn bộ người học”.

## Không là gì

* chatbot gia sư chung hoặc wrapper của ChatGPT;
* nền tảng adaptive learning đa môn;
* dashboard mastery 0–100;
* Learning Twin, dự báo rủi ro toàn cục, hay nhãn “misconception” tự động;
* game XP/streak/leaderboard không gắn với bằng chứng;
* sản phẩm được phép nói “cải thiện học tập” trước khi có thử nghiệm phù hợp.

---

# 4. Một mô hình sự kiện: trải nghiệm và bằng chứng

ThinkAI không có hai vòng lặp độc lập. Mỗi bước mà học sinh thấy phải ánh xạ vào một sự kiện có thể mô tả được.

| Sự kiện thực tế được ghi | Học sinh thấy | Sự thật có thể nói |
|---|---|---|
| Nộp ý tưởng đầu tiên hoặc chọn “chưa biết bắt đầu” | **Thử** | Có điểm xuất phát; không suy ra năng lực bền vững |
| Mở một can thiệp đã định nghĩa | **Nhận trợ giúp** | Đã tiếp xúc với nội dung trợ giúp cụ thể |
| Đúng ở bài đang học | **Hoàn thành** | Thành công trong điều kiện hiện tại |
| Làm bài mới, phiên tách biệt, biểu diễn thay đổi | **Dùng ở tình huống mới** | Cơ hội kiểm tra chuyển giao gần độc lập |
| Kết quả được chấm theo rubric | **Bằng chứng năng lực** | Chỉ điều đã thể hiện, trong điều kiện ghi rõ |
| Bài truy hồi sau một thời gian | **Quay lại để giữ sẵn sàng** | Bằng chứng tại khoảng thời gian đã nêu |
| Sự kiện mới được thêm | **Tiến độ / thử thách kế tiếp** | Kết luận hiện tại có thể được củng cố hoặc mâu thuẫn |

Visible flow có thể là: **HỌC → THỬ → NHẬN TRỢ GIÚP → HOÀN THÀNH → DÙNG Ở TÌNH HUỐNG MỚI → QUAY LẠI → PHÁT TRIỂN**.

Không có bước “Struggle” bắt buộc. Học sinh có thể nộp một ý tưởng, nói không thể bắt đầu, hoặc xin trợ giúp. Không dùng timer để ép khó khăn nhân tạo.

> **Nguyên tắc UX:** Tôn vinh năng lực đã được kiểm chứng; không bao giờ thưởng việc từ chối trợ giúp.

---

# 5. Assistance Exposure Records — không phải điểm trợ giúp 0–5

Độ dài của trợ giúp không nói lên lượng thông tin đã lộ: một câu ngắn có thể lộ quan hệ quyết định, trong khi nhiều câu hỏi Socratic có thể chưa lộ bước giải. Vì vậy v1.2 loại bỏ việc dùng thang số 0–5 như một phép đo năng lực, trung bình hay phần trăm hỗ trợ.

Trong prototype, mỗi can thiệp là **cố định và được giáo viên duyệt**, không phải phản hồi LLM tự do. Hệ thống tạo một Assistance Exposure Record gồm:

* `intervention_id` bất biến và văn bản/phiên bản chính xác;
* thời điểm mở và task/item family liên quan;
* tag rubric do con người soạn: hỗ trợ động viên/quy trình, lộ quan hệ mục tiêu, lộ chiến lược, lộ một bước giải, hoặc lộ đáp án đầy đủ;
* lần thử của học sinh trước khi nhận trợ giúp và phản hồi sau đó;
* trạng thái rà soát của can thiệp.

Help exposure được lưu để **mô tả điều kiện của thành công**, không để phạt xin trợ giúp. Không trừ XP, hạ cấp, hạ rank, mất badge hay làm giảm trạng thái của học sinh vì đã dùng hint. Nếu người chấm không thể gán tag nhất quán cho một mẫu can thiệp, ThinkAI chỉ được log sự kiện UI và phải bỏ tuyên bố đo “ngữ nghĩa của trợ giúp”.

LLM có thể là công cụ tạo **ứng viên** hint sau này, nhưng không thuộc prototype đầu tiên.

---

# 6. New-Situation Challenge và Independence Trial

**Independence Trial** vẫn hữu ích như tên nội bộ của bước xác minh. Không nên bán nó cho học sinh như “làm thêm câu không hint”. Tên học sinh thấy nên gần với hành động hơn, ví dụ **Dùng ở tình huống mới** hoặc **Thử thách biểu diễn mới**.

Khoảnh khắc đặc trưng là học sinh nhận ra: hai bài trông khác nhau nhưng dùng cùng một quan hệ toán học. Sau phản hồi, ThinkAI cần nói rõ liên hệ đó, ví dụ:

> Hai bài có bối cảnh khác nhau, nhưng cả hai đều cần dùng cùng quan hệ (X).

## 6.1 Đặc tả task pair cho MVP

Mỗi cặp bài phải được giáo viên rà soát và ghi metadata trước khi dùng:

1. đo cùng quan hệ/chiến lược mục tiêu;
2. có một thay đổi được tuyên bố rõ: biểu diễn, bối cảnh, dữ kiện, hoặc route cần dùng;
3. không đòi kiến thức tiền đề ngoài ý muốn;
4. không lặp lại câu chữ, số, thứ tự lời giải hay artefact của worked example;
5. có rubric và đáp án được giáo viên duyệt độc lập;
6. dùng symbolic/answer verification khi phù hợp.

Đổi số **không đủ**. Bài khó hơn **không tự động là transfer**. Một LLM có thể sinh ứng viên nhưng không phải ground truth. Cần theo dõi tỷ lệ chấp nhận/từ chối ứng viên, lý do từ chối và mức đồng thuận của giáo viên.

## 6.2 Điều kiện độc lập tối thiểu

* item chưa từng hiển thị;
* phiên thử tách khỏi lời giải/bài trước; không đưa context chứa đáp án;
* không có nút reveal lời giải trong lúc làm;
* policy trợ giúp nêu rõ và được thực thi bởi hệ thống;
* kết quả gồm đáp án và, khi cần, phương pháp/lý giải theo rubric.

Một lần pass không chứng minh “mastery toàn diện”. Một lần fail không xóa lần pass trước; nó chỉ thêm bằng chứng mâu thuẫn và mở một hành động học tiếp theo.

---

# 7. Capability Receipt — output đặc trưng

Sau một New-Situation Challenge hợp lệ, ThinkAI không hiển thị “MASTERED 87%”. Nó phát hành **Capability Receipt / Bằng chứng năng lực**.

Ví dụ học sinh thấy:

> **Bạn vừa thể hiện được:** áp dụng quan hệ (X) trong biểu diễn mới.  
> **Điều kiện:** bài chưa thấy trước; không lộ đáp án.  
> **Chưa biết:** chưa kiểm tra lại sau thời gian.

Receipt là một tuyên bố hẹp, có thể hiểu và khuyến khích. Nó không phải nhãn vĩnh viễn về trí thông minh hay khả năng.

| Lớp | Thông tin |
|---|---|
| Học sinh | điều đã thể hiện, điều chưa được kiểm tra, hành động tiếp theo |
| Giáo viên/audit | skill, item family/version, phiên bản rubric, intervention exposure, điều kiện task, kết quả, timestamp, review status, bằng chứng mâu thuẫn |

Một receipt chỉ được cấp khi task pair đã được duyệt và điều kiện phiên được thỏa mãn. Failure nhận một bước phục hồi trung tính, ví dụ: “Hãy xem lại cách nhận ra quan hệ trong biểu diễn này”, không phải phán xét danh tính.

---

# 8. Append-only Learning Evidence Events

v1.1 dùng các trạng thái như assisted, independent, transfer và retained. Chúng không loại trừ nhau: cùng một học sinh có thể vừa thành công có trợ giúp, tự làm dạng quen, fail bài chuyển giao và chưa có delayed check. Vì vậy v1.2 không dùng chúng như một thang trạng thái duy nhất.

Mỗi **Learning Evidence Event** là append-only và có:

* skill; item family và item version;
* điều kiện nhiệm vụ/phiên;
* intervention exposure IDs;
* phản hồi học sinh, kết quả rubric/scoring;
* timestamp; scoring version; review status;
* liên kết đến tác vụ trước/sau khi cần.

Một summary dẫn xuất có thể nói với học sinh:

* **Tự làm dạng quen:** có bằng chứng.
* **Dùng trong biểu diễn mới:** bằng chứng chưa ổn định / cần thử lại.
* **Quay lại sau thời gian:** chưa quan sát.

Lần fail sau không xóa lịch sử. Nó thay đổi **kết luận hiện tại có điều kiện thời gian**. “Giữ được” chỉ có nghĩa là pass tại một khoảng thời gian cụ thể, không phải “sẽ nhớ mãi”. Chưa dùng decay score hay xác suất mastery cho MVP. Nếu sau này dùng mô hình xác suất, nó phải được calibration trên kết quả giữ lại/độc lập và trình bày bất định phù hợp [12].

---

# 9. Vì sao ThinkAI khác — và những gì đã là hàng phổ thông

| Hệ thống | Hợp đồng sản phẩm dễ hiểu |
|---|---|
| Frontier AI tutor | Giúp bạn học và giải bài. |
| Adaptive platform | Ước lượng điều bạn nên học tiếp. |
| ThinkAI đề xuất | Ghi điều kiện bạn thành công và kiểm tra xem bạn có dùng được kỹ năng ở tình huống mới hay không. |

ChatGPT Study Mode, Gemini Guided Learning, Khanmigo và ALEKS đã làm nhiều phần quan trọng: hội thoại hướng dẫn, hint, answer withholding, practice/quiz, reassessment, adaptation hoặc progression [7]–[10]. Frontier model + prompt tốt cũng có thể tái tạo Socratic dialogue, lời giải thích, motivational language, quiz generation và reminder.

**Novelty không được chứng minh.** Không được nói đối thủ chắc chắn thiếu một feature khi tài liệu kiểm tra chưa đủ. Giả thuyết khác biệt duy nhất hiện có là **controlled evidence contract** đầu-cuối:

* record trợ giúp cụ thể đã lộ ra;
* task pair chuyển giao đã xác minh và phiên tách biệt;
* evidence history bền vững, xác định và cho phép mâu thuẫn;
* delayed verification có điều kiện rõ;
* teacher/audit review.

Giá trị sản phẩm chỉ tồn tại nếu phần còn lại này tạo ra một quyết định hoặc trải nghiệm mà người dùng thật coi trọng. Đây không phải moat đã chứng minh.

---

# 10. Evidence status — biết gì và chưa biết gì

| Nhãn | Nội dung |
|---|---|
| **CÓ CƠ SỞ NGHIÊN CỨU** | Hiệu suất có AI và kết quả không AI có thể khác; AI tutor thiết kế tốt có thể giúp trong một số bối cảnh; retrieval/transfer/spacing có cơ sở học tập [1]–[6]. |
| **ĐÃ THỬ NỘI BỘ** | Reality check về gán nhãn misconception của LLM cho thấy lỗi tự tin cao; đây không phải thử nghiệm ThinkAI với học sinh. |
| **ĐỀ XUẤT** | Controlled evidence contract, Capability Receipt, event schema, user experience và MVP vi kỹ năng. |
| **CHƯA THỬ** | Tính hợp lệ pair, độ tin cậy exposure tag, mong muốn dùng/return, giá trị dự báo, tác động học, chấp nhận giáo viên. |
| **TƯƠNG LAI CÓ ĐIỀU KIỆN** | prerequisite probing, misconception hypotheses, intervention comparison, teacher mode, nhiều concept/môn và learning layer. |

---

# 11. Người dùng đầu tiên và MVP hẹp

**Người dùng:** học sinh THPT tự học Toán, đặc biệt những em đã dùng AI và cần biết mình có sẵn sàng làm bài độc lập không. Giáo viên là reviewer nội dung và người xem audit tối giản, chưa phải người dùng của LMS đầy đủ.

**Phạm vi:** một **vi kỹ năng Toán lớp 10** trong hàm số bậc nhất hoặc quan hệ tương tự có đáp án/rubric khách quan. Quan hệ cụ thể chỉ chốt sau khi giáo viên xác nhận tính phù hợp chương trình và khả năng tạo task pair hợp lệ.

## Validation prototype tối thiểu

* một vi kỹ năng;
* khoảng **6–10 task pairs** do giáo viên duyệt;
* item families cố định;
* ba help interventions cố định và có exposure tags;
* first attempt bắt buộc **hoặc** lựa chọn “chưa biết bắt đầu”;
* New-Situation Challenge ở phiên tách biệt;
* scoring xác định/symbolic khi có thể;
* append-only event log;
* Capability Receipt;
* một delayed event lịch sử được gắn nhãn rõ để demo.

Prototype **chưa có:** chẩn đoán misconception free-form; transfer questions do AI sinh dùng trực tiếp; knowledge graph rộng; path cá nhân hóa; multi-subject; global risk prediction; Learning Twin; open-world game; teacher LMS đầy đủ.

---

# 12. Demo 3 phút — học sinh thấy gì, judge thấy gì

| Thời gian | Cảnh | Điều phải rõ |
|---|---|---|
| 0:00–0:20 | Hai học sinh đều đúng; một em đã mở hint lộ chiến lược, một em không mở | Correctness không mô tả điều kiện thành công |
| 0:20–1:05 | Một flow thật: attempt → fixed hint → solve → exposure event | Không có “AI assistance = 3/5” mơ hồ |
| 1:05–1:55 | Màn hình tách biệt: cùng công cụ toán học, biểu diễn mới | Sau phản hồi, giải thích vì sao hai bài cùng quan hệ |
| 1:55–2:20 | Capability Receipt | Nói điều đã thể hiện và điều còn chưa biết |
| 2:20–2:40 | Delayed event lịch sử có timestamp | Không giả retention trong demo sống |
| 2:40–3:00 | Teacher/audit view gọn | item version, exposure, task validation, evidence condition; “validation in progress — not a learning-gain claim” |

Dashboard không phải khoảnh khắc chính. Khoảnh khắc chính là học sinh dùng một công cụ quen thuộc ở hình thức mới và hiểu mối liên hệ sau phản hồi.

---

# 13. Hai tuyên bố cần tách riêng

## Claim A — Measurement

> Evidence record có điều kiện của ThinkAI có dự báo kết quả độc lập/trì hoãn tốt hơn final correctness một mình không?

Evidence phù hợp: task độc lập giữ lại, delayed result, calibration, predictive validity và confidence interval.

## Claim B — Learning effect

> ThinkAI protocol có **gây ra** kết quả tự lực sau này tốt hơn strong tutor không?

Claim B cần controlled study. Không được suy Claim B từ Claim A. Trước validation, wording chuẩn là:

> **ThinkAI được thiết kế để phân biệt completed work có trợ giúp với bằng chứng mạnh hơn về khả năng độc lập.**

---

# 14. Validation plan trước full MVP

## Step 1 — Feasibility của task/rubric

Giáo viên/nhà nghiên cứu kiểm tra:

* reviewer có đồng thuận rằng pair đo cùng mục tiêu không?
* exposure tag có gán nhất quán không?
* scoring có thể xác định/symbolic không?
* tỷ lệ pair/candidate bị loại và lý do là gì?

Nếu không đạt, không chuyển sang tuyên bố semantic assistance hoặc transfer proof; reframe prototype.

## Step 2 — Desirability với học sinh mục tiêu

Quan sát và phỏng vấn ngắn:

* học sinh có hiểu Capability Receipt không?
* có muốn dùng/return không?
* có né hint vì lo status không?
* trải nghiệm là capability progression hay “extra homework”?
* failure có dẫn đến next action hay cảm giác bị phán xét?

## Step 3 — Measurement validity

Prospective study với task bank teacher-reviewed. Giữ lại delayed items và một phần item families. Pre-register outcome, features và baseline chỉ final correctness. So sánh discrimination, calibration và confidence interval. Pilot nhỏ chỉ ước lượng feasibility, rater agreement, attrition và variance — không đủ để khẳng định advantage ổn định.

## Step 4 — Learning effect

Chỉ sau ba bước trên. So sánh parallel groups với **cùng frontier model, model version, tutor prompt mạnh, content coverage, số bài, thời gian, opportunity practice, reminder schedule và delayed timing**. Đối chứng phải là strong tutor có Socratic help và practice tốt, không phải ChatGPT dùng yếu. Blind scoring khi cần; phân tích attrition và intention-to-treat. Không diễn giải chênh time-on-task là tác động thuần của ThinkAI.

---

# 15. Kiến trúc hẹp và ổn định

**Học sinh UI / audit view**  
↓  
**ThinkAI challenge orchestrator**  
├─ teacher-reviewed item bank + pair metadata  
├─ fixed assistance controller + immutable interventions  
├─ isolated challenge session controller  
├─ deterministic/symbolic scorer khi có thể  
├─ append-only evidence event store + summary policy  
├─ delayed-return scheduler  
└─ AI tutor API (chỉ nơi cần hiểu/lý giải hoặc phrasing)

## AI dùng cho gì

* hiểu cách diễn đạt/lý giải đa dạng khi rubric không đủ;
* phản hồi phrasing phù hợp;
* tạo **ứng viên** task/hint để người duyệt kiểm tra sau này.

## Phần mềm xác định dùng cho gì

* access control và cách ly task;
* versioning item/intervention/rubric;
* scoring Toán khi có thể;
* event history, receipt, scheduling, consent/deletion và audit trail.

Không để LLM một mình quyết định transfer equivalence, đáp án khi solver làm được, severity của arbitrary text, hoặc nhãn người học. Dùng API/model có sẵn vẫn là chiến lược đúng; train foundation model không phải nút thắt.

---

# 16. Data và task-bank design

| Resource | Vai trò | Ground truth / kiểm tra | Lưu ý |
|---|---|---|---|
| Teacher-authored THPT micro-skill bank | nguồn chính MVP | target, pair rubric, worked solution, symbolic check | ghi tác giả/quyền dùng; không đưa held-out pair vào tutor context |
| Event data có consent | UX/measurement study | delayed independent task, scoring có thể review | pseudonymous ID; retention/deletion rõ |
| Eedi | cảm hứng nghiên cứu lỗi/misconception | labels context-specific, cần teacher review | không giả định quyền product use hay Vietnamese fit; không định hình MVP |
| LLM candidate | backlog để review | không là ground truth | lưu model/prompt/version và lý do accept/reject |

Một bank nhỏ, traceable và teacher-reviewed mạnh hơn dataset lớn nhưng không rõ quyền/độ phù hợp. Không dùng dữ liệu trẻ em thật cho đến khi consent và chính sách dữ liệu sẵn sàng.

---

# 17. Product desirability và UX risks

ThinkAI phải làm cho friction đáng giá. Possible motivations là exam readiness, confidence, goal do giáo viên giao, hoặc cảm giác “mình dùng được công cụ này ở chỗ khác”; chúng là giả thuyết cần kiểm tra, không phải fact.

Nguyên tắc thiết kế:

* không bắt trial sau mọi interaction; dùng như capstone của một episode hẹp;
* challenge ngắn, có lý do rõ và có recovery route;
* hint luôn hợp lệ, không giảm status;
* receipt nói đúng cả điều chưa biết;
* delayed return gắn với mục tiêu thực, không phải notification vô nghĩa;
* game mechanic chỉ hợp lệ khi biểu diễn evidence: capability unlock, transfer quest, memory return.

Không dùng XP theo số lượng, coins, shop, leaderboard hay streak không có ý nghĩa học tập. Không dùng “AI Assistance Debt”: nó khuyến khích giấu khó khăn và phá hỏng dữ liệu.

---

# 18. Responsible AI và người học vị thành niên

Trước pilot cần policy vận hành, không chỉ lời hứa:

* data tối thiểu; pseudonymous study IDs khi phù hợp;
* quy trình consent của học sinh/nhà trường/người giám hộ theo bối cảnh;
* retention, deletion, access role và API data handling rõ ràng;
* không train trên student data mặc định;
* không public ranking; không psychological/personality label; không yêu cầu chain-of-thought;
* teacher/study lead có thể sửa interpretation và correction được ghi thành event;
* failure nhận next learning action trung tính;
* không giảm cấp, badge hay quyền trợ giúp vì learner đã xin hint.

Evidence không phải lời phán về trí thông minh, động lực hay tương lai của học sinh.

---

# 19. Bảng B / AI Young Guru fit — provenance hiện chưa giải quyết

v1.1 từng nói thể lệ chính thức 2026 đã có trong project. Gói red-team tìm trong repository và `evidence.zip` không tìm được file/link truy vết được; vì vậy v1.2 **không lặp lại tuyên bố đó**. Khi có file/canonical URL được phép lưu, nhóm phải thêm reference cụ thể vào source manifest trước khi dùng tiêu chí chính thức.

Trong khi provenance chưa được xác nhận, ThinkAI chỉ có thể tự đối chiếu thận trọng với các hạng mục thường được yêu cầu/được nêu trong brief:

| Hạng mục cần thể hiện | ThinkAI có thể chứng minh | Khoảng trống |
|---|---|---|
| Vấn đề thực tiễn, người dùng | assisted completion khác readiness độc lập; THPT Toán | pain/desirability Việt Nam chưa có |
| Dữ liệu và xử lý | item bank, evidence events, deterministic scoring | quyền dùng/curriculum review/consent |
| AI/model/tool role | AI ở feedback/understanding/candidate generation | không được biến API call thành “AI innovation” |
| Luồng hệ thống và output verification | isolation → pair → scoring → receipt → audit | chưa có prototype/user data |
| Testing/evaluation/improvement | feasibility, validity, controlled effect plan | hiện là kế hoạch |
| Feasibility/stability | one micro-skill, fixed bank, deterministic core | external API và teacher availability |
| Responsible AI | data minimization, no-help-penalty, correction | policy cần thực thi |
| Khả năng sửa theo yêu cầu vòng sau | thay pair/policy có giới hạn | không mở rộng thành platform trước validation |

Ý tưởng phù hợp hơn khi được trình bày như một workflow nhỏ, có thể kiểm tra và trung thực về status — không phải một “hệ sinh thái AI giáo dục” lớn.

---

# 20. Tầm nhìn tương lai có điều kiện

Chỉ khi evidence core hữu ích và người dùng chấp nhận, nhóm mới xem xét:

* probing tiền đề sau nhiều independent failures;
* misconception như **hypothesis** có correction/abstention, không phải truth label;
* so sánh intervention bằng kết quả độc lập sau này;
* teacher mode nhẹ, nhiều concept và lịch retrieval;
* learning verification layer hoặc nhiều môn.

Learning Twin, global risk prediction và broad adaptive path vẫn bị loại khỏi hướng hiện tại. Chúng không phải roadmap đã cam kết.

---

# 21. Kill / Reframe criteria

ThinkAI phải dừng hoặc định khung lại mạnh nếu một trong các điều sau xảy ra:

| Kill/reframe signal | Ý nghĩa |
|---|---|
| Strong tutor + quiz/reminder đạt parity về outcome và perceived value | system residue không tạo giá trị |
| Giáo viên không đồng thuận pair đo cùng target hoặc chi phí review quá cao | Transfer Challenge không hợp lệ/không khả thi |
| Exposure tags không đáng tin | không được tuyên bố semantic assistance evidence |
| Ledger không dự báo held-out independent outcome tốt hơn final correctness | lõi đo lường không có giá trị thêm |
| Học sinh né hint hoặc gọi flow là extra homework | UX gây hại/desirability yếu |
| Không có quyết định nào của học sinh/giáo viên đổi vì receipt/evidence | dashboard hóa, không có product value |
| Competitor cho thấy toàn bộ controlled loop tương đương | reframe positioning hoặc tìm giá trị khác |
| Delayed study có consent không khả thi | không thể support một phần claim chính |
| Demo cần giải thích lý thuyết dài mới hiểu | signature experience chưa rõ |

---

# 22. Team decision

**Không phê duyệt build MVP rộng.** Nhóm cần quyết định có đầu tư vào validation prototype và bốn bước validation ở §14 hay không.

| Quyết định | Đồng ý | Chưa đồng ý | Ghi chú |
|---|:---:|:---:|---|
| Giữ controlled evidence contract làm lõi | ☐ | ☐ | |
| Chọn một vi kỹ năng Toán lớp 10 sau teacher confirmation | ☐ | ☐ | |
| Dùng fixed hints + reviewed task pairs trước LLM generation | ☐ | ☐ | |
| Không phạt hint; dùng Capability Receipt thay mastery score | ☐ | ☐ | |
| Chạy feasibility và desirability trước measurement/effect study | ☐ | ☐ | |
| So strong baseline khi có study | ☐ | ☐ | |
| Tìm/ghi traceable official competition source trước hồ sơ | ☐ | ☐ | |

**Verdict hiện tại:** **VALIDATE — DISTINCTIVE CORE EXISTS, BUT NEEDS EVIDENCE.**

---

# Nguồn chính và giới hạn trích dẫn

1. Bastani, H. và cộng sự (2025), *Generative AI without guardrails can harm learning: Evidence from high school mathematics*, PNAS. https://doi.org/10.1073/pnas.2422633122  
   **Giới hạn:** một bối cảnh Toán THPT; không tổng quát cho mọi AI tutor.
2. Kestin, G. và cộng sự (2025), *AI tutoring outperforms in-class active learning*, Scientific Reports. https://doi.org/10.1038/s41598-025-97652-6  
   **Giới hạn:** thử nghiệm ngắn, Vật lý đại học; không phải proof retention dài hạn.
3. Pan, S. C. & Rickard, T. C. (2018), *Transfer of test-enhanced learning: Meta-analytic review and synthesis*. https://pubmed.ncbi.nlm.nih.gov/29733621/  
   **Giới hạn:** retrieval practice; không phải nghiên cứu ThinkAI/AI tutor.
4. Latimier, A. và cộng sự (2024), spaced retrieval trong STEM nhập môn. https://doi.org/10.1186/s40594-024-00468-5  
   **Giới hạn:** không cung cấp lịch tối ưu duy nhất.
5. Bisra, K. và cộng sự (2018), meta-analysis về self-explanation. https://doi.org/10.1007/s10648-018-9434-x
6. Kapur, M. (2008), productive failure. https://doi.org/10.1080/07370000802212669
7. Khan Academy, Khanmigo — mô tả sản phẩm chính thức. https://www.khanacademy.org/khan-labs
8. McGraw Hill, ALEKS — research/adaptive assessment. https://www.aleks.com/about_aleks/research_behind
9. OpenAI, ChatGPT Study Mode — release notes chính thức. https://help.openai.com/en/articles/11391654-chatgpt-business-release-notes
10. Google, Gemini Guided Learning — giới thiệu chính thức. https://blog.google/products-and-platforms/products/education/guided-learning
11. Google LearnLM — research report. https://cloud.google.com/solutions/learnlm  
    **Giới hạn:** tóm tắt chính thức của nhà cung cấp; chưa được v1.2 dùng để tuyên bố hiệu quả ThinkAI.
12. *Uncertainty-aware Knowledge Tracing*, AAAI 2025. https://ojs.aaai.org/index.php/AAAI/article/view/35007/37162  
    **Giới hạn:** không xác thực representation evidence của ThinkAI.
13. Bằng chứng nội bộ repository: `docs/research/frontier-reality-check/` và `docs/research/thinkai-product-direction/`.  
    **Giới hạn:** không phải thử nghiệm ThinkAI với học sinh.

**Provenance Bảng B:** chưa có file/canonical URL chính thức truy vết được trong runtime này. Không được thay thế khoảng trống đó bằng citation [14] chung chung.
