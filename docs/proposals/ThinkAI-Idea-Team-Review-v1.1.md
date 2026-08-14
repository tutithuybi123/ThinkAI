# THINKAI

## Tài liệu đề xuất và phản biện ý tưởng dành cho nhóm

**Mục đích:** Giúp các thành viên và giáo viên cùng quyết định: **ThinkAI có đủ mạnh để tiếp tục phát triển không, và nếu tiếp tục thì chúng ta thực sự sẽ xây gì?**

**Trạng thái tài liệu:** Đề xuất nội bộ — chưa phải hồ sơ dự thi, chưa phải đặc tả MVP cuối cùng.

**Phiên bản:** v1.1 — bổ sung trải nghiệm “mở khóa năng lực”  
**Cập nhật:** 13/08/2026  
**Phạm vi bằng chứng:** Nghiên cứu trong repository ThinkAI và các nguồn được trích dẫn ở cuối tài liệu.

> **Sứ mệnh:** ThinkAI phải giúp người dùng thực sự học được điều gì đó, thay vì chỉ giúp họ lấy được đáp án nhanh hơn.

> **Nhận định cốt lõi:** Giải được bài khi có AI hỗ trợ chưa phải là bằng chứng rằng người học có thể tự làm lại sau đó. ThinkAI vì vậy không chỉ cần một quy trình đo tốt; sản phẩm còn phải khiến người học **cảm thấy mình đang xây và mở khóa năng lực**, thay vì liên tục bị kiểm tra.

---

# 1. ThinkAI trong một phút

AI hiện nay có thể giải bài, giảng lại, đặt câu hỏi gợi mở và tạo bài luyện rất tốt. Vì vậy, ThinkAI khó có lý do tồn tại nếu chỉ là “một gia sư AI tốt hơn”. Các sản phẩm như ChatGPT Study Mode, Gemini Guided Learning, Khanmigo và ALEKS đã bao phủ nhiều phần của trải nghiệm đó.

Vấn đề ThinkAI muốn giải quyết là một bước sâu hơn:

> **Sau khi được AI giúp, người học thực sự còn làm được gì khi sự hỗ trợ bị giảm hoặc bỏ đi?**

Hướng sản phẩm mạnh nhất hiện tại là một **hệ thống xác minh bằng chứng học tập**. ThinkAI cho phép học sinh học với AI, nhưng không coi kết quả “đúng” là kết luận cuối cùng. Hệ thống ghi nhận mức hỗ trợ đã dùng, sau đó đưa ra một **Independence Trial — Thử thách Tự lực**: bài mới, cùng ý tưởng cốt lõi, nhưng thay đổi hình thức/ngữ cảnh và hạn chế trợ giúp.

Nếu học sinh làm được, ThinkAI có bằng chứng gần hơn với năng lực độc lập. Nếu chưa làm được, đó không phải hình phạt; đó là thông tin để chọn bước học tiếp theo.

### Hai lớp của cùng một vòng lặp

**Bên trong hệ thống — Proof-of-Learning Protocol:**  
**THỬ TRƯỚC → GHI NHẬN HỖ TRỢ → CHUYỂN GIAO → TỰ LỰC → KIỂM TRA LẠI → CẬP NHẬT BẰNG CHỨNG**

**Trải nghiệm mà học sinh nhìn thấy:**  
**LEARN → STRUGGLE → HINT → SOLVE → PROVE → REMEMBER → LEVEL UP**

Có thể Việt hóa theo UX thành:  
**KHÁM PHÁ → THỬ SỨC → NHẬN GỢI Ý → VƯỢT QUA → CHỨNG MINH → GHI NHỚ → MỞ KHÓA**

Hai vòng lặp không cạnh tranh nhau. Vòng bên trong phục vụ đo lường và nghiên cứu; vòng bên ngoài biến cùng một logic thành trải nghiệm tiến bộ. **ThinkAI đo bằng chứng ở backend, nhưng nên trình bày sự trưởng thành ở frontend.**

### Đề xuất ngắn gọn

| Hạng mục | Đề xuất hiện tại |
|---|---|
| Người dùng MVP | Học sinh THPT tự học Toán và đã sử dụng AI |
| Phạm vi đầu tiên | Một chủ đề/đơn vị kiến thức Toán THPT |
| Dấu ấn sản phẩm | **Proof-of-Learning Protocol**, với **Thử thách Tự lực** là khoảnh khắc dễ nhớ nhất |
| Dữ liệu tiến bộ | Backend dùng **Sổ cái Bằng chứng Học tập**; học sinh nhìn thấy trạng thái kỹ năng/mở khóa dễ hiểu |
| Điều cần chứng minh | Kết quả độc lập ở bài chuyển giao gần và kiểm tra lại sau thời gian |
| Trạng thái hiện tại | Ý tưởng có cơ sở nghiên cứu; chưa có bằng chứng người dùng cho chính ThinkAI |
| Quyết định đề nghị | Cho phép chạy một thí nghiệm xác thực nhỏ trước khi chốt MVP |

---

# 2. Vấn đề thật sự

## 2.1 AI tạo ra một kiểu “thành công” dễ gây nhầm lẫn

Một học sinh có thể:

1. đưa bài toán cho AI;
2. nhận lời giải đúng và lời giải thích rõ;
3. làm theo từng bước;
4. nộp đáp án đúng;
5. cảm thấy mình đã hiểu.

Nhưng khi gặp bài tương tự trong bài kiểm tra, học sinh có thể không biết bắt đầu từ đâu. Điều đã được quan sát trong buổi học là **hiệu suất có hỗ trợ**, không nhất thiết là **năng lực độc lập**.

Nghiên cứu thực địa về Toán THPT của Bastani và cộng sự cung cấp bằng chứng rằng sự khác biệt này có thể xảy ra. Trong bối cảnh nghiên cứu đó, nhóm dùng GPT không giới hạn làm tốt hơn trong lúc luyện tập, nhưng khi AI bị rút đi, điểm kiểm tra thấp hơn nhóm đối chứng 17%. Phiên bản gia sư có rào chắn loại bỏ phần tác hại này, nhưng chưa tạo ra cải thiện dương trên bài kiểm tra không có AI [1]. Đây là một nghiên cứu cụ thể, không cho phép kết luận rằng mọi AI đều làm hại việc học. Kết quả chỉ cho thấy **hoàn thành tốt khi có AI và học được để tự làm có thể là hai kết quả khác nhau trong bối cảnh đó**.

Ngược lại, một thử nghiệm ngẫu nhiên ngắn với 194 sinh viên Vật lý tại Harvard cho thấy một gia sư AI được thiết kế kỹ, có nội dung và nguyên tắc sư phạm rõ ràng, tạo ra mức tiến bộ tức thời cao hơn lớp học tích cực trong bối cảnh nghiên cứu đó [2]. Google cũng công bố một thử nghiệm đăng ký trước năm 2026 về Gemini Guided Learning trong Toán với 1.763 học sinh Sierra Leone và báo cáo kết quả tích cực [3]. Những bằng chứng này làm chuẩn so sánh cao hơn: ThinkAI không thể tuyên bố “AI có sư phạm giúp học tốt hơn” là điểm mới của mình.

## 2.2 Câu hỏi riêng của ThinkAI

ThinkAI không cần phủ nhận giá trị của AI tutor. Thay vào đó, sản phẩm đặt thêm một câu hỏi mà giao diện hỏi–đáp thường không buộc phải trả lời:

> **Bằng chứng nào cho thấy điều vừa làm được với AI vẫn tồn tại khi người học phải tự lực, gặp bài mới và quay lại sau một khoảng thời gian?**

## 2.3 Tại sao vấn đề này đáng giải quyết?

