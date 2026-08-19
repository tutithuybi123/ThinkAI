# Component library cho Figma

Tạo components trước screen. Variant tên theo hành vi, không theo vị trí (`Button/Primary`, không phải `Home button`).

| Component | Variants / states cần dựng | Nội dung và interaction |
|---|---|---|
| Button | primary, secondary, ghost, destructive; default/hover/focus/disabled/loading | verb ngắn; loading giữ width; CTA primary chỉ một mỗi vùng |
| Icon button | neutral, danger; tooltip/focus | thoát, đóng panel, menu |
| Rail nav item | default, active, hover, disabled | icon + nhãn; active có vạch Ink, không chỉ đổi màu |
| Stage marker | luyện / vận dụng / ôn lại; current/complete/pending | biểu diễn bối cảnh, không phải % tiến độ |
| Skill card | active, current, future-locked, completed-summary | tên skill, bằng chứng gần nhất, CTA hợp lệ |
| Problem card | normal, transfer, loading | đề, visual/đồ thị, thông tin item; không đưa solution vào transfer |
| Answer input | empty, typing, invalid, submitted, score-correct, score-review | label, helper, status bằng text + icon |
| Reasoning input | optional, typing, submitted, AI-unavailable | khuyến khích mô tả ngắn; không yêu cầu chain-of-thought |
| Hint button | available, opened, unavailable | `Xem gợi ý`; never disabled as “penalty” |
| Hint panel | process/concept/strategy/step; opened | intervention title/version visible in audit only; student sees natural copy |
| Feedback card | neutral, correct, needs-retry, service-unavailable | one next action; no chat transcript |
| Transfer intro | default, ready, return-to-review | 3 condition chips + CTA |
| Connection card | pass/recovery | pair miniatures + shared relation + explanation |
| Capability receipt | confirmed, historical, delayed-pending, later-conflict | claim, conditions, unknown, actions; no percent |
| Capability path node | recorded, pending, scheduled, conflicting | discrete evidence indicator; hover explains evidence, not rank |
| History item | attempt, hint, solve, transfer, receipt, return | learner-language summary + time; details link |
| Audit detail row | immutable data / review status | only detail surface; timestamps/version IDs can wrap |
| Locked card | future | `Dự kiến sau thử nghiệm`, non-clickable |
| Modal / toast / tooltip | success, confirm reset, info, error | never carry critical information only in toast |
| Skeleton / empty / error | per screen | exact recovery CTA, not generic “Something went wrong” |
| Avatar menu | default/open | Hồ sơ, quyền riêng tư, đặt lại demo only if real |

## Component rules

1. `Capability receipt` is one component reused in receipt, Home and Tiến độ, with different density. Its claim must derive from data; designer must not invent a celebratory score variant.
2. `Hint panel` opens inline/right-side on desktop, not as a blocking modal. The student can read the prompt and continue working without closing it.
3. `Connection card` always uses pair metadata supplied by content; no editable “same idea” marketing text.
4. Every component includes keyboard focus and disabled/loading state in Figma. A visible control must be actionable or explicitly disabled with a reason.

