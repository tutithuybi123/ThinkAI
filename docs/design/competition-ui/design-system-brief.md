# Design system brief

## Ý tưởng thị giác

ThinkAI là **một dụng cụ học Toán rõ ràng**, không phải lớp học dễ thương hoặc dashboard doanh nghiệp. Nền sáng, thông tin có nhịp thở; màu mực xanh đậm giữ sự tập trung. Khoảnh khắc `Thử vận dụng` dùng một dải màu chàm–tím rất tiết chế để báo rằng người học đang đổi cách nhìn, không đổi sang “chế độ game”.

Tín hiệu riêng: một **đường nối hình học** xuất hiện trong reveal/receipt, nối hai đại diện khác nhau vào “ý tưởng chung”. Nó chỉ xuất hiện ở signature moment, không làm ornament toàn app.

## Tokens đề xuất cho Figma

Các mã là điểm bắt đầu, phải kiểm tra WCAG contrast trước khi chốt implementation.

| Role | Token / hex đề xuất | Dùng cho |
|---|---|---|
| Ink / primary | `Ink 900` `#17324D` | logo, heading, active rail |
| Action blue | `Blue 600` `#2767A7` | CTA, link, focus |
| Transfer | `Indigo 600` `#6558C9` | intro, đường nối, node vận dụng |
| Canvas | `Mist 50` `#F6F8FB` | nền app |
| Surface | `White` `#FFFFFF` | card/workspace |
| Text | `Slate 900` `#1F2933` | body |
| Muted | `Slate 600` `#627180` | metadata |
| Success evidence | `Teal 700` `#147B75` | xác nhận có điều kiện |
| Warning / pending | `Ochre 700` `#9A6500` | chưa kiểm tra/đang chờ |
| Error | `Red 700` `#B54747` | lỗi gửi/chấm, không dùng cho học sinh sai bài |
| Locked | `Slate 350` `#B8C2CD` | nội dung tương lai |

Không dùng gradient toàn màn hình, neon, confetti hoặc nhiều success-green. Màu không là nguồn thông tin duy nhất: luôn đi kèm icon, nhãn và text.

## Typography

* **UI/body:** `Be Vietnam Pro` (400, 500, 600, 700); lựa chọn vì đọc dấu tiếng Việt tốt, tính cách gọn và không trẻ con.
* **Math:** renderer công thức có glyph toán tin cậy; fallback `Noto Sans Math`, không ép display font lên biểu thức.
* **Data/meta:** cùng family, weight 500, tracking vừa phải; không dùng font mono làm phong cách mặc định.

| Level | Kích thước / line-height gợi ý | Dùng cho |
|---|---|---|
| Display | 32 / 40, 700 | headline receipt/home |
| H1 | 28 / 36, 700 | page title |
| H2 | 20 / 28, 650–700 | card title |
| Body | 16 / 24, 400 | đề, feedback |
| Body compact | 14 / 20, 400–500 | metadata |
| Label | 12 / 16, 600 | stage/chip, sentence case |

## Layout, shape và icon

* Grid desktop: 12 cột, gutter 24; content max 1.200; padding trang 40 ngang / 32 dọc.
* Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
* Radius: 12 cho card/input; 999 cho chip; 16 chỉ cho receipt/intro lớn. Không bo tròn mọi container.
* Border: `Slate 200` hairline; shadow 1 mềm chỉ dùng cho layer nổi/receipt, không xếp nhiều shadow.
* Icon: nét 1.75–2 px, hình học đơn giản; icon bổ trợ text chứ không thay text.

## Motion

Motion có nhiệm vụ xác nhận thay đổi trạng thái, không giải trí.

| Moment | Chuyển động | Giới hạn |
|---|---|---|
| mở gợi ý | panel mở 160–200 ms, focus trả về textarea | không che đề |
| vào Thử vận dụng | đường nối accent đi qua header 240 ms | không kéo dài loading |
| connection reveal | highlight lần lượt bài cũ → bài mới → quan hệ chung | có nút bỏ qua; reduced-motion thành fade |
| receipt | card nâng nhẹ + node path chuyển trạng thái | không confetti, không âm thanh bắt buộc |
| feedback | viền/input chuyển trạng thái 120–160 ms | không rung hay đỏ khi sai |

## Tự kiểm tra chống-template

Không dùng “hero gradient + số lớn + card thống kê” như trang SaaS. Signature của ThinkAI là mối nối giữa **hai biểu diễn Toán**, nên visual system dành độ nổi bật cho cặp bài và đường quan hệ thay vì cho biểu đồ tiến độ giả.