* Học sinh cần biết mình đã sẵn sàng cho bài kiểm tra hay chưa.
* Giáo viên cần phân biệt bài hoàn thành với năng lực thực.
* Phụ huynh và nhóm học tập cần tránh hiểu sai điểm “đúng” ngay sau khi được gợi ý.
* AI cần hỗ trợ mà không dần thay thế phần suy nghĩ của người học.
* Một hệ thống có thể đo bằng chứng độc lập sẽ tạo nền tảng tốt hơn cho can thiệp và cá nhân hóa sau này.

Điều chưa được xác minh tại Việt Nam là mức độ phổ biến của vấn đề, mức độ học sinh/giáo viên cảm thấy đau, và họ có chấp nhận thêm bước thử thách hay không. Đây là khoảng trống nghiên cứu người dùng bắt buộc phải làm rõ.

---

# 3. ThinkAI dành cho ai?

## 3.1 Người dùng MVP

Đề xuất hiện tại:

> **Học sinh THPT đang học một chủ đề Toán có cấu trúc rõ và thường dùng AI khi tự học.**

Nhóm này phù hợp vì:

* bài toán thường có đáp án và cách kiểm tra khách quan;
* có thể thiết kế bài mới giữ nguyên ý tưởng nhưng đổi dữ kiện, biểu diễn hoặc ngữ cảnh;
* kiến thức có quan hệ tiền đề tương đối rõ;
* học sinh cần tự làm trong bài kiểm tra;
* kết quả dễ đo hơn các môn có đánh giá chủ quan;
* giáo viên Toán có thể rà soát tính tương đương và độ hợp lệ của bài.

Một chủ đề đầu tiên có thể là phương trình bậc nhất, tỉ lệ, hàm số hoặc một nội dung khác do giáo viên chọn. Tài liệu này chưa chốt chủ đề.

## 3.2 Người dùng thứ cấp

Giáo viên là người dùng thứ cấp quan trọng:

* xác định mục tiêu và ranh giới kiến thức;
* duyệt bộ bài và tiêu chí chuyển giao;
* xem bằng chứng thay vì chỉ xem một điểm “mastery”;
* phát hiện học sinh chỉ thành công khi có hỗ trợ;
* phản biện kết luận của AI.

MVP chưa cần hệ thống quản lý lớp học đầy đủ. Một “góc nhìn giáo viên” đơn giản có thể là báo cáo của một học sinh hoặc một nhóm nhỏ.

## 3.3 Tầm nhìn dài hạn

ThinkAI không nhất thiết chỉ là ứng dụng Toán. Nếu vòng lặp xác minh học tập được chứng minh có giá trị, hệ thống có thể mở rộng sang Vật lý, Hóa học, lập trình và những môn có thể tạo nhiệm vụ kiểm tra hợp lệ. Phạm vi dài hạn khác với phạm vi MVP.

---

# 4. ThinkAI thực sự làm gì?

## 4.1 Vòng lặp học tập

| Bước | Hành vi của học sinh | Hành vi của ThinkAI | Bằng chứng tạo ra |
|---|---|---|---|
| 1. Thử trước | Tự giải trước khi hỏi | Chưa đưa lời giải | Điểm xuất phát, cách tiếp cận ban đầu |
| 2. Nhận trợ giúp | Yêu cầu gợi ý khi cần | Cấp mức trợ giúp tối thiểu hữu ích | Loại và lượng hỗ trợ đã dùng |
| 3. Hoàn thành có hỗ trợ | Giải được bài | Ghi **Thành công có hỗ trợ** | Biết người học làm được trong điều kiện nào |
| 4. Đổi ngữ cảnh | Gặp bài mới cùng khái niệm | Chọn bài chuyển giao gần đã được kiểm chứng | Khả năng nhận ra và áp dụng ý tưởng |
| 5. Thử thách Tự lực | Làm với ít/không có trợ giúp | Tách khỏi lời giải trước | Bằng chứng độc lập ngay sau học |
| 6. Quay lại sau | Làm lại sau 3–7 ngày hoặc lịch phù hợp | Lên lịch truy hồi | Bằng chứng ghi nhớ/duy trì |
| 7. Cập nhật | Xem kết quả và bước tiếp theo | Cập nhật sổ bằng chứng, không gắn nhãn con người | Kết luận có thể kiểm tra và sửa |

## 4.2 Hai đáp án đúng không nhất thiết là cùng một bằng chứng

Ví dụ:

* Học sinh A đạt đáp án đúng sau một gợi ý nhỏ về khái niệm.
* Học sinh B đạt cùng đáp án đúng sau khi AI đưa gần như toàn bộ các bước.

Một hệ thống chấm bài thông thường có thể cho cả hai cùng 10/10. ThinkAI ghi nhận cả hai đã hoàn thành, nhưng bằng chứng về khả năng tự lực khác nhau. Học sinh B không bị trừ điểm hay phán xét; hệ thống chỉ biết rằng năng lực độc lập vẫn cần được kiểm tra.

---

## 4.3 Từ “đánh giá” thành “mở khóa năng lực”

Một điểm còn thiếu trong phiên bản ý tưởng trước là **trải nghiệm sản phẩm đặc trưng**. Nếu ThinkAI chỉ hiện “đã đo hỗ trợ”, “hãy làm bài kiểm tra chuyển giao”, “chưa đủ bằng chứng”, người dùng có thể cảm thấy đang bị giám sát hoặc kiểm tra liên tục. Điều này đi ngược mục tiêu khiến họ muốn quay lại học.

Vì vậy, ThinkAI nên tách rõ hai lớp:

| Lớp | Mục đích | Ngôn ngữ phù hợp |
|---|---|---|
| Backend / giáo viên | Đo điều kiện hỗ trợ, transfer, retention, bằng chứng mâu thuẫn | assisted / independent / transfer / retained |
| Học sinh | Cảm nhận quá trình xây năng lực | khám phá / thử sức / vượt qua / chứng minh / mở khóa / củng cố |

Một concept có thể đi qua hành trình:

**ĐÃ KHÁM PHÁ → VƯỢT QUA VỚI TRỢ GIÚP → TỰ MÌNH LÀM ĐƯỢC → VẬN DỤNG Ở DẠNG MỚI → GHI NHỚ SAU THỜI GIAN**

Thay vì thông báo “Transfer assessment required”, sản phẩm có thể nói:

> **Bạn đã vượt qua phần này với 2 gợi ý. Còn một thử thách để biến kiến thức vừa học thành kỹ năng của chính bạn.**

Khi người học vượt qua:

> **Năng lực đã mở khóa: áp dụng ý tưởng trong tình huống mới.**

Sau một khoảng thời gian, retest có thể trở thành một **Memory Challenge** hoặc **Boss Challenge** ngắn, không phải một bài kiểm tra mang tính phán xét.

Nguyên tắc UX đề xuất:

> **Mỗi lần đo nên được cảm nhận như một bước tiến, không phải một lần giám sát.**

> **ThinkAI measures evidence internally, but presents growth externally.**

Điều này không làm thay đổi chuẩn đánh giá. Nó chỉ thay cách sản phẩm truyền tải cùng một sự thật cho người học.

---

# 5. Thử thách Tự lực — tính năng dễ nhớ bên trong Proof-of-Learning Protocol

## 5.1 Định nghĩa

**Thử thách Tự lực** là một bài chưa nhìn thấy, sử dụng cùng kiến thức cốt lõi với bài vừa học nhưng thay đổi đủ bề mặt hoặc biểu diễn để học sinh không thể chỉ lặp lại lời giải vừa thấy. Trợ giúp trước đó bị giảm mạnh hoặc bỏ đi.

Ví dụ: học sinh vừa giải một bài tỉ lệ thuận về giá và số lượng với hai gợi ý. Bài mới có thể dùng bản đồ hoặc tốc độ, đổi cách cho dữ kiện, nhưng vẫn yêu cầu nhận ra quan hệ tỉ lệ.

## 5.2 Khác gì với làm lại bài tương tự?

Lặp đúng khuôn có thể chỉ kiểm tra khả năng nhớ thủ tục. Thử thách Tự lực cố gắng kiểm tra **chuyển giao gần**:

