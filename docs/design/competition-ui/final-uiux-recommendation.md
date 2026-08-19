# Kết luận UI/UX cho Competition MVP

1. **Phong cách:** công cụ học Toán hiện đại, sáng và chính xác; điểm nhấn là đường nối giữa hai biểu diễn Toán, không phải gamification.
2. **Navigation:** `Trang chủ` · `Học` · `Tiến độ`; `Hồ sơ` ở avatar menu; audit mở từ receipt/history.
3. **Trang chủ:** một active skill, một CTA, bước kế tiếp, receipt gần đây và delayed event có nhãn khi có thật.
4. **Challenge workspace:** đề/visual và bài làm trong hai vùng rõ; gợi ý mở inline; AI là feedback layer, không là chat.
5. **Hint:** CTA `Xem gợi ý`, panel không chặn workspace, có câu xác nhận không giảm tiến độ.
6. **Transfer Quest:** gọi là **`Thử vận dụng`**; mô tả `Vận dụng ở dạng mới`.
7. **Khác biệt thị giác:** accent indigo, intro riêng, chips điều kiện, không hint/solution, biểu diễn Toán khác rõ ràng; không có timer.
8. **Connection Reveal:** hai mini-card side-by-side được nối vào card `Cùng dùng: [quan hệ X]`, highlight theo thứ tự.
9. **Capability Receipt:** gọi **`Xác nhận kỹ năng`**; headline `Bạn vừa làm được điều này`.
10. **Receipt:** card vừa phải, claim cụ thể, cột `Đã ghi nhận` và `Chưa kiểm tra`, link audit; không phải giấy chứng nhận hay điểm.
11. **Progress:** hybrid path + timeline, thể hiện loại bằng chứng đã ghi nhận/pending; không vẽ mastery ring.
12. **Skill map:** có path mini ở trang Học, chỉ một skill active và tối đa hai node `Dự kiến sau thử nghiệm`.
13. **Achievement:** không có hệ thống riêng; receipt là achievement có căn cứ.
14. **Locked content:** chỉ tối đa hai node kề bên, không hiện môn/feature lớn chưa chạy.
15. **Teacher view:** có audit compact, nhưng không có nav giáo viên/LMS.
16. **P0:** Home tối thiểu; Bài luyện; bridge; intro/workspace Thử vận dụng; reveal; receipt; Tiến độ/history tối thiểu; audit receipt compact; toàn bộ states cần cho flow.
17. **P1:** Học/path, timeline/history phong phú, audit mở rộng, shell/responsive polish.
18. **Không thiết kế:** chat, teacher LMS, dashboard mastery, game economy và roadmap giả.
19. **Components cần dựng:** foundations → button/nav/input/status → problem/hint/feedback → transfer/reveal/receipt → history/audit/states.
20. **Kiểm tra tiếng Việt:** terminology và copy đã chốt ở [vietnamese-product-language.md](vietnamese-product-language.md); vẫn cần test trực tiếp với học sinh, nên không nói là đã validated.
21. **Ba màn hình cần đầu tư cực mạnh:** Bài luyện, Thử vận dụng, Xác nhận kỹ năng (bao gồm Reveal như một state liền kề).
22. **Clickable Figma flow:** Home → Bài luyện → Gợi ý → Solve → Bridge → Thử vận dụng → Reveal → Receipt → Tiến độ → Audit.

## Rủi ro UX còn mở

* **HIGH — pair/visual validity:** nếu hai biểu diễn không cho thấy quan hệ chung trong vài giây, signature screen thất bại dù UI đẹp. Đây là rủi ro content, không thể sửa chỉ bằng Figma.
* **MEDIUM — wording “tự áp dụng”:** phải desirability-test xem học sinh có thấy không hint ở bước vận dụng là công bằng hay là “bị kiểm tra thêm”.
* **MEDIUM — receipt:** cần kiểm tra học sinh hiểu “chưa kiểm tra” là trung thực/chỉ dẫn bước sau, không phải phủ nhận thành quả vừa có.
* **MEDIUM — P1 shell:** không thêm nhiều locked nodes để làm app “trông lớn”; điều này sẽ giảm tin cậy trong demo.

## Định hướng cuối

**Giữ scope hẹp.** Một flow Toán có content hợp lệ, state đầy đủ và receipt thật sẽ khiến judge nhìn thấy một sản phẩm; thêm screens không hoạt động sẽ khiến ThinkAI giống prototype nghiên cứu.
