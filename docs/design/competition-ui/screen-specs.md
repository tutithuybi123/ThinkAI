# Screen specifications

Mọi ví dụ dùng placeholder `[quan hệ X]`; nhóm chỉ thay bằng micro-skill đã được giáo viên duyệt. Không dùng câu mô tả này để ngầm chốt nội dung Toán.

## 1. Trang chủ — P0 tối thiểu

**Mục đích:** cho học sinh thấy đúng một hành động có ý nghĩa tiếp theo.

**Đến từ:** mở app, hoàn thành receipt, hoặc navigation. **Hành động chính:** `Tiếp tục thử`.

**Bố cục:** greeting nhỏ → card hero active skill (60% chiều rộng) → right rail “Bước tiếp theo” → hàng dưới gồm Xác nhận gần đây và Ôn lại sau nếu event thật. Không có lưới 6 thống kê.

| Vùng | Nội dung / component |
|---|---|
| Header | `Chào Tú` và `Tiếp tục từ ý tưởng bạn đang luyện.` |
| Active skill | skill name, sentence summary, 2–3 evidence chips, primary CTA |
| Next action | một card nêu duy nhất `Bài luyện` / `Thử vận dụng` / `Ôn lại sau` theo event thật |
| Recent receipt | receipt compact, `Xem tiến độ` |
| Historical return | chỉ nếu có; `Lịch sử · 07 ngày trước` hiển thị ngay cạnh timestamp |

**States:** loading skeleton; first-use empty; active; receipt vừa phát hành; lỗi tải. Không hiển thị future locks ở Home.

**Data:** learner display name, active skill, derived summary, last receipt, scheduled/historical return. **AI:** none required. **Motion:** receipt mới xuất hiện bằng fade/raise nhẹ một lần.

## 2. Học — P1

**Mục đích:** đặt vi kỹ năng đang hoạt động vào một path nhỏ, trung thực.

**Đến từ:** rail `Học`. **Hành động chính:** `Bắt đầu` hoặc `Tiếp tục` item active.

**Bố cục:** title `Toán 10`; subhead “Một kỹ năng đang được thử nghiệm”; path dọc 3 node: active micro-skill, tối đa 2 future nodes. Một panel “Bạn đang luyện gì?” giải thích bằng ngôn ngữ học sinh, không phải research.

**Microcopy:** `Đọc và vận dụng [quan hệ X]`; status `Đang học`; future `Dự kiến sau thử nghiệm`.

**States:** active; chưa có session; has receipt; future locked; loading. **Data:** available skills and availability reason. **AI:** none. **Motion:** node active chuyển trạng thái sau receipt.

## 3. Bài luyện — P0

**Mục đích:** một không gian tập trung để thử, nhận gợi ý hợp lệ và gửi bài — không phải chat screen.

**Đến từ:** Home/Học. **Hành động chính:** `Gửi bài`.

**Bố cục desktop:** header stage; cột trái 5/12 là đề + đồ thị/visual; cột phải 7/12 là bài làm. Hint panel nằm dưới đề hoặc dock vào mép phải cột đề để không phủ editor.

| Vùng | Chi tiết |
|---|---|
| Stage header | `Bài luyện` · skill name · `Lưu và thoát` nếu lưu thật. Không hiển thị `1/10` nếu không có 10 bài. |
| Problem | đề, visual, dữ kiện; text rõ; label `Bài mới` chỉ khi đúng. |
| Workspace | `Đáp án của bạn`, input; `Cách làm (không bắt buộc)`; action row. |
| Hint | ghost button `Xem gợi ý`; mở panel title `Gợi ý để bắt đầu`, body, reassure copy. |
| Feedback | card `Nhận xét của ThinkAI` chỉ sau phản hồi; phân biệt nhãn AI và kết quả chấm xác định. |