* cùng khái niệm;
* thay đổi con số và bối cảnh;
* có thể thay đổi biểu diễn chữ / bảng / đồ thị;
* tránh tái sử dụng câu chữ hoặc trình tự quá giống;
* vẫn nằm trong phạm vi giáo viên có thể xác minh.

Một lần thành công không chứng minh “mastery toàn diện”. Nó chỉ bổ sung một mảnh bằng chứng mạnh hơn so với thành công có trợ giúp.

## 5.3 Nếu học sinh thất bại thì sao?

Thất bại không làm mất XP, không hạ “thông minh”, và không khóa người học. ThinkAI có thể:

1. ghi nhận: bằng chứng chuyển giao còn yếu;
2. so sánh cách làm ở hai bài;
3. kiểm tra một tiền đề nhỏ hơn;
4. dùng phản ví dụ hoặc bài tìm lỗi;
5. cho một can thiệp ngắn;
6. thử lại bằng bài khác sau đó.

Thông điệp nên là: **“Bài này cho thấy chúng ta cần củng cố cách nhận ra ý tưởng trong dạng mới.”**

## 5.4 Thông tin mà thử thách tạo ra

* người học có bắt đầu được khi không có gợi ý hay không;
* có nhận ra cấu trúc chung hay chỉ nhớ thao tác;
* cần loại trợ giúp nào;
* dự đoán trước đó của hệ thống đúng hay sai;
* bước tiếp theo nên là bài tập, kiểm tra tiền đề hay can thiệp khác.

---

# 6. Sổ cái Bằng chứng Học tập

## 6.1 Tại sao không dùng “Learning Twin”?

“Bản sao số người học” gợi cảm giác hệ thống hiểu đầy đủ trí óc, khả năng và tương lai của một học sinh. Điều đó không thực tế và có thể gây hại. Một đáp án đúng có thể do may mắn; một đáp án sai có thể do bất cẩn; chính việc kiểm tra cũng làm thay đổi việc học.

Thay vào đó, ThinkAI nên lưu **bằng chứng quan sát được**, giới hạn theo từng khái niệm/nhiệm vụ.

## 6.2 Các trạng thái dễ hiểu

* **Chưa kiểm tra**
* **Chỉ có bằng chứng khi được hỗ trợ**
* **Tự lực ở dạng quen thuộc**
* **Tự lực ở bài chuyển giao gần**
* **Đã duy trì sau khoảng thời gian**
* **Bằng chứng mong manh hoặc mâu thuẫn**

### Học sinh không nhất thiết phải nhìn thấy ngôn ngữ kỹ thuật này

Backend có thể giữ các trạng thái chính xác ở trên, nhưng giao diện học sinh nên chuyển chúng thành một hành trình phát triển dễ hiểu. Ví dụ:

**KHÁM PHÁ → CÓ TRỢ GIÚP → TỰ LỰC → CHUYỂN GIAO → CỦNG CỐ**

Giáo viên có thể xem evidence chi tiết; học sinh chủ yếu thấy mình đang ở đâu và cần làm gì để **mở khóa bước tiếp theo**. Cách tách này giúp ThinkAI vừa trung thực về đo lường, vừa không biến trải nghiệm học thành một dashboard kiểm tra.

## 6.3 Ví dụ

**Khái niệm: Lập luận tỉ lệ**

| Bằng chứng | Kết quả |
|---|---|
| Bài quen thuộc | Đúng sau 2 gợi ý |
| Bài quen thuộc tự lực | Đúng |
| Bài chuyển giao gần | Sai; chọn phép cộng thay vì tỉ lệ |
| Kiểm tra sau 5 ngày | Chưa kiểm tra |

**Kết luận có trách nhiệm:** “Hiện có bằng chứng về thao tác ở dạng quen thuộc, nhưng khả năng chuyển giao còn yếu.”

**Không nên nói:** “Mức độ thành thạo = 67,3%” hoặc “học sinh có tư duy kém.”

## 6.4 Nên và không nên lưu

| Nên lưu | Không nên suy diễn |
|---|---|
| Bài/phiên bản, câu trả lời, kết quả kiểm tra | Trí thông minh hoặc “năng lực bẩm sinh” |
| Mức trợ giúp đã tiếp xúc | Tính cách, động lực, chăm chỉ |
| Dạng quen/chuyển giao/kiểm tra trễ | “Phong cách học tập” không có bằng chứng |
| Thời điểm và độ gần đây | Xác suất tùy ý “sẽ tụt lại” |
| Bằng chứng ủng hộ và mâu thuẫn | Chẩn đoán tâm lý hoặc khuyết tật |
| Giả thuyết và câu hỏi cần kiểm tra tiếp | Chuỗi suy nghĩ riêng tư không cần thiết |

---

# 7. Đo mức hỗ trợ của AI

Một thang minh họa có thể là:

| Mức | Ví dụ hỗ trợ |
|---:|---|
| 0 | Không hỗ trợ |
| 1 | Gợi ý khái niệm nhỏ, không chỉ bước |
| 2 | Gợi ý có mục tiêu hoặc câu hỏi dẫn đường |
| 3 | Cung cấp cấu trúc hay một bước suy luận |
| 4 | Lời giải gần hoàn chỉnh, còn một phần cho học sinh |
| 5 | Lời giải đầy đủ |

Thang này chưa được chốt. Khó khăn chính là “lượng hỗ trợ” không chỉ phụ thuộc độ dài. Một câu ngắn có thể tiết lộ ý tưởng quyết định; một đoạn dài có thể không giúp gì. ThinkAI nên lưu cả:

* nội dung hỗ trợ;
* thời điểm hỗ trợ;
* học sinh đã thử gì trước đó;
* hành động tiếp theo của học sinh;
* AI đã tiết lộ đáp án hay chiến lược cốt lõi chưa.

Trong MVP, thang hỗ trợ nên được giáo viên quy định cho một bộ can thiệp nhỏ. Không nên để LLM tự gán điểm trợ giúp một cách tuyệt đối. Độ tin cậy của thang là một nội dung cần đánh giá riêng.

---

# 8. ThinkAI có thể dạy như thế nào?

ThinkAI không cần huấn luyện foundation model mới. Giá trị nằm ở cách hệ thống tổ chức hoạt động học và xác minh.

Các can thiệp có thể dùng, tùy trường hợp:

* câu hỏi Socratic;
* yêu cầu dự đoán trước;
* gợi ý tăng dần;
* phản ví dụ;
* tìm lỗi trong một lời giải;
* giải thích lại/teach-back;
* sửa một kiến thức tiền đề;
* lời giải chưa hoàn chỉnh;
* bài chuyển giao;
* truy hồi cách quãng;
* kiểm tra lại sau thời gian.

MVP không cần triển khai tất cả. Một phiên bản nhỏ có thể chỉ có 3 mức trợ giúp, một loại bài chuyển giao và một lần kiểm tra trễ.

Nguyên tắc cần thử nghiệm là:

> **Đưa lượng hỗ trợ tối thiểu đủ để người học tiếp tục suy nghĩ, rồi trả công việc nhận thức về cho người học.**

Đây là giả thuyết thiết kế, không phải quy luật áp dụng cho mọi học sinh. Nếu hỗ trợ quá ít khiến người học bỏ cuộc, hệ thống phải tăng trợ giúp.

---

# 9. Ý tưởng cũ: giữ gì, hoãn gì, bỏ gì?

