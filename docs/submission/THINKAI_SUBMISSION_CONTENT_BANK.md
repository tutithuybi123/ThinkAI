# THINKAI — Content Bank cho hồ sơ dự thi

> Nguồn chính: `docs/submission/THINKAI_SUBMISSION_SOURCE.md` ở trạng thái Competition Demo v1.1. Dùng tài liệu này để chọn và sắp xếp nội dung cho PDF, video trình bày và demo; không dùng thay cho báo cáo hoặc script cuối.

## 1. ThinkAI core facts

- **Vấn đề:** một học sinh có thể đưa ra đáp án đúng sau khi AI gợi ý, nhưng điều đó chưa chứng minh em tự vận dụng được ý tưởng trong tình huống khác.
- **Người dùng:** học sinh THPT là người học chính; giáo viên/content reviewer chuẩn bị và duyệt nội dung; presenter/auditor xem bằng chứng của demo.
- **Luận điểm cốt lõi:** *assisted Practice success is not equivalent to independently demonstrated capability* — làm đúng khi có hỗ trợ khác với tự thể hiện năng lực.
- **Giải pháp:** ThinkAI cho phép Practice có hỗ trợ AI bị giới hạn, ghi lại điều kiện hỗ trợ, rồi dùng Independent Transfer không có hỗ trợ trước khi nộp để tạo bằng chứng mạnh hơn.
- **Demo v1.1 hiện tại:** một vertical slice Toán lớp 10 theo Subject → Topic → MicroSkill, với content đã review/versioned, Practice, hybrid grading, Transfer, connection reveal, Capability Receipt, Progress/Audit và `/ops` Content Studio tối thiểu.
- **Khác biệt chính:** ThinkAI không là chatbot giải bài. AI không tự chấm, pass, mở khóa hay cấp receipt; backend policy và nội dung đã duyệt giữ authority. Receipt chỉ nói điều đã quan sát được ở một cặp bài, không gắn nhãn mastery toàn cục.

## 2. Problem → Insight → Solution

### Problem

AI có thể giúp học sinh bắt đầu, nhớ khái niệm hoặc chọn hướng giải. Đây là lợi ích thực tế, nhưng kết quả đúng sau hỗ trợ không tự cho biết học sinh có thể tự áp dụng ý tưởng đó khi đề bài thay đổi. Nếu chỉ nhìn đáp án Practice, giáo viên và học sinh khó phân biệt “đã được dẫn tới lời giải” với “đã vận dụng độc lập”.

### Insight

Không cần cấm AI hoặc coi việc xin hỗ trợ là gian lận. Hỗ trợ có thể là một phần hữu ích của việc học, miễn là hệ thống ghi nhận trung thực điều kiện hỗ trợ và không dùng nó để tạo một kết luận quá mức. Điều quan trọng là tách không gian học có hỗ trợ khỏi thời điểm cần quan sát sự vận dụng độc lập.

### Solution

ThinkAI dùng ba lớp liên kết:

```text
Practice có AI hỗ trợ bị giới hạn
        ↓ ghi assistance evidence
Independent Transfer không có Practice assistance/context
        ↓ backend xác minh theo policy
Capability Receipt / Progress có giới hạn
```

Điểm cần nhấn khi viết/nói: ThinkAI không tuyên bố biết mọi thứ học sinh “đã master”. Nó ghi một claim hẹp hơn: học sinh đã hoàn thành Practice trong điều kiện hỗ trợ nào và có/không tự thực hiện được Transfer đã review.

## 3. Product flow

