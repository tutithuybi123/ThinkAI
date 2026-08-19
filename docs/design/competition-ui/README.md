# ThinkAI — UI/UX direction cho Competition MVP

> **Status: Active supporting visual grammar.** Typography, tokens, accessibility, Transfer/reveal grammar and non-gamification rules remain reusable. Product-flow restrictions in this package that conflict with the current bounded Practice Companion are historical v1.0 assumptions; use [../../CURRENT.md](../../CURRENT.md) and v1.1 source-of-truth for current behavior.

## Mục tiêu thiết kế

Thiết kế một ứng dụng học Toán cho học sinh THPT Việt Nam, không phải chatbot có thêm dashboard. Trong một phiên ngắn, học sinh phải cảm nhận rõ: **mình đã dùng một ý tưởng Toán ở một dạng mới và ThinkAI ghi nhận đúng điều đó.**

Competition MVP chỉ chạy thật với **một vi kỹ năng Toán lớp 10** đã được giáo viên xác nhận. Mọi màn hình, màu sắc và chuyển động phục vụ cho luồng đó; không tạo bề mặt giả vờ là nền tảng nhiều môn.

## Hướng UX đã chốt

**Bản sắc:** “bản đồ năng lực có căn cứ”. Mỗi lần học là một hành trình ngắn, có điểm rẽ rõ: bài luyện bình thường → **Thử vận dụng** → nhìn ra mối liên hệ → **Xác nhận kỹ năng**. Sự táo bạo duy nhất nằm ở khoảnh khắc hai bài trông khác nhau được nối lại bằng cùng một quan hệ Toán; các phần còn lại yên tĩnh, sáng sủa và chính xác.

**Không phải:** gia sư chat, bảng điểm mastery, game có tiền tệ, hay bài kiểm tra liên tục.

**Nguyên tắc:** đo điều kiện bên trong; nói với học sinh về bước tiến bên ngoài. Gợi ý là một công cụ học hợp lệ, không làm giảm điểm, cấp hay quyền truy cập.

## Bộ tài liệu

| Tài liệu | Dùng cho |
|---|---|
| [vietnamese-product-language.md](vietnamese-product-language.md) | Từ điển, giọng văn và microcopy đã chốt |
| [navigation-and-information-architecture.md](navigation-and-information-architecture.md) | Navigation, app shell và cấu trúc thông tin |
| [student-flow.md](student-flow.md) | Journey, trách nhiệm AI/phần mềm và demo flow |
| [screen-specs.md](screen-specs.md) | Đặc tả từng màn hình cho Figma |
| [p0-wireframes.md](p0-wireframes.md) | Wireframe ASCII cho toàn bộ màn hình P0 |
| [design-system-brief.md](design-system-brief.md) | Foundations, visual direction và motion |
| [component-library.md](component-library.md) | Components, variants và tương tác |
| [ui-state-matrix.md](ui-state-matrix.md) | Trạng thái, lỗi và responsive |
| [active-locked-hidden.md](active-locked-hidden.md) | Bề mặt ACTIVE / LOCKED / HIDDEN / REMOVE |
| [demo-ui-flow.md](demo-ui-flow.md) | Prototype Figma cho demo 3 phút |
| [figma-handoff.md](figma-handoff.md) | Thứ tự dựng và các điều không được tự đổi |

## Nguồn và giới hạn

Tài liệu này diễn giải, không thay thế, [Competition MVP plan](../../planning/competition-mvp/README.md) và [proposal v1.2](../../proposals/ThinkAI-Idea-Team-Review-v1.2.md). Không có tuyên bố rằng một pattern UI đã được kiểm chứng với học sinh. Các tên gọi và câu chữ là **đề xuất thiết kế cần test desirability**, không phải kết quả nghiên cứu người dùng.