| Ý tưởng trước đây | Quyết định hiện tại | Lý do |
|---|---|---|
| Thu thập câu trả lời và sai lầm | **Giữ** | Là bằng chứng trực tiếp |
| Lưu mức trợ giúp | **Giữ, làm cốt lõi** | Phân biệt điều kiện tạo ra thành công |
| Mô hình người học chi tiết | **Thu hẹp** | Chỉ lưu sổ bằng chứng theo khái niệm |
| Phát hiện khoảng trống | **Giữ có điều kiện** | Chỉ khi gắn với bài kiểm tra phân biệt |
| Chẩn đoán misconception | **Thứ cấp/không chắc chắn** | Thí nghiệm nội bộ cho thấy LLM có thể tự tin nhưng sai |
| Đồ thị tiền đề | **Hoãn, dùng nhỏ** | Hữu ích làm chỉ mục, không phải điểm mới |
| Dự báo tụt lại | **Bỏ khỏi MVP** | Dễ tạo chính xác giả và cần dữ liệu dài hạn |
| Dự đoán bài tiếp theo | **Giữ dạng hẹp** | Có thể kiểm tra và dùng để chọn hành động |
| Lộ trình học cá nhân | **Hoãn** | ALEKS và nhiều nền tảng đã làm; cần bằng chứng mới cá nhân hóa |
| Learning Twin | **Loại bỏ cách gọi** | Quá mức so với độ chắc chắn thực tế |
| Đánh giá lại sau | **Giữ, làm cốt lõi** | Cần cho bằng chứng duy trì |

Kết quả thí nghiệm nội bộ của repository về chẩn đoán misconception cho thấy một mô hình suy luận mạnh chỉ đạt Top-1 67,3% trong bài oracle-25, đồng thời có nhiều chẩn đoán sai với độ tự tin cao. Đây không phải thử nghiệm trên học sinh hay trên toàn bộ ThinkAI, nhưng là cảnh báo mạnh: **không được coi nhãn misconception do LLM tạo ra là sự thật**.

---

# 10. Vì sao ThinkAI khác — và phần nào đã là hàng phổ thông?

## 10.1 Bảng so sánh thận trọng

| Khả năng | Gia sư AI tuyến đầu | Nền tảng học thích ứng | ThinkAI đề xuất |
|---|---|---|---|
| Giải thích câu hỏi | Rất mạnh | Tùy nền tảng | Dùng AI hiện có |
| Gợi ý/Socratic | Rất mạnh; Study Mode, Guided Learning, Khanmigo có [8][10][11] | Phổ biến | Có, không phải khác biệt |
| Hồ sơ người học | Có thể qua memory | Phổ biến | Thứ cấp; dạng sổ bằng chứng |
| Lộ trình cá nhân | Có thể sinh bằng prompt | Phổ biến; ALEKS là ví dụ mạnh [9] | Không phải điểm khác biệt chính |
| Theo dõi trợ giúp AI | Có thể trong phiên; mức hệ thống cần kiểm chứng | Một số hệ thống theo dõi hint | Ứng viên cốt lõi, phải đánh giá độ tin cậy |
| Tách bằng chứng có trợ giúp/tự lực | Có thể yêu cầu bằng prompt | Có thể tồn tại ở một số hệ thống; chưa khẳng định thiếu | Cốt lõi của hợp đồng sản phẩm |
| Bài chuyển giao gần sau trợ giúp | AI tạo được bài; chất lượng cần kiểm tra | Có thể hỗ trợ bài mới | Cốt lõi, với bộ bài được xác minh |
| Kiểm tra trễ | Chat không tự bảo đảm quy trình | ALEKS [9] và hệ thống spacing có reassessment | Cốt lõi của tầm nhìn, không phải thành phần mới riêng lẻ |
| Bằng chứng minh bạch thay cho điểm mastery | Tùy prompt | Khác nhau | Đề xuất trung tâm |
| Mục tiêu là “điều còn lại sau khi AI rút đi” | Không phải hợp đồng mặc định | Cần khảo sát sâu theo sản phẩm | Bản sắc đề xuất của ThinkAI |

Không nên tuyên bố đối thủ “không có” một tính năng nếu chưa kiểm tra tài liệu chính thức. Điểm khác biệt cần chứng minh bằng hành vi và kết quả, không bằng danh sách feature.

### Cách nhớ nhanh ThinkAI khác ở đâu

> **ThinkAI không cần thắng ChatGPT ở khả năng giải thích.**  
> **ThinkAI không cần thắng ALEKS ở việc tạo learning path.**  
> **ThinkAI muốn thắng ở việc phân biệt “làm được nhờ AI” với “năng lực đã thuộc về người học”, rồi kiểm chứng điều đó qua bài mới và thời gian.**

| Hệ thống | Hợp đồng sản phẩm nổi bật |
|---|---|
| Frontier AI tutor | **Help me learn / help me solve** |
| Adaptive learning platform | **Estimate what I should learn next** |
| ThinkAI đề xuất | **Help me build a skill, then prove I can own and retain it** |

Điểm này vẫn là **giả thuyết khác biệt cần benchmark**, không phải tuyên bố rằng chưa có sản phẩm nào từng làm thành phần tương tự.

## 10.2 Những thứ không còn mới

* chat hỏi–đáp;
* không đưa đáp án ngay;
* gợi ý Socratic;
* hồ sơ năng lực;
* knowledge tracing;
* bản đồ tiền đề;
* lộ trình thích ứng;
* spaced repetition;
* dashboard giáo viên;
* sinh câu hỏi bằng AI.

Nếu ThinkAI chỉ ghép các phần này, dự án vẫn là **AI tutor + analytics**.

## 10.3 Điểm khác biệt có thể bảo vệ

Lõi không nên được mô tả chỉ là “Independence Trial”. Một bài thử độc lập riêng lẻ rất dễ bị sao chép. Ứng viên lõi mạnh hơn là **Proof-of-Learning Protocol**, gồm ba lớp gắn với nhau:

1. **Assistance Evidence:** biết người học đã được tiết lộ điều gì và trong điều kiện nào họ thành công.
2. **Independence / Transfer Proof:** tách khỏi lời giải trước và kiểm tra bằng nhiệm vụ mới đã được xác minh.
3. **Evidence Over Time:** bằng chứng sau này có thể củng cố hoặc bác bỏ kết luận hiện tại.

**Thử thách Tự lực** là signature moment dễ nhớ nhất của protocol, nhưng không phải toàn bộ moat.

Hợp đồng đo lường là:

> **Mọi kết luận về việc học phải ghi rõ điều kiện hỗ trợ, được thử bằng bài mới độc lập và có thể bị bằng chứng sau đó bác bỏ.**

Điểm này chỉ có giá trị nếu thử nghiệm cho thấy nó giúp phân loại hoặc cải thiện năng lực độc lập tốt hơn một gia sư AI có rào chắn mạnh.

---

# 11. Tại sao đây không chỉ là một prompt?

Một học sinh hoàn toàn có thể nói với ChatGPT:

> “Đừng cho đáp án. Hãy gợi ý từng bước và kiểm tra tôi bằng một bài mới.”

Prompt đó có thể tái tạo một phần lớn trải nghiệm trong một phiên. Đây là rủi ro lớn nhất của dự án.

ThinkAI chỉ vượt qua prompt nếu cung cấp được một **hệ thống nhất quán qua thời gian**:

* bắt buộc có lần thử ban đầu;
* ghi chính xác hỗ trợ đã lộ ra;
* cô lập bài xác minh khỏi lời giải trước;
* chọn bài chuyển giao đã được kiểm chứng;
* quay lại kiểm tra sau nhiều ngày;
* tích lũy bằng chứng mâu thuẫn/ủng hộ;
* dùng kết quả để thay đổi can thiệp;
* cho giáo viên xem và phản biện bằng chứng;
* đo hiệu quả so với cùng một model chỉ dùng prompt sư phạm.

Nếu một prompt tốt cộng với lịch nhắc đơn giản tạo ra kết quả tương đương, ThinkAI không đủ khác biệt và nên bị thu hẹp hoặc loại bỏ.

---

# 12. Trải nghiệm sản phẩm: người dùng phải cảm thấy mình đang mạnh lên

## Hướng A — Capability-Unlocking Challenge App (đề xuất mạnh nhất)