| Bước | Điều xảy ra | Vì sao cần | Nên thấy trong ảnh/video |
|---|---|---|---|
| Subject / Topic / MicroSkill | Learner chọn đường học đã publish. | Gắn bài học với một kỹ năng cụ thể, không phải chat chung chung. | Danh sách/path kỹ năng; micro-skill được chọn. |
| Practice | Server bind pair đã review; learner làm đáp án hoặc written solution. | Tạo cơ hội luyện ý tưởng trong một task cụ thể. | Đề Practice và vùng nhập bài làm. |
| Optional Practice Companion | Learner có thể hỏi AI theo approved guidance. | Hỗ trợ học tập khi cần, không phạt learner vì xin giúp. | Một câu hỏi ngắn và phản hồi gợi mở, không lộ đáp án. |
| Learner submission | Learner nộp bài Practice. | Tách hoạt động làm bài khỏi việc chấm và evidence. | Nút submit, bài làm learner. |
| Grading / feedback | Server kết hợp phần chấm xác định và rubric evidence khi cần; Process Feedback giải thích sau submit. | Có phản hồi cho việc học nhưng không để AI tự quyết pass. | Outcome/feedback, không cần show nội bộ. |
| Independent Transfer | Learner bắt đầu bài mới cùng micro-skill nhưng khác biểu diễn/bối cảnh. | Quan sát việc tự vận dụng sau Practice. | Màn hình nói rõ không có hint/chat/context Practice. |
| Transfer result | Transfer được chấm sau submit. | Bảo vệ điều kiện độc lập đến thời điểm learner trả lời. | Kết quả verified hoặc recovery không reveal. |
| Connection reveal | Khi Transfer đủ điều kiện, hiển thị mối liên hệ do content đã duyệt. | Giúp learner phản tư sau khi đã tự thử. | Lời giải thích “cùng ý tưởng, tình huống mới”. |
| Capability Receipt / Progress | Backend issue receipt và rebuild progress từ evidence. | Trình bày điều hệ thống quan sát được, không overclaim mastery. | Receipt, lịch sử/progress và audit summary. |

Nếu Transfer chưa đạt: không reveal connection/answer, không issue receipt. Nếu có pair mới chưa exposed, hệ thống có thể tạo independent attempt mới; hết pair mới thì trả `NO_FRESH_TRANSFER_AVAILABLE` thay vì tái dùng bài đã lộ.

## 4. AI in ThinkAI

### Practice Companion

AI Companion chỉ tồn tại ở Practice. Nó có thể hỏi lại learner, nhắc khái niệm hoặc gợi ý hướng suy nghĩ theo AI guidance đã duyệt. Nó không phải general chat và không được đưa đáp án cuối/lời giải hoàn chỉnh.

Backend kiểm tra candidate reply trước delivery, tự phân loại mức hỗ trợ và ghi sự kiện assistance. AI không quyết điểm, pass, progression, receipt hay nội dung Transfer.

### Hybrid grading và rubric evaluator

Với phần có thể kiểm tra chắc chắn, ThinkAI dùng deterministic validation. Với written solution/reasoning cần đánh giá theo tiêu chí, evaluator trả các facets/criteria theo rubric đã review; nó không trả “đậu/rớt” authoritative.

Server kiểm tra schema, tính đầy đủ và nhất quán của criteria, rồi kết hợp evidence để ra outcome. Chỉ `CORRECT` có thể qua full gate. Nếu AI unavailable, malformed, uncertain hoặc evidence conflict, kết quả là `UNCERTAIN`: hệ thống không cấp pass chỉ vì muốn đoán.

### Practice Process Feedback

Đây là phản hồi sau Practice, dùng evidence đã có để giúp learner hiểu quá trình. Nó có thể nói learner đã dùng loại hỗ trợ nào hoặc còn bước nào nên xem lại; nó không sửa điểm, tạo receipt hay chạy trong Transfer.

### Transfer post-submit evaluation

Transfer evaluation chỉ chạy sau learner submit và chỉ dùng dữ liệu của Transfer. Nó không nhận transcript, hints, answers, feedback hay mapping của Practice. Đây là ranh giới sản phẩm quan trọng hơn là một chi tiết kỹ thuật.

### Câu giải thích ngắn cho judge

“AI giúp học sinh học trong Practice; server giữ quyền quyết định evidence và progression. Khi AI không chắc hoặc không hoạt động, ThinkAI không tự nâng kết quả — learner vẫn có luồng recovery trung thực.”

## 5. Practice vs Transfer

Practice hữu ích vì học sinh được phép thử, sai, xin gợi ý và tiếp tục suy nghĩ. Một conceptual hint hoặc strategic hint có thể giúp em vượt qua điểm mắc; ThinkAI không coi việc đó là lỗi hay điểm trừ.

Tuy vậy, hỗ trợ là một điều kiện của kết quả. Nếu Practice có chat/hint/context, kết quả đúng chỉ cho biết learner giải được trong điều kiện đó. Nó chưa trả lời câu hỏi quan trọng hơn: khi gặp một bài mới, learner có tự nhận ra và dùng cùng ý tưởng không?

Vì vậy Transfer tách riêng: cùng micro-skill nhưng đổi representation hoặc context; trước submit không có Practice Companion, hint, transcript, answer, reference solution, feedback, pair relation hoặc connection reveal. ThinkAI không thể buộc learner “quên” điều đã học, nhưng cam kết hệ thống không tiếp tục đưa đường đi của Practice vào bước cần quan sát độc lập.

