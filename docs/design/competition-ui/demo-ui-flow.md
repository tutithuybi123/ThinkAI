# Demo UI flow cho prototype Figma

## Storyboard, không phải feature tour

| Cảnh | Screen / CTA | Motion | Judge cần thấy | Data |
|---|---|---|---|---|
| 0. Lý do | card so sánh 2 bài làm đúng → `Xem một lần học` | highlight khác biệt ở `Gợi ý chiến lược đã xem` | đúng không nói hết điều kiện thành công | seeded comparison, ghi rõ demo |
| 1. Vào học | Trang chủ → `Tiếp tục thử` | rail/page transition nhẹ | một mục tiêu thật, không dashboard số liệu | seeded active skill |
| 2. Làm thử | Bài luyện → nhập một attempt → `Xem gợi ý` | hint panel inline | hint là nội dung cụ thể và không bị phạt | live attempt + reviewed hint |
| 3. Giải | `Gửi bài` → bridge | input status → bridge card | solved with help chưa thành “mastery” | live score/event |
| 4. Signature | `Thử vận dụng` → intro → `Bắt đầu` → gửi đáp án | accent chuyển sang indigo | cùng ý tưởng, dạng khác, session tách biệt | live transfer response; pre-authored pair |
| 5. Insight | reveal → `Xem xác nhận kỹ năng` | đường nối hai biểu diễn | vì sao hai bài cùng quan hệ | reviewed mapping |
| 6. Receipt | Xác nhận kỹ năng → `Xem tiến độ` | card raise, one path node updates | claim có điều kiện, điều còn chưa biết | live receipt/event |
| 7. Thời gian | Tiến độ / `Ôn lại sau` history | none | event cũ phải có timestamp `Lịch sử` | seeded historical event |
| 8. Audit | `Xem chi tiết lần làm` | drawer | pair, hint, scoring, reviewer/version có thể kiểm tra | live + pre-authored metadata |

## Những gì phải chạy LIVE

* Input attempt / `Chưa biết bắt đầu`.
* Mở một gợi ý đã duyệt, event exposure được tạo trong phiên.
* Chấm ít nhất một đường đáp án đúng trên bài luyện và transfer.
* Session transfer tách riêng và receipt sinh sau transfer pass.
* Tiến độ/history cập nhật từ receipt vừa sinh.

## Có thể SEEDED nhưng phải trung thực

* Screen Home trước khi bắt đầu, learner demo và một receipt cũ.
* Card so sánh hai người học ở mở đầu.
* Một `Ôn lại sau` với ngày/giờ lịch sử.
* Content bank, pair metadata, hints, rubrics và audit review status.

## Không xuất hiện trong 3 phút

* Bảng competitor, kiến trúc đầy đủ, teacher LMS, broad roadmap.
* Chat dài, lời giải model tự sinh không kiểm soát, test độ trễ giả.
* XP/level/leaderboard, percent mastery, chart phân tích dày đặc.
* Các môn/nhiều kỹ năng chưa hoạt động.

## 5-second test

| Màn hình | Học sinh/judge phải hiểu trong 5 giây | Nếu không hiểu, cắt gì trước |
|---|---|---|
| Home | `Tôi đang luyện gì và làm gì tiếp?` | bớt receipt/return phụ, giữ CTA duy nhất |
| Bài luyện | `Đề ở trái, tôi trả lời ở phải, có gợi ý nếu cần.` | bớt metadata, giữ label/input/CTA |
| Thử vận dụng | `Đây là dạng mới, tôi tự làm, không có lời giải.` | bỏ prose dài, giữ 3 chips + một câu lý do |
| Receipt | `Tôi vừa chứng minh được gì và còn chưa biết gì?` | bỏ badge/biểu đồ, giữ claim + 2 cột |

## Demo failure rule

Trong Figma, mô phỏng rõ hai trạng thái: **đường Demo bình thường dùng phản hồi AI thật, có nhãn**, và **đường AI không khả dụng chỉ là fallback/reliability test**. Khi Competition Demo scope đã freeze, live AI feedback không còn là enhancement; nó là P0 nhưng không được phép thay đổi chấm điểm, evidence hay receipt. Không trình bày text canned như câu trả lời AI live.
