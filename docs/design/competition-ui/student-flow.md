# Student flow và trách nhiệm hệ thống

## Một journey duy nhất

| Bước | Học sinh thấy/làm | Hệ thống ghi nhận | AI làm | Phần mềm xác định làm | Consequence / phục hồi |
|---|---|---|---|---|---|
| 1. Vào học | Trang chủ có một CTA `Tiếp tục thử` | tài khoản demo, skill hiện tại | không bắt buộc | tải summary/event | nói rõ bước tiếp theo |
| 2. Làm thử | đề bài, nhập đáp án hoặc `Chưa biết bắt đầu` | attempt, item/version, thời điểm | có thể phản hồi ngắn về cách diễn đạt | xác thực input, mở session | không biết bắt đầu vẫn là attempt hợp lệ |
| 3. Xem gợi ý | mở một gợi ý đã duyệt, quay lại bài làm | intervention ID/version, thời điểm, attempt trước hint | chỉ chọn/diễn đạt theo nội dung đã duyệt nếu live | hiện đúng hint, ghi exposure | không có trừ điểm hay giảm trạng thái |
| 4. Giải bài | gửi đáp án/cách làm | response, result, scoring version | phản hồi giải thích giới hạn | chấm đáp án/rubric, chuyển trạng thái | đúng: mời vận dụng; chưa đúng: cho sửa hoặc xem lại |
| 5. Thử vận dụng | một bề mặt riêng, dạng biểu diễn khác, không có lời giải/hint | isolated session, transfer item, response/result | chỉ phản hồi cách làm sau khi chấm nếu cần | chọn pair đã duyệt, cách ly context, chấm | đúng: reveal + receipt; chưa đúng: action học tiếp |
| 6. Nhìn mối liên hệ | hai bài được đặt cạnh nhau, highlight cùng quan hệ | optional reveal event | viết giải thích ngắn nếu đã kiểm soát | map metadata/pair relation | biến “bài khác” thành insight |
| 7. Xác nhận kỹ năng | card nói điều vừa thể hiện và điều chưa biết | receipt/event, derived summary | không bắt buộc | chỉ tạo khi điều kiện event thỏa | node tiến độ đổi trạng thái; không tuyên bố vĩnh viễn |
| 8. Ôn lại sau | event cũ có timestamp hoặc lịch thật | delayed event | không bắt buộc | lịch/hiển thị evidence | không giả retention xảy ra trong demo |

## Signature interaction

`Bài luyện` và `Thử vận dụng` phải cho thấy cùng một quan hệ bằng **hai đại diện thị giác khác nhau**: ví dụ, đọc hệ số góc từ đồ thị rồi suy luận từ bảng/đoạn mô tả thay đổi. Khác số hoặc khó hơn không đủ.

Ba dấu hiệu phải tự nói được ý nghĩa trong vài giây:

1. Gợi ý đã xem có nội dung/nhãn cụ thể (`Gợi ý chiến lược`), không phải “AI 3/5”.
2. Dạng mới là một session tách biệt, không nhìn thấy lời giải và không có menu hint.
3. `Xác nhận kỹ năng` nêu chính xác điều đã thể hiện, điều kiện và điều còn chưa biết.

Nếu người xem không thấy ngay sự khác biệt biểu diễn, thay pair/micro-skill — đừng bù bằng lời thuyết minh dài.

## Luồng Figma lõi

```text
Trang chủ (seeded) → Bài luyện → Xem gợi ý → Gửi bài
→ Bạn đã giải được bài này → Thử vận dụng (intro)
→ Dạng mới → Reveal mối liên hệ → Xác nhận kỹ năng
→ Tiến độ / Chi tiết lần làm
```

`Ôn lại sau` là một branch lịch sử, không chen vào giữa demo sống.