Transfer đúng là bằng chứng mạnh hơn vì nó quan sát learner áp dụng ý tưởng sau Practice trong điều kiện hệ thống đã loại bỏ trợ giúp của chính nó. Cách diễn đạt an toàn là “bằng chứng mạnh hơn cho lần vận dụng này”, không phải “bằng chứng học sinh đã thành thạo mọi bài thuộc kỹ năng”.

## 6. Teacher/content system

`/ops` là Content Studio tối thiểu để teacher/content reviewer quản lý cùng content repository learner đang dùng. Content đi theo Subject → Topic → MicroSkill và chứa:

- Practice/Transfer pair cùng mục tiêu học tập;
- expected result và rubric/criteria;
- reference solutions — hỗ trợ hiểu các cách giải hợp lệ, không ép learner sao chép;
- common misconceptions — giúp guidance/feedback bám lỗi thường gặp;
- AI guidance — giới hạn AI có thể hỗ trợ như thế nào;
- connection reveal — lời giải thích sau khi Transfer đủ điều kiện.

Lifecycle `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → DEPRECATED` có ý nghĩa sản phẩm: chỉ DRAFT sửa được; review freeze nội dung; publish dùng đúng body đã approve; chỉnh sửa sau review phải tạo version mới. Nhờ đó, bài, rubric và guidance trong evidence là phiên bản thật learner đã dùng, không phải một bản đã sửa sau này.

Không mô tả `/ops` là LMS đầy đủ; điểm mạnh cần nói là reviewed, versioned content làm cho AI guidance, grading và evidence có thể kiểm tra lại.

## 7. Architecture explanation

### Nhãn cho sơ đồ

```text
Learner ─→ ThinkAI Web/App ─→ Practice | Grading | Transfer | Evidence
                                  │                     │
Teacher/Content reviewer ─→ /ops ─┴→ Reviewed content ──┘
                                  │
                           PostgreSQL
                                  │
                            AI provider
```

| Block | Giải thích ngắn |
|---|---|
| Learner | Làm Practice, có thể nhận bounded help, sau đó làm Transfer độc lập. |
| ThinkAI Web/App | Hiển thị flow và gọi backend; không tự tạo policy. |
| Practice / Grading / Transfer / Evidence | Thực thi ranh giới học tập, chấm, reveal, receipt và ghi facts. |
| `/ops` + reviewed content | Nơi nội dung được tạo, review, version và publish trước khi learner dùng. |
| PostgreSQL | Lưu content versions, sessions và append-only evidence/receipt/progress. |
| AI provider | Tạo bounded assistance hoặc rubric/feedback evidence; không nắm authority. |

### Luồng end-to-end

Reviewer publish một pair và guidance. Learner bắt đầu Practice; app lấy pair server-bound và có thể gọi AI qua boundary. Khi submit, backend ghi evidence/grading. Learner làm Transfer độc lập; backend chấm, chỉ reveal connection khi đủ điều kiện, rồi issue receipt/progress từ PostgreSQL evidence.

## 8. Technology and AI tools

| Technology / tool | Vai trò | Vì sao dùng |
|---|---|---|
| TypeScript | Ngôn ngữ chính | Giữ contracts giữa UI, policy và data rõ ràng. |
| Next.js + React | Web app và API route | Một ứng dụng web cho learner và `/ops`. |
| Node.js | Server runtime | Chạy backend policy và integration. |
| PostgreSQL | Persistent data layer | Lưu content/version, session, evidence và receipt bền vững. |
| Docker + Docker Compose | Đóng gói deployment | Chạy app, database và ingress thành stack nhỏ. |
| TokenRouter | AI provider integration hiện tại | Qua giao diện OpenAI-compatible, chọn provider/model bằng cấu hình. |
| OpenRouter | Provider-compatible alternative | Giữ kiến trúc không khóa chặt vào một provider. |
| Cloudflare Tunnel | Public ingress khi deploy | Không cần expose trực tiếp app/database ra host port. |
| Playwright + Node tests | Verification | Kiểm tra UI, policy, isolation và persistence. |

Khi ghi vào PDF, chỉ điền tên provider/model chính xác sau khi cấu hình release đó được qualification; không đưa API key hoặc cấu hình bí mật.

## 9. Testing and evidence