ThinkAI nên có cảm giác giống một **hành trình mở khóa kỹ năng**, không phải một hộp chat và cũng không phải một chuỗi bài kiểm tra. Màn hình chính hiển thị kỹ năng/challenge, khu vực làm bài, trợ giúp khi cần và tiến trình năng lực. Chat chỉ xuất hiện như một công cụ trong lúc học.

Vòng lặp người dùng:

**LEARN → STRUGGLE → HINT → SOLVE → PROVE → REMEMBER → LEVEL UP**

Ví dụ một kỹ năng:

**Đã khám phá → Vượt qua với trợ giúp → Tự mình làm được → Vận dụng ở dạng mới → Được củng cố sau thời gian**

**Ưu điểm:** product identity rõ, dễ demo, cùng một mechanic vừa tạo learning evidence vừa tạo cảm giác tiến bộ.  
**Rủi ro:** nếu “level up” chỉ là đổi nhãn mà không gắn với bằng chứng thật, nó trở thành gamification rỗng.

## Hướng B — Teacher-Connected Challenge System

Giáo viên chọn mục tiêu/bộ bài, ThinkAI biến chúng thành chuỗi challenge cá nhân. Học sinh vẫn trải nghiệm Learn → Prove → Level Up; giáo viên nhìn thấy evidence chi tiết, trạng thái mong manh và kết luận chưa chắc chắn.

**Ưu điểm:** nội dung và ground truth đáng tin hơn; teacher view có giá trị vận hành.  
**Nhược điểm:** cần giáo viên tham gia, quy trình triển khai phức tạp hơn.

## Hướng C — “Learn anywhere. Prove it in ThinkAI.”

Học sinh có thể học ở ChatGPT, Gemini, video, sách hoặc với giáo viên; ThinkAI chuyên tạo challenge xác minh và lưu evidence.

**Ưu điểm:** không cố thay thế hệ sinh thái học; tầm nhìn rất rõ.  
**Nhược điểm:** khó biết người học đã nhận trợ giúp gì bên ngoài; tích hợp, riêng tư và gian lận phức tạp. Phù hợp tầm nhìn dài hạn hơn MVP.

## Game nên đóng vai trò gì?

ThinkAI **không cần trở thành RPG**. Game mechanics chỉ nên tồn tại khi chúng biểu diễn sự phát triển năng lực thật:

* mở khóa kỹ năng khi có evidence độc lập;
* “boss challenge” gọi lại kiến thức cũ sau thời gian;
* level mới yêu cầu cùng nguyên lý trong bối cảnh khác;
* thất bại không làm mất “trí thông minh”, mà mở ra một challenge/can thiệp phù hợp hơn;
* xin hint không bị phạt - hệ thống chỉ ghi rằng lần thành công này có trợ giúp.

XP vì làm nhiều câu, streak, avatar, coin, shop hoặc leaderboard chỉ là trang trí nếu không thay đổi retrieval, transfer hay retention. Đặc biệt, nếu phạt người học vì xin gợi ý, họ có động cơ giấu khó khăn và làm hỏng chính dữ liệu học tập.

**Nguyên tắc sản phẩm:** ThinkAI không cố biến đánh giá thành game; ThinkAI biến **quá trình xây bằng chứng năng lực** thành một trải nghiệm progression.

---

# 13. Prototype kiểm chứng có thể xây và demo trước MVP

## 13.1 Ranh giới prototype kiểm chứng

Prototype trước MVP nên có:

* một chủ đề Toán THPT;
* một bộ bài đã được giáo viên rà soát;
* lần thử bắt buộc;
* 3 mức trợ giúp đơn giản;
* ghi lịch sử trợ giúp;
* một bài Thử thách Tự lực chuyển giao gần;
* một màn hình tiến trình kỹ năng cho học sinh và một evidence view tối giản cho nội bộ/giáo viên;
* dữ liệu mẫu lịch sử được đánh dấu rõ để minh họa kiểm tra trễ.

Prototype chưa cần:

* nhiều môn;
* dự báo dài hạn;
* knowledge graph lớn;
* quản lý toàn trường;
* game thế giới mở;
* tự huấn luyện mô hình;
* tự động tin hoàn toàn vào câu hỏi AI sinh;
* nhiều loại can thiệp phức tạp.

## 13.2 Kịch bản end-to-end

### Bước 1 — Thử ban đầu

Học sinh nhận bài toán và phải nhập cách làm hoặc câu trả lời đầu tiên.

### Bước 2 — Hỗ trợ tăng dần

Nếu bị kẹt, học sinh mở gợi ý. ThinkAI ghi mức hỗ trợ và nội dung đã tiết lộ.

### Bước 3 — Thành công có hỗ trợ

Học sinh giải đúng. ThinkAI hiển thị:

> **Bạn đã vượt qua phần này với trợ giúp. Còn một thử thách để biến nó thành kỹ năng của bạn.**

### Bước 4 — Thử thách Tự lực

Một bài mới cùng khái niệm nhưng đổi ngữ cảnh/biểu diễn xuất hiện. AI bị giới hạn.

### Bước 5 — Kết quả bằng chứng

ThinkAI ghi học sinh có tự bắt đầu, giải đúng và giải thích được hay không.

### Bước 6 — Level Up / cập nhật evidence

Ví dụ:

| Học sinh thấy | Evidence phía sau |
|---|---|
| ✓ Đã vượt qua với trợ giúp | assistance recorded |
| ✓ Tự mình làm được | independent familiar pass |
| ◐ Kỹ năng chưa mở khóa hoàn toàn | near-transfer fail |
| — Memory Challenge chưa đến hạn | delayed retention pending |

### Bước 7 — Kiểm tra sau

Sản phẩm thật đợi 3–7 ngày hoặc lịch phù hợp. Demo 2–3 phút chỉ được dùng phiên đã ghi trước và ghi rõ “dữ liệu lịch sử minh họa”. Không được chờ một phút rồi tuyên bố đã đo retention.

---

# 14. Demo 2–3 phút: nhìn thấy khác biệt trong 30 giây

## 0:00–0:30 — Vấn đề

Hiện hai học sinh cùng làm đúng một bài:

* Minh tự giải sau một gợi ý khái niệm.
* Lan nhận gần toàn bộ lời giải rồi nhập đáp án đúng.

**Gia sư thông thường:** cả hai “Correct”.  
**ThinkAI:** cả hai hoàn thành, nhưng bằng chứng tự lực khác nhau.

## 0:30–1:10 — Học với trợ giúp

Cho xem học sinh thử trước, mở một gợi ý, sửa bước sai và hoàn thành. Thanh hỗ trợ ghi rõ đã dùng gì.

## 1:10–1:45 — Thử thách Tự lực

ThinkAI nói: “Bạn đã vượt qua với trợ giúp. Còn một thử thách để biến ý tưởng này thành kỹ năng của chính bạn.” Đây là **Independence Trial** nhưng được trình bày như một bước mở khóa. Bài mới đổi ngữ cảnh và không hiển thị lời giải trước.

## 1:45–2:15 — Bằng chứng thay đổi

Nếu học sinh giải đúng, giao diện hiện **Skill Unlocked / Đã mở khóa năng lực vận dụng ở dạng mới**; evidence backend ghi “near-transfer pass”. Nếu sai, UI không phán xét mà cho biết kỹ năng “chưa ổn định” và mở một challenge/can thiệp ngắn phù hợp hơn.

## 2:15–2:40 — Kiểm tra trễ trung thực

Hiển thị một **Memory Challenge** từ phiên lịch sử có timestamp “5 ngày sau”. Nói rõ đây là dữ liệu phiên trước, không phải kết quả tạo ra trong demo. Nếu qua, kỹ năng được đánh dấu **Củng cố / Retained evidence**.

## 2:40–3:00 — Bằng chứng benchmark

