# Figma handoff — đọc trước khi thiết kế

> **Status: Active supporting Figma/design handoff with historical v1.0 flow restrictions.** Reuse visual grammar and accessibility guidance. The instruction below that forbids an AI chat panel beside Practice is superseded for v1.1 by the bounded Practice Companion; Transfer remains AI-free before submission.

## Thiết kế trước: P0

1. `Bài luyện`: default, typing, hint mở, submitting, đúng, cần sửa, AI unavailable.
2. `Cầu nối sau khi giải`.
3. `Thử vận dụng`: intro, workspace, pass/recovery.
4. `Reveal mối liên hệ`.
5. `Xác nhận kỹ năng`: delayed-pending và link audit.
6. `Trang chủ` tối thiểu: CTA tiếp tục học và summary thật.
7. `Tiến độ/lịch sử` tối thiểu: summary event-derived và lịch sử session/receipt ngắn.
8. `Chi tiết lần làm/audit` tối thiểu: provenance/version compact cho receipt.
9. Prototype clickable đi hết luồng P0 trong [demo-ui-flow.md](demo-ui-flow.md).

## Thiết kế sau: P1

* Trang chủ có receipt compact và lịch sử delayed có nhãn phong phú hơn.
* Học/path với một skill active, tối đa 2 node future.
* Tiến độ hybrid path + timeline dài/filtering.
* Chi tiết lần làm/audit mở rộng.
* Loading, empty, error và tablet layout.

## Optional: P2

* Avatar menu/Hồ sơ và modal reset demo, chỉ nếu các action tồn tại thật.
* Micro-motion, icon tinh chỉnh và layout dưới 768 px sau khi desktop flow được review.

## Không thiết kế

Chat screen, teacher LMS, lựa chọn môn, dashboard “mastery”, streak/XP/coins/shop, leaderboard, pet/mascot, diagnosis, Learning Twin, path cá nhân hóa và bất kỳ feature future nào không ACTIVE.

## Component dựng trước

1. Foundations: color, type, spacing, elevation, icon size.
2. Button, rail nav, status chip, input/textarea, feedback card.
3. Problem card, hint panel, stage marker.
4. Transfer intro, connection card, capability receipt, capability path node.
5. History/audit row, error/empty/loading, modal/toast.

Xem chi tiết variants ở [component-library.md](component-library.md) và token ở [design-system-brief.md](design-system-brief.md).

## Cấu trúc file Figma

```text
00 — Brief & product guardrails
01 — Flow & content mapping
02 — Foundations
03 — Components
04 — Wireframes desktop
05 — Final UI desktop
06 — States & responsive
07 — Competition demo prototype
08 — Audit / handoff notes
```

Mỗi page `Final UI` có annotation với event/data thật cần hiển thị. Dùng variables/tokens cho colors/spacing, variants cho state; không copy-paste 8 bản cùng card.

## Copy đã chốt

* CTA chính Home: `Tiếp tục thử`.
* Hint: `Xem gợi ý`.
* Signature: `Thử vận dụng`.
* Tên receipt: `Xác nhận kỹ năng`; headline `Bạn vừa làm được điều này`.
* Delayed follow-up: `Ôn lại sau`.
* Future lock: `Dự kiến sau thử nghiệm`.

## Những điều designer không được tự đổi

* Không biến ThinkAI thành chatbot hay đặt AI chat panel cạnh đề.
* Không dùng mastery percentage, grade, “AI confidence” hoặc claim học sinh đã biết vĩnh viễn.
* Không làm gợi ý thành hành vi bị phạt hoặc che giấu; không có badge vì không dùng hint.
* Không bỏ bước `Thử vận dụng`, session isolation hoặc `Reveal mối liên hệ` để rút gọn thành câu hỏi thứ hai.
* Không đổi receipt thành chứng chỉ giả, điểm số hoặc sưu tập trang trí.
* Không tạo locked content giả vờ có thể dùng; các nút visible phải hoạt động hoặc disabled kèm lý do.
* Không thêm game economy để app “trông vui”.

## Handoff check trước khi đưa developer

- [ ] 5-second test pass ở Home, Bài luyện, Thử vận dụng, Receipt.
- [ ] Tất cả state P0 có frame riêng, gồm loading/error/recovery.
- [ ] Copy không còn thuật ngữ nội bộ tiếng Anh, câu nghiên cứu hoặc wording phán xét.
- [ ] Pair visual cho reveal được content reviewer xác nhận là cùng `[quan hệ X]`.
- [ ] Receipt show claim + conditions + unknown; không %.
- [ ] Flow prototype cập nhật progress bằng receipt đã sinh, không dùng screenshot giả.
- [ ] Có annotation phân biệt live, pre-authored, historical và seeded.