| Nhóm verification | Điều nó chứng minh |
|---|---|
| Assistance/AI boundary tests | Candidate lộ đáp án bị chặn; AI không tự khai báo authority; help được ghi như evidence. |
| Hybrid grading tests | Alternate method hợp lệ có thể được chấp nhận; evidence thiếu/mâu thuẫn không tạo pass. |
| Content lifecycle tests | Nội dung review/publish immutable và learner chỉ nhận content phù hợp. |
| Transfer isolation/fresh-attempt tests | Practice data không rò vào Transfer; task đã exposed không bị dùng lại như new verification. |
| Receipt/evidence tests | Receipt phải dựa vào đúng Practice–Transfer chain, version và append-only facts. |
| PostgreSQL/runtime tests | Thiết kế có persistence/restart/migration coverage; cần ghi đúng trạng thái run cuối. |
| Learner E2E | UI không làm lộ Transfer trước khi có phiên server. |

Source v1.1 ghi nhận lần chạy 2026-08-21 có TypeScript check sạch; `npm test` có 95 pass, 1 fail, 12 skip/108. Không dùng con số này để nói “mọi test release đều pass”: benchmark runner-state còn fail và PostgreSQL/runtime checks cần chạy trong môi trường phù hợp. Điều đáng dùng trong report là các ranh giới đã được tự động kiểm tra, cùng trạng thái còn lại được nêu trung thực.

## 10. Limitations and future direction

### CURRENT LIMITATIONS

- Demo là một lát cắt Toán lớp 10 và content bank nhỏ, không là hệ thống nhiều môn/lớp.
- Slice 11 vẫn hoàn tất deploy persistent, provider/model live qualification và release-like verification.
- Không có claim về user study, teacher approval thực tế hay hiệu quả học tập quy mô lớn.
- `/ops` là Content Studio tối thiểu, không là full LMS/classroom management.
- Không có handwriting/OCR, general chatbot hoặc mastery score toàn cục.

### FUTURE DEVELOPMENT

- Mở rộng curriculum/content bank sau khi giữ được review/version discipline.
- Thử handwriting/photo input với learner confirmation trước grading.
- Nghiên cứu người dùng và teacher workflow với consent phù hợp.
- Chỉ thêm adaptive pathways hay long-term evidence sau khi có policy và validation rõ ràng.

## 11. Bảng B 12-page report content bank

| Mục Bảng B | Key points để viết | Screenshot/diagram nên dùng | Không nên overexplain |
|---|---|---|---|
| 1. Vấn đề | Đúng có hỗ trợ không tự chứng minh tự vận dụng. | Sơ đồ Practice → Transfer. | Lịch sử code. |
| 2. Đối tượng | Học sinh THPT; teacher/reviewer chuẩn bị content. | Learner path + `/ops` overview. | Persona/khảo sát không có evidence. |
| 3. Dữ liệu, câu lệnh, AI | AI inputs/outputs bounded; Prompt Log ghi phát triển trung thực. | Bảng AI boundaries. | Prompt bí mật hoặc chain-of-thought. |
| 4. Thu thập/xử lý/chuẩn hóa | Reviewed/versioned content; server evidence; synthetic demo data. | Lifecycle DRAFT→PUBLISHED. | Database schema chi tiết. |
| 5. Công cụ/model/platform | TypeScript/Next/Node/Postgres, TokenRouter-compatible AI, Docker/Cloudflare. | Bảng technology §8. | Toàn bộ `package.json`. |
| 6. Kiến trúc | Learner + `/ops` → ThinkAI services → AI/PostgreSQL. | Sơ đồ §7. | Class/module internals. |
| 7. Kiểm thử | Boundary, isolation, lifecycle, receipt/persistence tests; nêu trạng thái run thật. | Test result summary hoặc terminal artifact sạch. | Danh sách hàng chục test. |
| 8. Hạn chế/rủi ro/hướng phát triển | Scope hẹp; Slice 11/live qualification; future không claim hiện tại. | Bảng current/future. | Hứa hẹn metric không đo. |
| 9. Prompt Log/minh chứng | Append-only log, Git history, commands/test artifacts. | Prompt Log structure hoặc evidence index. | Tái dựng prompt bị thiếu. |

## 12. 5-minute presentation content bank