**Interaction:** `Chưa biết bắt đầu` ghi attempt rồi mở gợi ý đầu, không coi là failure. Submit lock double-click but preserves input. Đúng → bridge. Chưa đúng → correction feedback + `Thử lại`; không tự lộ đáp án.

**Data:** item/version, attempts, opened intervention, response, scoring, optional reasoning. **AI:** bounded phrasing/explanation only; needs label and fallback. **Deterministic:** answer scoring, exposure log, session state. **Motion:** panel open 180 ms; no celebratory burst for assisted solve.

## 4. Cầu nối sau khi giải — P0

**Mục đích:** không để assisted correctness bị hiểu nhầm là “hoàn thành kỹ năng”; mời người học chuyển sang moment signature.

**Đến từ:** submit đúng ở Bài luyện. **Hành động chính:** `Thử vận dụng`.

**Bố cục:** inline full-width state trên workspace, vẫn giữ đề mờ phía sau. Headline `Bạn đã giải được bài này.` Body: `Bạn đã xem gợi ý về [ý tưởng/chiến lược]` nếu có; không đánh giá việc này. Card tiếp theo có icon đường nối: `Thử dùng cùng ý tưởng ở một dạng mới.`

**States:** solved with no help / with hint / scorer pending / recovery. **Data:** solve result and exposures. **AI:** none. **Motion:** card bridge trượt lên nhẹ, focus CTA.

## 5. Thử vận dụng — intro và workspace — P0

**Mục đích:** làm rõ đây là bước đặc biệt, độc lập và đổi biểu diễn; không phải Question 2.

**Đến từ:** bridge. **Hành động chính:** intro `Bắt đầu`, workspace `Gửi bài`.

**Intro:** khối chàm nhạt, title `Thử vận dụng`; text `Bài tiếp theo trông khác, nhưng có thể dùng cùng một cách nghĩ.` Ba chips: `Bài mới`, `Cùng ý tưởng`, `Không xem đáp án`. Dòng lý do: `Ở bước này ThinkAI chưa hiện gợi ý để ghi nhận cách bạn tự áp dụng. Bạn luôn có thể quay lại ôn.`

**Workspace:** giữ cấu trúc bài luyện để không tăng tải nhận thức, nhưng header accent `Dạng mới`, viền indigo và không có hint slot. Đề phải dùng visual/context khác rõ ràng. Không hiển thị solution hay nội dung bài trước.

**Failure/recovery:** `Ở dạng mới, bạn cần thêm một lần luyện.` → `Thử lại` hoặc `Quay lại ôn`. Không dùng đỏ/biểu tượng X lớn, không mất receipt cũ. **Không mở `Xem mối liên hệ` sau failure:** relation mapping/reveal chỉ được server mở sau transfer đúng đã xác minh.

**Data:** transfer pair ID/version, isolated session, condition flags, response, scoring. **AI:** only optional post-score explanation. **Deterministic:** isolation, pair selection, scoring. **Motion:** accent line follows header once; no countdown/timer.

## 6. Reveal mối liên hệ — P0

**Mục đích:** trả lời tại sao hai bài cùng thuộc một capability; đây là payoff học tập, không phải analytics.

**Đến từ:** chỉ chấm transfer đúng đã xác minh. **Hành động chính:** `Xem xác nhận kỹ năng`. Recovery giữ ở Thử vận dụng với `Thử lại` hoặc `Quay lại ôn`; không có reveal mapping.

**Bố cục:** hai mini-card `Bài vừa làm` / `Dạng mới` đối diện; phía giữa/dưới có đường nối hình học. Highlight lần lượt dữ kiện tương ứng, hội tụ vào card `Cùng dùng: [quan hệ X]`. Một giải thích tối đa 2 câu, có diagram nếu pair cần.

**States:** pass reveal; reduced motion. **Data:** declared pair relation, mapping, explanation. **AI:** no requirement; AI paraphrase only if versioned/approved. **Motion:** sequential highlight 300–500 ms total, skip allowed.

