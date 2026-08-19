# Ngôn ngữ sản phẩm tiếng Việt

## Giọng nói

Ngắn, bình tĩnh, hướng hành động. ThinkAI nói về **bài làm và bước tiếp theo**, không phán xét con người. Câu khen chỉ xác nhận một sự kiện đã xảy ra; không nói “thông minh”, “xuất sắc”, “hoàn toàn thành thạo”.

| Dùng | Tránh | Lý do |
|---|---|---|
| `Thử vận dụng` | `Kiểm tra năng lực vận dụng độc lập` | học sinh hiểu ngay hành động |
| `Xem gợi ý` | `Yêu cầu trợ giúp` | không tạo cảm giác phải xin phép |
| `Bạn đã giải được bài này` | `Bạn đã hoàn thành kỹ năng` | một bài giải đúng chưa là toàn kỹ năng |
| `Cùng một ý tưởng` | `Chuyển giao kiến thức` | không dùng thuật ngữ nghiên cứu trên UI |
| `Ôn lại sau` | `Memory Return` | tự nhiên, không trộn tiếng Anh |
| `Chưa có kết quả ở dạng mới` | `Bạn chưa hiểu` | trung tính và đúng giới hạn bằng chứng |

## Từ điển đã chốt

| Khái niệm nội bộ | Phương án đã cân nhắc | Cách dùng trên UI | Quy tắc |
|---|---|---|---|
| Transfer Quest | `Thử vận dụng`; `Vận dụng ở dạng mới`; `Thử thách tình huống mới`; `Dùng ở tình huống mới` | **Thử vận dụng** (CTA/tên bước); `Vận dụng ở dạng mới` (mô tả) | Không dùng “chuyển giao”. Đây là một bước đặc biệt, không phải “Bài 2”. |
| Capability Receipt | `Xác nhận kỹ năng`; `Bằng chứng năng lực`; `Kỹ năng vừa xác nhận`; `Điều bạn vừa làm được` | **Xác nhận kỹ năng** (tên card); `Bạn vừa làm được điều này` (headline) | “Capability Receipt” chỉ dùng ở tài liệu/audit kỹ thuật. Không nói “biên nhận”. |
| Memory Return | `Ôn lại sau`; `Quay lại ôn`; `Củng cố lại`; `Thử lại sau một thời gian` | **Ôn lại sau** | Chỉ hiển thị khi có lịch hoặc event thật; event demo phải ghi `Lịch sử`. |
| Assistance / Hint | `Gợi ý`; `Gợi mở`; `Hỗ trợ`; `Trợ giúp` | **Xem gợi ý** (nút); `Gợi mở` (dòng giới thiệu); `Hỗ trợ` (trạng thái dịch vụ) | Không dùng “mức hỗ trợ”, “nợ trợ giúp” hoặc ngôn ngữ trừ điểm. |
| Evidence event | `lịch sử học`; `lần làm`; `chi tiết xác nhận` | **Lịch sử học** / `Chi tiết lần làm` | Không hiển thị “ledger”, “event schema” cho học sinh. |

## Navigation

| Nhãn | Icon gợi ý | Ý nghĩa |
|---|---|---|
| **Trang chủ** | nhà nét đơn | biết việc nên làm tiếp |
| **Học** | sách mở hoặc hình học | xem và vào kỹ năng đang học |
| **Tiến độ** | đường đi có nút | xem điều đã ghi nhận và lịch sử |
| **Hồ sơ** | avatar, trong menu | thông tin demo, quyền riêng tư, đặt lại demo |

Không có mục `Lịch sử` riêng: lịch sử là một phần của Tiến độ. Không đưa `Giáo viên`, `Chat`, `Thành tựu` vào navigation chính.

## Microcopy mẫu bắt buộc

| Tình huống | Copy chính | CTA |
|---|---|---|
| Mở app | `Hôm nay, tiếp tục từ ý tưởng bạn đang luyện.` | `Tiếp tục thử` |
| Chưa biết bắt đầu | `Chưa biết bắt đầu cũng là một điểm xuất phát.` | `Xem gợi ý` |
| Đã mở hint | `Gợi ý này giúp bạn tiếp tục. Tiến độ của bạn không bị giảm.` | `Quay lại bài làm` |
| Giải đúng sau hint | `Bạn đã giải được bài này.` | `Thử vận dụng` |
| Giới thiệu vận dụng | `Bài tiếp theo trông khác, nhưng có thể dùng cùng một cách nghĩ.` | `Bắt đầu` |
| Không có hint ở vận dụng | `Ở bước này, ThinkAI chưa hiện gợi ý để ghi nhận cách bạn tự áp dụng. Bạn luôn có thể quay lại ôn.` | `Làm bài` |
| Vận dụng chưa đúng | `Ở dạng mới, bạn cần thêm một lần luyện.` | `Xem mối liên hệ` |
| Xác nhận | `Bạn vừa làm được điều này` | `Xem tiến độ` |
| Chưa biết về độ bền | `Chưa kiểm tra lại sau một khoảng thời gian.` | `Ôn lại sau` (chỉ khi có lịch thật) |

## Quy tắc copy

1. Nút dùng động từ: `Gửi bài`, `Xem gợi ý`, `Thử vận dụng`, không dùng `Submit`, `Continue`.
2. “Kỹ năng” là khả năng Toán đang luyện; “ý tưởng” là quan hệ/chiến lược cụ thể nối hai bài.
3. “Năng lực” chỉ xuất hiện trong `Xác nhận kỹ năng`/audit khi cần nói về điều đã thể hiện; không lạm dụng để làm văn phong nặng.
4. Không hiển thị phần trăm thành thạo, nhãn trí thông minh, hoặc kết luận vĩnh viễn.
5. Khi lỗi, nói điều bị gián đoạn và một hành động phục hồi: `Chưa gửi được bài làm. Thử lại.`