Hiển thị ngắn kế hoạch/tiến độ thí nghiệm so sánh với gia sư frontier có rào chắn. Không dùng một ca demo làm bằng chứng hiệu quả.

---

# 15. Hiện tại dự án đã ở mức nào?

| Nhãn | Nội dung |
|---|---|
| **CÓ CƠ SỞ NGHIÊN CỨU** | Có bằng chứng rằng hiệu suất có AI và kết quả không có AI có thể khác nhau [1]; gia sư AI thiết kế tốt có thể cải thiện kết quả trong một số bối cảnh [2][3]; retrieval/spacing/transfer có cơ sở học tập [4][5]. |
| **ĐÃ THỬ NỘI BỘ** | Bài oracle-25 ngày 11/08/2026 dùng runtime Codex gpt-5.6-terra để chẩn đoán misconception đạt Top-1 67,3% và có nhiều lỗi tự tin cao; xem `docs/research/frontier-reality-check/metrics.md` và `conclusion.md`. Đây không phải thử nghiệm ThinkAI với học sinh. |
| **ĐỀ XUẤT, CHƯA KIỂM CHỨNG** | Proof-of-Learning Protocol; Thử thách Tự lực; trải nghiệm mở khóa năng lực; Sổ cái Bằng chứng; thang trợ giúp; một chủ đề Toán; giá trị so với prompt tốt. |
| **CHƯA THỬ** | Kết quả người học; retention; hiệu quả chuyển giao; độ tin cậy đo trợ giúp; chấp nhận của giáo viên/học sinh; khả năng quay lại sử dụng. |
| **TƯƠNG LAI** | learning layer đa nền tảng; đồ thị tiền đề rộng; học can thiệp cá nhân; nhiều môn; game/challenge world. |

ThinkAI hiện là **khái niệm nghiên cứu có luận điểm mạnh**, chưa phải sản phẩm đã chứng minh.

---

# 16. Thí nghiệm cần làm trước khi chốt MVP

## Hai câu hỏi phải tách riêng

1. **Hiệu quả học:** giao thức ThinkAI có tạo ra kết quả độc lập tốt hơn sau khi trợ giúp bị rút đi so với baseline mạnh không?
2. **Giá trị đo lường:** trạng thái trong Sổ bằng chứng có dự báo kết quả độc lập/kiểm tra trễ tốt hơn việc chỉ nhìn đúng–sai cuối phiên không?

Đây là hai tuyên bố giá trị khác nhau. ThinkAI chỉ được nói “cải thiện học” nếu câu hỏi 1 có bằng chứng; kết quả câu hỏi 2 chỉ cho phép nói hệ thống **phân biệt bằng chứng học tốt hơn**.

## Thiết kế đề xuất

| Nhóm | Trải nghiệm |
|---|---|
| Đối chứng mạnh | Cùng frontier model, ngân hàng bài, tổng thời gian, số lượt luyện/truy hồi và lịch kiểm tra; prompt sư phạm tốt, hỏi gợi mở và gợi ý từng bước |
| ThinkAI | Giữ các yếu tố trên tương đương; thay đổi **giao thức**: thử ban đầu bắt buộc, đo trợ giúp, giảm cue, rồi dùng bài chuyển giao gần độc lập. |

Không nên chỉ so với ChatGPT không kiểm soát; đó là baseline yếu và có thể tạo chiến thắng giả.

## Phạm vi

* đề xuất để thẩm định: **hàm số bậc nhất lớp 10**, chọn một tiểu kỹ năng cụ thể sau khi giáo viên xác nhận phù hợp chương trình;
* “dạng quen” giữ biểu diễn/cấu trúc đã luyện nhưng đổi số liệu; “chuyển giao gần” giữ nguyên lý cần dùng nhưng đổi ít nhất một yếu tố như ngữ cảnh, biểu diễn hoặc thứ tự suy luận;
* giáo viên duyệt độc lập từng cặp bài; loại cặp nếu bài mới đòi kiến thức ngoài mục tiêu, khó hơn không chủ ý hoặc không còn đo cùng khái niệm;
* cỡ mẫu chỉ được chốt sau phân tích power và khả năng tuyển người học có đồng thuận; tài liệu này không giả định 30–60 là đủ;
* nếu chưa có người học: chỉ kiểm tra kỹ thuật/bài/nhãn giáo viên, không tuyên bố cải thiện học tập.

## Chỉ số

**Cho câu hỏi 1:** độ chính xác chuyển giao gần độc lập sau 3–7 ngày.  
**Cho câu hỏi 2:** khả năng phân loại/dự báo kết quả độc lập của trạng thái bằng chứng so với baseline chỉ dùng đúng–sai cuối phiên.  
**Phụ:** chuyển giao ngay, số trợ giúp ở bài tiếp theo, thời gian, bỏ cuộc.

## Điều kiện tiếp tục

Chỉ chuyển sang xác định MVP đầy đủ nếu giao thức:

* vận hành được và học sinh chấp nhận;
* cung cấp kết luận năng lực độc lập chính xác hơn hoặc cải thiện có ý nghĩa;
* không chỉ tạo thêm bài kiểm tra/friction;
* vượt baseline prompt mạnh một cách trung thực.

---

# 17. ThinkAI có thể trở thành gì sau này?

| Giai đoạn | Khả năng | Trạng thái |
|---|---|---|
| 1. Bằng chứng hẹp | Một kỹ năng, đo trợ giúp, chuyển giao gần, kiểm tra trễ | Ứng viên MVP sau xác thực |
| 2. Nhiều khái niệm | Sổ bằng chứng mở rộng, bằng chứng mong manh, lịch truy hồi | Giả thuyết tương lai |
| 3. Tiền đề và misconception | Kiểm tra lỗ hổng tiền đề; misconception chỉ là giả thuyết | Cần giáo viên và calibration |
| 4. Học can thiệp | So sánh gợi ý, phản ví dụ, teach-back cho cùng mục tiêu | Cần thử nghiệm tuần tự và dữ liệu |
| 5. Teacher mode | Bằng chứng mong manh, khoảng trống lớp, kết luận AI chưa chắc | Cần nghiên cứu quy trình giáo viên |
| 6. Learning layer | Học ở bất cứ đâu; xác minh trong ThinkAI | Tầm nhìn dài hạn, tích hợp khó |
| 7. Nhiều môn/challenge world | Vật lý, Hóa, lập trình; Transfer Quest; capability map | Chỉ sau khi lõi được chứng minh |

## “Learn anywhere. Prove it in ThinkAI.”

Thay vì cạnh tranh để thay thế ChatGPT, Gemini, giáo viên, sách và video, ThinkAI có thể trở thành lớp xác minh:

**Nguồn học bất kỳ → Thử thách xác minh ThinkAI → Sổ cái Bằng chứng → Can thiệp/thử thách tiếp theo**

Đây có thể là tầm nhìn mạnh hơn all-in-one tutor, vì nó tập trung vào việc mà nguồn học hiện tại không nhất thiết chịu trách nhiệm: duy trì bằng chứng về điều người học thực sự làm được. Tuy nhiên, khi học ngoài ThinkAI, hệ thống khó biết lượng trợ giúp đã nhận; vì vậy “learning layer” chưa phù hợp MVP.

---

# 18. Hướng kỹ thuật ở mức dễ hiểu

ThinkAI ưu tiên dùng model/API hiện có thay vì huấn luyện foundation model.

## Luồng hệ thống đề xuất

**Giao diện học sinh/giáo viên**  
↓  
**Bộ điều phối học tập ThinkAI**  
├─ ngân hàng bài và nhãn khái niệm  
├─ bộ điều khiển mức trợ giúp  
├─ API gia sư AI  
├─ bộ chọn/sinh ứng viên bài chuyển giao  
├─ bộ chấm đáp án và đánh giá lý giải  
├─ Sổ cái Bằng chứng Học tập  
└─ lịch kiểm tra lại

## Việc thực sự cần AI

