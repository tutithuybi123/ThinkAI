# State matrix và responsive

## Màn hình lõi

| Surface | States bắt buộc | UX xử lý |
|---|---|---|
| Trang chủ | loading; có skill; chưa có receipt; có lịch sử; lỗi tải | skeleton giữ hierarchy; empty dẫn `Bắt đầu bài luyện`; error `Tải lại` |
| Bài luyện | trống; đang nhập; `chưa biết bắt đầu`; hint mở; đang gửi; đúng; cần sửa; AI unavailable; network error; quay lại session | không reset bài làm khi lỗi; hint vẫn mở; scoring deterministic vẫn chạy nếu AI feedback lỗi |
| Thử vận dụng | intro; đang làm; gửi; xác nhận; cần luyện thêm; reveal (chỉ sau xác nhận); lỗi mạng | không có hint control; recovery có `Thử lại` và `Quay lại ôn`; relation reveal giữ khóa cho đến transfer đúng đã xác minh |
| Xác nhận kỹ năng | transfer confirmed; delayed pending; historical; later conflicting evidence | receipt không biến mất khi có evidence mâu thuẫn; tóm tắt đổi thành time-qualified |
| Tiến độ | loading; có event; chưa có event; lịch sử dài; audit unavailable | timeline học sinh gọn; audit lỗi không phá receipt |

## Failure wording

| Sự kiện | Không dùng | Dùng |
|---|---|---|
| sai bài luyện | `Sai rồi` | `Kết quả chưa khớp. Xem lại cách thay số rồi thử lại.` |
| chưa pass dạng mới | `Thất bại` | `Ở dạng mới, bạn cần thêm một lần luyện.` |
| AI lỗi | `AI failed` | `Phản hồi AI đang gián đoạn. Bạn vẫn có thể dùng gợi ý đã duyệt và tiếp tục bài.` |
| mạng lỗi | `Error 500` | `Chưa gửi được bài làm. Kiểm tra kết nối rồi thử lại.` |
| không có dữ liệu | `No data` | `Chưa có lần học nào ở kỹ năng này.` |

## Responsive

| Breakpoint | Quy tắc |
|---|---|
| **Desktop 1440 reference** | rail có nhãn, workspace 2 cột khoảng 5/7; đây là prototype demo chính |
| **Desktop tối thiểu 1024** | rail thu về 72 px + tooltip; problem/workspace vẫn cạnh nhau nếu mỗi cột đủ đọc; CTA không bị che |
| **Tablet 768–1023** | rail thành top/side drawer; workspace xếp dọc: đề → bài làm; Transfer vẫn giữ intro riêng |
| **Dưới 768** | không coi là bề mặt demo ưu tiên. Nếu được mở, đảm bảo xem/tương tác cơ bản theo một cột; không hứa trải nghiệm full polished trước khi test |

## Accessibility baseline cho Figma

* Text/body phải đạt contrast tối thiểu phù hợp; không dùng màu một mình để chỉ đúng/sai/trạng thái.
* Focus rõ cho mọi control; thứ tự tab đúng theo luồng bài.
* Motion có reduced-motion alternative; connection reveal vẫn đọc được khi không animation.
* Các biểu đồ/đồ thị Toán có text alternative/label trong spec nội dung.
* Error được đặt gần input và giữ nội dung người học đã nhập.
