# Navigation và kiến trúc thông tin

## Quyết định

Ưu tiên desktop-first cho buổi demo: **rail trái hẹp nhưng có nhãn + header tối giản**. Rail giúp ba khu vực có chỗ đứng rõ ràng mà không làm luồng học giống website marketing. Không dùng breadcrumb: với một vi kỹ năng, breadcrumb chỉ thêm nhiễu.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ThinkAI                         Toán 10 · Bản demo       [Tú ▾]          │
├───────────────┬──────────────────────────────────────────────────────────┤
│ ● Trang chủ   │  [Tiêu đề trang]                         [trạng thái]    │
│   Học         │                                                          │
│   Tiến độ     │  Nội dung theo ngữ cảnh                                  │
│               │                                                          │
│               │                                                          │
│ Trợ giúp      │                                                          │
└───────────────┴──────────────────────────────────────────────────────────┘
```

**Kích thước tham chiếu:** desktop 1440 px; nội dung tối đa 1.200 px; rail khoảng 224–240 px. Header không phải nơi nhồi thông báo/gamification. `Toán 10 · Bản demo` làm rõ phạm vi, không phải badge marketing.

## Cấu trúc

| Khu vực | Mục đích | Nội dung | Trạng thái |
|---|---|---|---|
| Trang chủ | quyết định hành động kế tiếp | P0 tối thiểu: skill hiện tại, CTA duy nhất, một xác nhận gần đây; delayed display chỉ khi có thật | ACTIVE · P0 |
| Học | bối cảnh của vi kỹ năng | path ngắn, bài đang làm, tối đa 2 kỹ năng tương lai được ghi rõ | ACTIVE · P1 |
| Tiến độ | hiểu các lần đã làm mà không thấy audit log thô | P0 tối thiểu: tóm tắt evidence + history session/receipt ngắn; timeline dài là P1 | ACTIVE · P0 |
| `Xem chi tiết` | provenance cho judge/giáo viên | P0 tối thiểu: điều kiện, version, review của một receipt; audit mở rộng là P1 | ACTIVE nhưng không ở nav · P0 |
| Avatar → Hồ sơ | danh tính demo, quyền riêng tư, `Đặt lại bản demo` | chỉ thực hiện nếu chức năng reset thật | P2 |

## App shell states

* **Học đang diễn ra:** rail vẫn hiện nhưng không cạnh tranh với workspace; header chỉ có tên kỹ năng và `Lưu và thoát` khi lưu thật.
* **Thử vận dụng:** đổi accent của header sang màu Transfer, hiển thị nhãn `Dạng mới` thay vì số bài.
* **Loading:** giữ cấu trúc màn hình bằng skeleton; không nhảy layout.
* **Error:** giữ người học trong ngữ cảnh và đưa một CTA phục hồi. Không chuyển về Home lặng lẽ.

## Khóa / ẩn

Trong trang Học, tối đa hai node tương lai có thể xuất hiện sau path đang học với nhãn **`Dự kiến sau thử nghiệm`**. Chúng không có CTA vào học, không dùng biểu tượng trả phí, và phải mờ vừa đủ để không hứa content chưa có. Các môn khác, teacher LMS, chat và game economy bị ẩn hoàn toàn.
