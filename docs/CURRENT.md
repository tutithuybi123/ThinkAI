# ThinkAI — Current Project State

**Status:** Current repository entrypoint

**Purpose:** Đây là tài liệu đầu tiên dành cho mọi phiên làm việc mới. Nó nêu authority hiện hành, trạng thái thực tế và work checkpoint kế tiếp; không thay thế source-of-truth chi tiết.

## Current product

ThinkAI là sản phẩm học tập có nhận biết bằng chứng: learner có thể luyện tập với AI bị giới hạn, nhưng làm đúng khi có trợ giúp không được coi là năng lực vận dụng độc lập. ThinkAI ghi điều kiện hỗ trợ trong Practice, sau đó dùng Independent Transfer trước khi tạo evidence hoặc Capability Receipt.

Nội dung do giáo viên/reviewer duyệt và versioned xác định task, rubric, AI guidance và quan hệ Practice–Transfer. AI hỗ trợ việc học và tạo grading evidence bị ràng buộc; backend policy vẫn là authority.

Đọc bản giải thích tiếng Việt cho người mới: [Competition Demo v1.1 — Báo cáo mô tả sản phẩm](product-scope/competition-demo/competition-demo-v1.1-vietnamese-product-report.md).

## Current Competition Demo version

| Phân loại | Phiên bản / tài liệu |
|---|---|
| **Current** | `competition-demo-v1.1` |
| **Frozen historical record** | `competition-demo-v1.0` trong `product-scope/competition-demo/demo-scope-lock.md` |

Khi v1.1 xung đột rõ ràng với v1.0, v1.1 điều chỉnh Competition Demo hiện hành. Không rewrite v1.0.

## Current source-of-truth

Đọc theo thứ tự sau:

1. [Competition Demo v1.1 amendment](product-scope/competition-demo/competition-demo-v1.1-amendment.md)
2. [v1.1 architecture contracts](architecture/competition-mvp/v1.1-amendment-contracts.md)
3. [ADR-011: evidence-aware assistance and hybrid grading](decisions/011-evidence-aware-hybrid-grading.md)
4. [Final v1.1 implementation plan](superpowers/plans/2026-08-19-competition-demo-v1.1-final-implementation.md) — execution plan, không phải product authority.

ADR-011 chỉ amend ADR-006 và ADR-007 trong các phạm vi đã ghi. Các ADR trước đó vẫn là authority cho các quyết định được giữ nguyên. Các tài liệu architecture, persistence, security, design, runtime review và competition evidence được link bên dưới là **active supporting reference** khi thực hiện slice liên quan.

## Current implementation status

| Hạng mục | Trạng thái thực tế |
|---|---|
| Source-of-truth v1.1 | Hoàn tất reconciliation; được mô tả là externally reviewed trong ngữ cảnh dự án. |
| Final plan v1.1 | **EXTERNALLY REVIEWED / PASS.** Đây là active implementation plan đã được phê duyệt để thực hiện theo slice. |
| Implementation theo final plan | **Chưa bắt đầu.** Các foundation `src/grading`, `src/assistance`, `src/ai/contracts.ts` tồn tại nhưng final plan phân loại chúng là cần replace/migrate, không phải v1.1 runtime hoàn tất. |
| Backend v1.0 core | Đã có và là nền tái sử dụng: deterministic scoring, append-only evidence, Practice/Transfer session isolation, receipts, PostgreSQL persistence, API/runtime. |

**Next execution:** Slice 0 rồi Slice 1. Slice 2 bị chặn cho đến khi external code/contracts/tests review PASS phần implementation của Slice 1.

## Approved decisions — do not reopen by default

- v1.1 là authority Competition Demo hiện hành; Practice có AI bị giới hạn nhưng assisted success khác independent capability.
- Independent Transfer luôn isolated; không nhận Practice context và Practice Companion chỉ ở Practice.
- Deterministic validators authoritative khi áp dụng được; written reasoning có thể dùng reviewed-rubric facet evidence.
- AI không trả authoritative `GradingOutcome`; server semantic validation và aggregation tạo outcome.
- Chỉ `CORRECT` qua full gate; `PARTIALLY_CORRECT`/`INCORRECT` là non-pass; `UNCERTAIN` fail-closed.
- Reference solutions không canonical; các phương pháp toán đúng khác nhau phải được chấp nhận.
- Assistance evidence non-punitive, server-authored; `answerRevealed` phản ánh delivery thật, không hard-code false.
- Chỉ `DRAFT` content được sửa; reviewed/approved/published body immutable.
- `/ops` là Content Studio tối thiểu có bảo vệ, không phải LMS; progression là static human-authored, không adaptive AI curriculum.
- Published MicroSkill revision có thể có bank pair nhỏ; server chọn pair. Fresh independent Transfer không tái dùng Transfer đã exposed như verification mới.
- Raw Practice conversation là operational data; durable evidence là structured facts. Competition Release P0 yêu cầu các shipped AI capability đủ qualification và deployment persistent.

## Active implementation plan

[Final v1.1 implementation plan](superpowers/plans/2026-08-19-competition-demo-v1.1-final-implementation.md) là **kế hoạch v1.1 duy nhất được thực thi khi có approval**.

[Evidence-aware v1.1 plan](superpowers/plans/2026-08-19-evidence-aware-demo-v1.1.md) là historical/superseded và không được execute. Plan Academic Ink UI vẫn là active supporting design reference, không bị supersede chỉ vì cũ.

## Open / external decisions

- Real AI provider/model/configuration selection và qualification cho shipped capabilities.
- Persistent deployment host và PostgreSQL production host.
- Production raw-conversation retention duration / cleanup policy.
- Final teacher-reviewed Competition Demo content bank.
- External review cho các cleanup documents hiện hành trước khi execution tiếp tục.

## Supporting and historical material

| Classification | Location | Cách dùng |
|---|---|---|
| **Active supporting reference** | `architecture/competition-mvp/`, ADR-004 đến ADR-010, `design/competition-ui/`, `p0-discovery/`, runtime acceptance evidence | Đọc khi slice chạm architecture, security, persistence, UI, qualification hoặc runtime behavior tương ứng. |
| **Evergreen / long-term** | Full Product scope, competition rulebook/PDF, evidence manifests, privacy/security rules, benchmark methodology | Bảo tồn và tra cứu cho future product, operations và competition audit. |
| **Historical evidence** | `docs/reviews/`, `docs/proposals/`, `docs/research/`, frozen v1.0, prior design exploration | Đọc để hiểu origin, trade-off, rejected direction, review/evidence; không override current authority. |
| **Superseded** | v1.1 plan được nêu rõ ở phần Active plan | Không execute; giữ để audit. |

Một current/frozen decision mới hơn luôn outrank proposal, planning note, review comment hoặc exploratory document cũ hơn. Nếu classification của một tài liệu chưa rõ, giữ nguyên và báo `CLASSIFICATION NEEDS REVIEW` thay vì tự demote.

Đọc [DOCUMENT_MAP.md](DOCUMENT_MAP.md) khi cần điều hướng đầy đủ toàn bộ cây tài liệu, phân loại ADR hoặc supporting reference theo slice.

## Future session bootstrap

```text
1. Read docs/CURRENT.md.
2. Read the three current v1.1 source-of-truth files.
3. Read the active final implementation plan.
4. Inspect actual code relevant to the approved current slice.
5. Do not re-run completed product/planning debates.
6. If code contradicts an approved assumption, report the contradiction; do not silently redesign.
7. Execute only the approved current slice and preserve append-only evidence/history.
```