## 7. Xác nhận kỹ năng — P0

**Mục đích:** artifact cụ thể và trung thực về điều vừa được thể hiện.

**Đến từ:** reveal pass. **Hành động chính:** `Tiếp tục` hoặc `Xem tiến độ`.

**Bố cục:** receipt card là vùng trung tâm 640–720 px, không full-screen certificate. Header eyebrow `XÁC NHẬN KỸ NĂNG`; headline `Bạn vừa làm được điều này`; claim `[Dùng quan hệ X trong một biểu diễn mới.]`; phía dưới hai cột `Đã ghi nhận` / `Chưa kiểm tra`.

**Copy bắt buộc:**

* `Đã ghi nhận: Bài mới · Không xem đáp án · [ngày/giờ].`
* `Chưa kiểm tra: Bạn chưa quay lại ôn sau một khoảng thời gian.` hoặc kết quả delayed thật.
* link nhẹ `Xem chi tiết lần làm`.

**States:** confirmed; delayed pending; historical; later conflict. Khi later conflict, giữ receipt cũ trong history và summary nói `Kết quả ở dạng mới chưa ổn định ở lần gần nhất.`

**Data:** rule-derived receipt, evidence summary, conditions, timestamp. **AI:** none. **Motion:** receipt lift + progress node change; no score, no confetti.

## 8. Tiến độ / lịch sử — P0 tối thiểu

**Mục đích:** biến event log thành câu chuyện học sinh đọc được; không trình bày state machine hay mastery score.

**Đến từ:** rail/receipt. **Hành động chính:** xem chi tiết một lần học, hoặc quay lại challenge khi có action thật.

**Chọn concept chính: hybrid path + timeline.** Phía trên là `Hành trình của [kỹ năng]` với ba cột evidence: `Đã giải bài luyện`, `Đã vận dụng ở dạng mới`, `Ôn lại sau`; mỗi cột là recorded/pending/scheduled, không phải bậc thang tuyệt đối. Phía dưới là timeline `Lịch sử học` nói bằng learner language.

**Concept thay thế không chọn:** vòng mastery quanh skill. Nó gợi ý tỷ lệ chính xác giả và làm failure trông như tụt level.

**P0 tối thiểu:** summary event-derived sau receipt và history ngắn của session/receipt. Timeline dài, filtering và polish là P1. **States:** first use; has events; delayed pending; mixed/conflicting evidence; loading/error. **Data:** derived summary + append-only events. **AI:** none. **Motion:** node update only when evidence event exists.

## 9. Chi tiết lần làm / audit — P0 tối thiểu

**Mục đích:** cho judge/giáo viên kiểm tra provenance mà không dựng LMS.

**Đến từ:** `Xem chi tiết lần làm` ở receipt/history, không qua navigation. **Hành động chính:** `Quay lại tiến độ`.

**Bố cục:** drawer/page hẹp gồm summary học sinh trước, sau đó nhóm `Bài`, `Gợi ý đã xem`, `Kiểm chứng`, `Thời điểm`. Có item version, intervention version, pair-review status, scoring version, timestamps, result/condition. Đánh dấu `Dữ liệu demo` cho synthetic/historical.

**P0 tối thiểu:** một receipt audit có item/intervention/pair/scorer versions và provenance để judge kiểm tra. Navigation teacher, filtering và audit history mở rộng là P1/Full. **States:** complete; audit unavailable; item metadata missing (must block receipt in production). **Data:** raw append-only event records. **AI:** none. **Motion:** side drawer 200 ms.

## 10. Hồ sơ và cài đặt — P2

Chỉ thiết kế khi các action là thật. Avatar menu có tên demo, lớp/mục tiêu nếu synthetic, link `Quyền riêng tư`, và `Đặt lại bản demo` với confirm modal. Không tạo notification settings, social links, plan/billing hay profile completion giả.