* hiểu cách diễn đạt/lý giải đa dạng của học sinh;
* tạo gợi ý phù hợp với lỗi hiện tại;
* tạo **ứng viên** bài chuyển giao;
* tạo phản ví dụ hoặc câu hỏi phân biệt giả thuyết;
* đánh giá phần giải thích ngôn ngữ, với bằng chứng và quyền không chắc chắn.

## Việc nên dùng phần mềm thông thường

* lưu mức hỗ trợ và lịch sử phiên;
* khóa/mở trợ giúp;
* lên lịch kiểm tra;
* chấm toán bằng quy tắc/symbolic solver khi có thể;
* kiểm tra đáp án;
* tính trạng thái bằng chứng;
* analytics và báo cáo;
* quyền truy cập, xóa dữ liệu và nhật ký phiên bản.

AI không nên được dùng để “phán xét mọi thứ” khi một kiểm tra xác định làm tốt hơn.

---

# 19. Dữ liệu và đánh giá

## MVP cần dữ liệu gì?

* câu hỏi Toán THPT được phép sử dụng;
* nhãn khái niệm và tiền đề nhỏ;
* lời giải/đáp án được giáo viên hoặc solver xác minh;
* nhóm bài chuyển giao gần đã được rà soát;
* các lần thử của học sinh;
* loại/mức trợ giúp;
* kết quả độc lập ngay và sau thời gian.

Eedi có thể hữu ích cho nghiên cứu misconception và xây tình huống lỗi, nhưng giấy phép/quyền truy cập phải được xác minh trước khi dùng. Eedi không nên trở thành toàn bộ sản phẩm ThinkAI.

## Có thể đo khách quan

* đúng/sai ở bài độc lập;
* tỷ lệ bài chuyển giao hợp lệ theo giáo viên/solver;
* lượng trợ giúp đã mở;
* thời gian đến khi tự giải;
* độ chính xác dự đoán kết quả bài tiếp theo;
* calibration và tỷ lệ “false mastery”;
* kết quả sau thời gian;
* tỷ lệ bỏ phiên.

## Cần con người xác nhận

* tính tương đương của bài chuyển giao;
* lý do sai/misconception;
* mức hữu ích của gợi ý;
* chấp nhận UX;
* tác động lên thói quen và cảm xúc;
* giá trị báo cáo cho giáo viên.

---

# 20. Rủi ro và cách kiểm tra

| Rủi ro | Vì sao nghiêm trọng | Cách kiểm tra/giảm thiểu |
|---|---|---|
| Prompt tốt đã làm được phần lớn | ThinkAI có thể chỉ là wrapper | Baseline phải là cùng model + prompt sư phạm mạnh + quiz/lịch nhắc hợp lý |
| Bài chuyển giao AI sinh không hợp lệ | Có thể kiểm tra sai kỹ năng hoặc sai đáp án | Ngân hàng duyệt trước; solver; giáo viên; tỷ lệ từ chối |
| Một lần đúng không chứng minh mastery | Dễ tuyên bố quá mức | Dùng ngôn ngữ “bằng chứng”, nhiều loại bài và kiểm tra trễ |
| Retention cần thời gian | Không thể demo sống trong 3 phút | Dữ liệu phiên lịch sử có timestamp, ghi rõ demo |
| Định lượng trợ giúp khó | Mức 1–5 có thể giả chính xác | Thang nhỏ do giáo viên quy định; lưu nội dung thực; đánh giá đồng thuận |
| Cần người học thật | Không thể suy ra learning gain từ benchmark kỹ thuật | Thí nghiệm có đồng thuận; không tuyên bố trước |
| Biết mình bị kiểm tra làm đổi hành vi | Có thể không phản ánh tự học bình thường | Cùng quy trình giữa nhóm; phỏng vấn và đo bỏ cuộc |
| Quá nhiều kiểm tra gây phiền | Học sinh quay về ChatGPT | Thiết kế mỗi bước như progression/mở khóa; challenge ngắn; có lý do rõ; điều chỉnh tần suất; đo retention/return |
| Giáo viên chưa muốn dùng | Giá trị vận hành chưa được chứng minh | Phỏng vấn và thử báo cáo với giáo viên sớm |
| Scope phình nhanh | Mất khả năng kiểm chứng | Một chủ đề, một policy, một loại transfer trước |
| AI chẩn đoán tự tin nhưng sai | Gây dạy sai và gắn nhãn | Misconception là giả thuyết; câu hỏi phân biệt; abstain; giáo viên phản biện |
| Dữ liệu trẻ vị thành niên | Quyền riêng tư và trách nhiệm | Dữ liệu tối thiểu, đồng thuận, thời hạn lưu, xóa, không tái huấn luyện mặc định |

---

# 21. Mức phù hợp với AI Young Guru / Bảng B

Nhóm **đã có văn bản thể lệ chính thức của Cuộc thi Sáng tạo trẻ Quốc gia trong lĩnh vực Trí tuệ nhân tạo năm 2026** trong bộ tài liệu dự án [14]. Đối với Bảng B, hồ sơ và đánh giá yêu cầu đội thể hiện rõ vấn đề thực tiễn, đối tượng sử dụng, dữ liệu, cách xử lý dữ liệu, công cụ/mô hình AI, luồng hệ thống, kiểm thử - đánh giá - cải tiến, khả năng vận hành/ứng dụng và sử dụng AI có trách nhiệm. Các vòng sau cũng có thể đưa dữ liệu, phản hồi hoặc yêu cầu bổ sung để đội cải tiến sản phẩm.

ThinkAI có thể map khá tự nhiên vào khung này, nhưng **mức cạnh tranh vẫn phụ thuộc vào validation thật**, không phải chỉ vì đúng cấu trúc hồ sơ.

| Khía cạnh | ThinkAI có thể thể hiện | Khoảng trống hiện tại |
|---|---|---|
| Vấn đề thực tế | Thành công có AI bị nhầm với học độc lập | Chưa có dữ liệu người dùng Việt Nam |
| Người dùng | Học sinh THPT tự học Toán bằng AI | Cần phỏng vấn/xác nhận |
| AI có ý nghĩa | Hiểu lý giải, điều chỉnh hint, tạo ứng viên challenge | Phải chứng minh hơn prompt tốt |
| Dữ liệu | Bộ bài, nhãn, lượt thử, trợ giúp, kết quả độc lập | Cần kiểm tra giấy phép và teacher review |
| Quy trình hệ thống | Học có trợ giúp → tự lực → quay lại → cập nhật | Cần prototype sau thí nghiệm |
| Kiểm chứng đầu ra | Solver, bộ bài giữ lại, bài transfer, delayed test | Chưa chạy trên học sinh |
| Cải tiến | So sánh policy/can thiệp và sửa bằng evidence | Tương lai |
| Trách nhiệm AI | Không gắn nhãn năng lực, minh bạch hỗ trợ, quyền sửa | Cần chính sách dữ liệu trẻ em |
| Demo | Cùng đáp án đúng nhưng evidence khác; sau đó “Prove → Level Up” nhìn thấy ngay | Cần dữ liệu demo trung thực |
| Thay đổi vòng sau | Đổi chủ đề, bộ bài, policy trợ giúp | Tốt nếu lõi nhỏ và có bank xác minh |

Ý tưởng có hình dạng phù hợp thi vì vấn đề, AI, dữ liệu và kiểm chứng có thể nhìn thấy. Tuy nhiên, **điểm mạnh thi đấu phụ thuộc vào kết quả thí nghiệm**, không chỉ câu chuyện.

---

# 22. Điều ThinkAI không nên trở thành

* chatbot gia sư chung;
* wrapper của ChatGPT;
* công cụ hỏi gì đáp nấy;
* hệ thống điểm mastery 0–100 không giải thích được;
* bộ phân loại “phong cách học” hoặc tâm lý thiếu căn cứ;
* nền tảng nhiều môn khổng lồ ngay từ MVP;
* lộ trình AI tạo một lần rồi coi là đúng;
* hệ thống gắn misconception chắc chắn chỉ từ một câu sai;
* game có XP/streak/coin nhưng progression không gắn với evidence, transfer hoặc retention;
* sản phẩm tuyên bố đã cải thiện học tập trước khi thử với người dùng.