| Phần | Talking points mạnh | Visual | Tầm quan trọng |
|---|---|---|---|
| Problem | Đáp án đúng sau AI help chưa đủ nói learner tự làm được. | Một tình huống Practice có hint. | Rất cao |
| Key insight | Không cấm help; ghi điều kiện help và tách evidence. | Flow hai pha. | Rất cao |
| Solution | Practice có bounded AI → independent Transfer → receipt. | Sơ đồ core loop. | Rất cao |
| Product flow | Đi qua 8 bước canonical, không đi sâu API. | 3–4 màn chính. | Cao |
| AI use | AI hỗ trợ/evaluator evidence; server policy authoritative/fail-closed. | Bảng “AI does / server decides”. | Cao |
| Why Transfer | Không chat/hint/context; bài mới cùng idea. | Transfer screen “no help”. | Rất cao |
| Credibility | Reviewed/versioned content, Postgres evidence, automated boundary tests. | Architecture + receipt/audit. | Trung bình-cao |
| Practical value | Giúp learner nhận feedback và giúp giáo viên hiểu điều kiện evidence. | Receipt/Progress. | Trung bình |
| Closing | ThinkAI đo đúng hơn điều một lần làm bài thực sự cho thấy. | Core thesis + final receipt. | Cao |

Không cần chia thời gian chính xác ở đây. Tránh biến presentation thành demo từng nút hoặc danh sách thư viện.

## 13. 3-minute demo plan

| Step | Screen/action | Viewer cần thấy | Điều nó chứng minh |
|---|---|---|---|
| 1 | Home / chọn skill | Subject/Topic/MicroSkill được chọn. | Flow gắn với content đã publish, không phải chat trống. |
| 2 | Practice | Đề và vùng bài làm. | Learner thực sự giải một task. |
| 3 | Hỏi Practice Companion | Một gợi ý bounded, không đáp án. | AI giúp học nhưng có giới hạn. |
| 4 | Submit Practice | Kết quả/feedback sau submit. | Chấm/feedback không chỉ là câu trả lời chat. |
| 5 | Start Transfer | Dòng nói không có hint/chat/Practice context. | Ranh giới độc lập nhìn thấy được. |
| 6 | Submit Transfer | Kết quả Transfer. | Learner tự vận dụng trong bài mới. |
| 7 | Connection reveal | Mối liên hệ giữa hai bài hiện sau verified result. | Reveal là reflection sau evidence, không là hint trước đó. |
| 8 | Capability Receipt / Progress | Receipt và lịch sử/progress. | Claim có giới hạn, được dựng từ evidence. |

Nếu live AI chưa qualified lúc quay, dùng fallback `AI_UNAVAILABLE` trung thực hoặc quay flow deterministic; không trình bày authored fallback như AI output. Không cần demo `/ops` trong cùng 3 phút trừ khi recorder đã chắc luồng này ổn định.

## 14. Screenshot and diagram shot list

### MUST HAVE

1. Practice screen có đề, answer/written solution area.
2. Practice Companion đang đưa gợi ý không lộ đáp án.
3. Practice result/feedback sau submit.
4. Independent Transfer screen với thông điệp không có AI help/Practice context.
5. Connection reveal sau Transfer đủ điều kiện.
6. Capability Receipt.
7. Progress/Audit evidence summary.
8. Một sơ đồ kiến trúc conceptual ở §7.
9. Một sơ đồ product loop Practice → Transfer → Receipt.

### NICE TO HAVE

1. `/ops` Content Studio shell/lifecycle publish.
2. So sánh screenshot Practice có help và Transfer không help.
3. Recovery hoặc `NO_FRESH_TRANSFER_AVAILABLE`.
4. Terminal/test artifact tóm tắt isolation/lifecycle verification.
5. Deployment stack diagram (app, PostgreSQL, Cloudflare Tunnel) nếu report còn chỗ.

## 15. Top 10 messages the whole team must understand

1. ThinkAI không nói rằng AI help là cheating; help là điều kiện evidence cần ghi rõ.
2. Practice thành công có hỗ trợ không đồng nghĩa learner đã chứng minh năng lực độc lập.
3. Independent Transfer là phần quan trọng nhất để quan sát sự tự vận dụng trong demo.
4. Transfer không đưa chat, hint, Practice context, answer hay reveal trước submit.
5. AI không quyết điểm, pass, progression hoặc Capability Receipt; backend policy quyết định.
6. Rubric evaluator trả evidence facets, không phải final verdict; `UNCERTAIN` fail-closed.
7. Receipt là claim hẹp về một chuỗi Practice–Transfer có versioned evidence, không là chứng chỉ mastery.
8. Content được review/versioned để task, rubric và AI guidance có thể kiểm tra lại đúng phiên bản.
9. PostgreSQL giữ evidence/session/content bền vững; Progress/Audit được dựng từ facts đã lưu.
10. v1.1 là demo product hiện tại; deploy/provider qualification đang hoàn tất trong Slice 11, còn mở rộng curriculum/OCR/LMS là future, không được claim hiện tại.