---

# 23. Nhóm cần quyết định gì?

## Quyết định đề nghị

Nhóm **chưa cần phê duyệt xây MVP đầy đủ**. Nhóm cần quyết định có đồng ý đầu tư vào **một thí nghiệm xác thực** hay không.

### Câu hỏi thảo luận

1. Chúng ta có đồng ý rằng “thành công có AI ≠ bằng chứng tự lực” là vấn đề đủ mạnh không?
2. “Xác minh điều còn lại sau khi AI giúp” có đủ rõ và đáng nhớ để làm lõi ThinkAI không?
3. ThinkAI có nên lấy trải nghiệm **Learn → Struggle → Hint → Solve → Prove → Remember → Level Up** làm loop người dùng chính không?
4. Product form nên ưu tiên:
   * capability-unlocking challenge app;
   * hybrid challenge app + giáo viên;
   * learning verification layer dài hạn?
5. Toán THPT có phải miền MVP đúng không? Chủ đề nào phù hợp nhất?
6. Independence Trial/Thử thách Tự lực có đủ thuyết phục không?
7. Tính năng tương lai nào quan trọng nhất: tiền đề, misconception, retention, teacher mode hay learning layer?
8. Rủi ro nào làm chúng ta do dự nhất?
9. Nhóm có phê duyệt thí nghiệm đối chứng mạnh trước khi triển khai MVP không?

### Phiếu quyết định

| Nội dung | Đồng ý | Chưa đồng ý | Cần thêm bằng chứng/Ghi chú |
|---|:---:|:---:|---|
| Vấn đề cốt lõi đủ mạnh | ☐ | ☐ | |
| Chọn Proof-of-Learning Protocol làm lõi, Thử thách Tự lực làm signature moment | ☐ | ☐ | |
| Chọn trải nghiệm mở khóa năng lực thay cho UI “đánh giá liên tục” | ☐ | ☐ | |
| Chọn một chủ đề Toán THPT để thử | ☐ | ☐ | |
| Mời giáo viên duyệt bộ bài/transfer | ☐ | ☐ | |
| Chạy baseline gia sư frontier mạnh | ☐ | ☐ | |
| Chưa xây platform đa môn | ☐ | ☐ | |

### Điều kiện “GO” đề xuất

* giáo viên đồng ý bộ bài và tiêu chí transfer;
* có cách thử hợp pháp/đạo đức với người học hoặc giới hạn rõ nghiên cứu kỹ thuật;
* giao thức ThinkAI tạo bằng chứng tốt hơn baseline đơn giản;
* học sinh không bỏ cuộc vì friction;
* nhóm vẫn giải thích được sản phẩm trong một câu.

### Điều kiện “STOP/REFRAME”

* prompt tốt + quiz/lịch nhắc tái tạo gần toàn bộ giá trị;
* bài chuyển giao không thể xác minh ổn định;
* người học thấy quy trình quá phiền;
* không có quyền truy cập giáo viên/người học để kiểm chứng;
* sản phẩm quay lại thành chatbot + dashboard.

---

# 24. Kết luận đề xuất

ThinkAI có một lý do tồn tại tiềm năng mạnh hơn “AI tutor cá nhân hóa”:

> **ThinkAI không chỉ giúp học sinh làm được bài. ThinkAI giúp người học biến hỗ trợ của AI thành năng lực họ có thể tự sở hữu, rồi thu thập bằng chứng về điều họ vẫn làm được khi trợ giúp thay đổi, bài toán thay đổi và thời gian trôi qua.**

Về trải nghiệm, hướng đề xuất là:

> **Learn → Struggle → Hint → Solve → Prove → Remember → Level Up.**

Backend vẫn nghiêm ngặt về evidence; frontend khiến người học cảm thấy mình đang **mở khóa và củng cố kỹ năng**, không phải liên tục bị chấm.

Đây chưa phải kết quả đã chứng minh. Nhưng nó là một giả thuyết sản phẩm cụ thể, khác biệt đủ rõ, có cách đo và có thể thu hẹp thành một thử nghiệm nhỏ.

**Khuyến nghị cho nhóm:** tiếp tục một vòng xác thực tập trung; chưa chốt MVP đầy đủ; chưa mở rộng nhiều môn; chưa đầu tư vào Learning Twin hoặc dashboard lớn.

---

# Nguồn chính và giới hạn trích dẫn

1. Bastani, H. và cộng sự (2025), *Generative AI without guardrails can harm learning: Evidence from high school mathematics*, PNAS. https://doi.org/10.1073/pnas.2422633122  
   **Giới hạn:** một bối cảnh Toán THPT; không chứng minh mọi AI đều gây hại.
2. Kestin, G. và cộng sự (2025), *AI tutoring outperforms in-class active learning*, Scientific Reports. https://doi.org/10.1038/s41598-025-97652-6  
   **Giới hạn:** thử nghiệm ngắn, Vật lý đại học, gia sư được thiết kế kỹ; không phải bằng chứng retention dài hạn.
3. Google LearnLM (2026), trang nghiên cứu chính thức, báo cáo thử nghiệm đăng ký trước của Guided Learning tại Sierra Leone. https://cloud.google.com/solutions/learnlm  
   **Giới hạn:** tóm tắt chính thức của nhà cung cấp; tài liệu này chưa thẩm định độc lập toàn bộ báo cáo.
4. Pan, S. C. & Rickard, T. C. (2018), *Transfer of test-enhanced learning: Meta-analytic review and synthesis*. https://pubmed.ncbi.nlm.nih.gov/29733621/  
   **Giới hạn:** retrieval practice, không phải nghiên cứu ThinkAI/AI tutor.
5. Latimier, A. và cộng sự (2024), spaced retrieval trong các môn STEM nhập môn. https://doi.org/10.1186/s40594-024-00468-5  
   **Giới hạn:** hiệu quả thay đổi theo bối cảnh; không cung cấp lịch tối ưu duy nhất.
6. Bisra, K. và cộng sự (2018), meta-analysis về self-explanation. https://doi.org/10.1007/s10648-018-9434-x
7. Kapur, M. (2008), nghiên cứu productive failure. https://doi.org/10.1080/07370000802212669
8. Khan Academy, Khanmigo — mô tả sản phẩm chính thức. https://www.khanacademy.org/khan-labs
9. McGraw Hill ALEKS — mô tả knowledge-space/adaptive assessment chính thức. https://www.aleks.com/about_aleks/research_behind
10. OpenAI ChatGPT Study Mode — release notes chính thức. https://help.openai.com/en/articles/11391654-chatgpt-business-release-notes
11. Google Gemini Guided Learning — giới thiệu chính thức. https://blog.google/products-and-platforms/products/education/guided-learning
12. *Uncertainty-aware Knowledge Tracing*, AAAI 2025. https://ojs.aaai.org/index.php/AAAI/article/view/35007/37162
13. Bằng chứng nội bộ repository: `docs/research/frontier-reality-check/` và `docs/research/thinkai-product-direction/`.
14. *Thể lệ Cuộc thi Sáng tạo trẻ Quốc gia trong lĩnh vực Trí tuệ nhân tạo năm 2026* — văn bản chính thức đang có trong bộ tài liệu dự án; dùng để đối chiếu yêu cầu Bảng B, hồ sơ, demo, dữ liệu/AI và nội dung cải tiến ở các vòng sau.

**Lưu ý cạnh tranh:** việc phù hợp thể lệ không tự động chứng minh tính mới hay hiệu quả. ThinkAI vẫn phải vượt baseline mạnh và có bằng chứng người dùng/technical validation trung thực.
