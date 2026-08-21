# THINKAI — Nguồn nội dung nội bộ cho hồ sơ dự thi

> Dùng để chuẩn bị báo cáo Bảng B 12 trang, video trình bày 5 phút, demo 3 phút và Prompt Log/minh chứng. Đây không phải báo cáo cuối cùng hay audit kỹ thuật.
>
> **Nguồn chuẩn:** Competition Demo v1.1 trong worktree/nhánh triển khai hiện hành, authoritative docs v1.1, test v1.1 và Slice 11 deployment work. Không dùng `main`/v1.0 làm baseline sản phẩm.

## Cách đọc trạng thái

- **IMPLEMENTED** — có trong implementation v1.1 hiện hành; các claim quan trọng có source path.
- **CURRENTLY BEING COMPLETED IN SLICE 11** — đã có cấu hình/mã deploy hoặc integration liên quan, nhưng chưa có bằng chứng release cuối cần thiết để claim production-ready.
- **FUTURE / OUT OF SCOPE** — không được claim là tính năng demo hiện tại.

## 1. ThinkAI nói đơn giản

**IMPLEMENTED.** ThinkAI là hệ thống học Toán theo bằng chứng: học sinh có thể luyện với AI hỗ trợ có giới hạn, nhưng chỉ được ghi nhận năng lực ở mức hẹp khi sau đó tự vận dụng cùng ý tưởng trong một bài Transfer độc lập. Demo v1.1 là một vertical slice Toán lớp 10 với đường Subject → Topic → MicroSkill và ngân hàng Practice/Transfer nhỏ đã duyệt.

Vấn đề ThinkAI giải quyết không phải là “AI có thể giải bài nhanh thế nào”, mà là sự khác nhau giữa hai điều:

```text
Làm đúng khi có hỗ trợ AI  ≠  tự vận dụng được trong tình huống mới
```

Practice đúng khi dùng hint/chat vẫn là thông tin tốt để học, nhưng không tự nó chứng minh học sinh có thể dùng ý tưởng khi bài đổi biểu diễn hoặc bối cảnh. ThinkAI ghi nhận điều kiện hỗ trợ ở Practice, giữ Transfer không có trợ giúp trước khi nộp, rồi chỉ tạo Capability Receipt từ chuỗi evidence thỏa policy.

Người dùng chính là học sinh; giáo viên/content reviewer chuẩn bị và duyệt nội dung; presenter/auditor xem receipt và evidence demo. Khác với việc đưa học sinh một chatbot tổng quát, ThinkAI giới hạn AI theo guidance đã duyệt và không cho AI/browser tự chấm, tự mở khóa, tự cấp receipt hay biết bài Transfer. Nguồn: `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`, `docs/decisions/011-evidence-aware-hybrid-grading.md`, `src/receipts/service.ts`.

## 2. Luồng học sinh

**IMPLEMENTED.** Luồng demo cần thể hiện:

1. Learner chọn **Subject → Topic → MicroSkill** trong đường học đã publish.
2. Server chọn và bind một pair Practice/Transfer đã review với phiên học; browser không tự chọn pair.
3. Learner làm **Practice**, nhập đáp án hoặc written solution, và có thể dùng Practice Companion.
4. Learner submit; hệ thống tạo evidence chấm deterministic và/hoặc rubric, sau đó cho kết quả và Practice Process Feedback.
5. Learner mở **Independent Transfer**: cùng micro-skill nhưng đổi biểu diễn/bối cảnh.
6. Learner submit Transfer không có chat AI/hint/Practice context trước đó.
7. Chỉ khi Transfer đủ điều kiện mới reveal connection do content đã duyệt tạo sẵn.
8. Khi Practice và Transfer cùng đạt policy, server issue **Capability Receipt**; **Progress/Audit** được dựng từ evidence bền vững.

Nếu Practice chưa đạt, learner tiếp tục attempt/recovery. Nếu Transfer chưa đạt, không reveal answer/mapping và không có receipt. Lần Transfer độc lập mới loại trừ pair/task Transfer đã exposed trong episode; khi hết pair mới, trả `NO_FRESH_TRANSFER_AVAILABLE` thay vì tái sử dụng bài đã lộ như một lần kiểm chứng mới. Nguồn: `app/page.tsx`, `src/content/selection.ts`, `src/transfer/fresh-attempt.ts`, `src/transfer/service.ts`.

## 3. AI trong ThinkAI

| Khả năng | AI nhận | AI trả | Không được quyết định |
|---|---|---|---|
| Practice Companion | Practice snapshot được phép, approved AI guidance, learner message và ngữ cảnh Practice vận hành | Candidate reply ngắn, hỗ trợ khái niệm/chiến lược và metadata đề xuất | Điểm, pass, progression, receipt, support/reveal facts authoritative, hoặc bất kỳ nội dung Transfer nào. |
| Written-solution/rubric evaluator | Sau submit: response, expected result, reviewed rubric, reference solutions không-canonical, misconceptions và version metadata của task | Rubric facets/criteria có cấu trúc, không phải final outcome | Gate, receipt, progression; không bắt learner dùng đúng một reference method. |
| Practice Process Feedback | Sau Practice: aggregate evidence, summary assistance, metadata và practice context cần thiết | Phản hồi giải thích quá trình | Grading/policy/receipt; không được hoạt động trên Transfer. |
| Transfer evaluation | Chỉ sau submit: transfer-owned response, rubric, expected result, references và metadata | Evidence facets theo contract Transfer | Không nhận Practice transcript/hint/answer/feedback/pair mapping/reveal; không có trợ giúp trước nộp. |

**IMPLEMENTED.** AI output là evidence hoặc candidate content bị kiểm tra schema; backend aggregation và policy mới tạo `CORRECT`, `PARTIALLY_CORRECT`, `INCORRECT`, `UNCERTAIN`. Chỉ `CORRECT` qua grading gate. Input unavailable, malformed, schema-invalid hoặc conflict phải fail-closed là `UNCERTAIN`; confidence model chỉ là thông tin chẩn đoán. Nguồn: `src/assistance/companion.ts`, `src/ai/evaluator.ts`, `src/ai/process-feedback.ts`, `src/grading/rubric-validation.ts`, `src/grading/gate-policy.ts`.

**IMPLEMENTED.** Assistance không là điểm phạt. Server tự phân loại và lưu assistance evidence gồm support level, attempted answer reveal, output bị block hay được delivery, và version/provenance liên quan. Nhờ vậy evidence nói đúng điều learner đã được hỗ trợ; AI/client không được tự khai báo các fact này. Nguồn: `src/assistance/service.ts`, `src/assistance/evidence.ts`, `src/assistance/companion.test.ts`.

## 4. Practice và Independent Transfer

**IMPLEMENTED.** Practice là nơi học: AI Companion/hint có thể xuất hiện theo approved guidance. Transfer là nơi kiểm tra vận dụng độc lập: trước submit, không render hay đưa qua API chat AI, hint, Practice feedback/transcript, Practice answer/reference, pair relation hoặc reveal. Thành công ở Practice có hỗ trợ vì thế không bị diễn giải thành independent capability.

Transfer safe DTO, AI context và route/API có test phủ định rò rỉ Practice/hint. Reveal chỉ xảy ra sau Transfer verified; receipt bị bind vào đúng parent chain Practice–Transfer, pair/task/version và evidence. Nguồn: `src/transfer/service.test.ts`, `src/api/dispatcher.test.ts`, `src/receipts/service.test.ts`.

## 5. Content Studio `/ops` và content versioned

**IMPLEMENTED.** v1.1 có shared content aggregate cho Subject, Topic, MicroSkill, Practice/Transfer tasks, expected result, rubric/criteria, reference solutions, common misconceptions, AI guidance, Practice–Transfer pair và connection reveal. Learner runtime chỉ chọn content `PUBLISHED`.

Lifecycle là `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → DEPRECATED`. Chỉ body `DRAFT` được sửa; submit review đóng băng version; sửa sau review phải tạo DRAFT/version mới. Publish giữ đúng body đã approve; deprecate không xóa history. Session/evidence giữ content version đã dùng nên giáo viên/auditor có thể truy ngược bài và policy thực tế.

`/ops` dùng cùng repository với learner runtime và có service/lifecycle operations có bảo vệ server. UI hiện là Content Studio shell tối thiểu; không nên giới thiệu như một LMS quản trị hoàn chỉnh. Nguồn: `src/content/v11-validator.ts`, `src/content/lifecycle.ts`, `src/content/postgres-repository.ts`, `src/ops/service.ts`, `app/ops/page.tsx`.

## 6. Dữ liệu, AI tools và privacy

**IMPLEMENTED.** Dữ liệu giáo dục là content authored/reviewed/versioned nêu ở §5. Production loader từ chối structural-test fixture hoặc content không hợp lệ; reference solutions chỉ là hỗ trợ evaluator, không bắt học sinh sao chép một cách giải. Nguồn: `src/content/repository.ts`, `src/content/rubric.ts`, `src/content/repository.test.ts`.

**IMPLEMENTED.** PostgreSQL lưu synthetic demo identities/sessions, content revisions, Practice/Transfer events, assistance provenance, scoring/policy/content versions, receipts và Progress/Audit projections. Evidence là append-only; raw Practice conversation chỉ là dữ liệu vận hành phía server cho continuity/feedback, không xuất hiện trong Transfer DTO hoặc log thông thường. ThinkAI không huấn luyện model riêng và không dùng dữ liệu trẻ em thật cho demo. Nguồn: `src/persistence/index.ts`, `src/evidence/schema.ts`, `src/runtime/server.ts`, `evidence/README.md`.

| Công cụ/nền tảng | Vai trò trong demo |
|---|---|
| TypeScript, Node.js | Mã nguồn và server runtime. |
| Next.js 16, React 19 | Learner web UI và Route Handler API. |
| PostgreSQL 16, `pg` | Persistent content, session, evidence và receipt. |
| Docker/Docker Compose | App + PostgreSQL + Cloudflare Tunnel stack. |
| TokenRouter | Provider mặc định hiện tại qua OpenAI-compatible integration. |
| OpenRouter | Provider-compatible alternative, chọn rõ bằng environment config. |
| Cloudflare Tunnel | Ingress public; app/database không expose host port. |
| Playwright, Node test runner/`tsx` | Browser/unit/integration verification. |
| Codex và AI coding tools | Hỗ trợ nghiên cứu/code/tài liệu, có Prompt Log append-only; không thay quyết định đội. |

Nguồn: `package.json`, `src/ai/openai-compatible.ts`, `Dockerfile`, `docker-compose.yml`, `.env.production.example`, `evidence/prompt-log/README.md`.

## 7. Kiến trúc

**IMPLEMENTED.** Sơ đồ phù hợp để đưa vào báo cáo:

```text
Learner browser / Ops browser
          │ HTTPS
          ▼
Cloudflare Tunnel → ThinkAI Next.js web + API/backend policy
                      ├─ Practice / grading / Transfer / receipt / evidence
                      ├─ /ops → reviewed, versioned content repository
                      ├─ OpenAI-compatible adapter → TokenRouter | OpenRouter
                      └─ PostgreSQL → content, sessions, append-only evidence, receipts
```

Mỗi API route chỉ bind input/auth và gọi service; policy phía server sở hữu gate, pair selection, reveal và receipt. PostgreSQL là shared source cho `/ops` và learner runtime. Nguồn: `app/api/v1/[...path]/route.ts`, `src/api/dispatcher.ts`, `src/runtime/server.ts`.

## 8. Slice 11: deployment/release

**CURRENTLY BEING COMPLETED IN SLICE 11.** Deployment stack đã có Dockerfile Node 24, `docker-compose.yml` gồm `app`, PostgreSQL 16 và `cloudflared`; Cloudflare Tunnel là public ingress, app và database chỉ `expose` nội bộ. Stack hỗ trợ quick tunnel để kiểm tra và named tunnel token cho hostname cấu hình. Runtime có thể khởi động PostgreSQL content store rỗng để Content Studio `/ops` nạp content, hoặc bootstrap seed/content đã duyệt có SHA-256/version.

TokenRouter integration hiện dùng OpenAI-compatible `/chat/completions`, provider/model được chọn bằng environment (`THINKAI_AI_PROVIDER`, `THINKAI_AI_MODEL`) và không commit secrets. Tài liệu deploy hướng tới Linux Docker host, kiểm tra `docker compose ps`, `/healthz`, migrations và authenticated learner/Ops flow sau mỗi update. Tailscale/SSH là chi tiết admin/deploy, không phải chức năng sản phẩm. Nguồn: `Dockerfile`, `docker-compose.yml`, `.env.production.example`, `tools/deploy/deploy-debian.ps1`, `docs/deployment/ubuntu-cloudflare.md`, `src/ai/openai-compatible.ts`.

Cần hoàn tất evidence release: host/persistent database thực tế, migrations + published content trên host, health check và reset, authenticated learner/Ops flow, provider/model thật đã qualification và demo AI-unavailable fallback. Không đưa key, mật khẩu, URL private hay SSH key vào report/video.

## 9. Testing và verification

**IMPLEMENTED.** Test v1.1 phủ các nhóm competition-useful: companion answer-reveal block; assistance provenance; rubric validation/alternate method/fail-closed aggregation; content lifecycle và immutable versions; published server-selected practice; Transfer isolation/fresh attempts; receipt parent-chain; append-only evidence, migration và API golden flow. Browser test kiểm tra learner UI không render Transfer trước khi có server session. Nguồn: `src/ai/*.test.ts`, `src/content/*.test.ts`, `src/grading/*.test.ts`, `src/transfer/*.test.ts`, `src/receipts/*.test.ts`, `src/api/dispatcher.test.ts`, `tests/e2e/learner-flow.spec.ts`.

**CURRENTLY BEING COMPLETED IN SLICE 11.** Lần chạy v1.1 ngày 2026-08-21: `npm run check` không báo lỗi; `npm test` có 95 pass, 1 fail, 12 skip trong tổng 108. Test fail là `tools/benchmarks/thinkai-feedback/runner-state.test.mjs` (`completed_result_missing_fail_closed`); các PostgreSQL/runtime cần môi trường phù hợp nên bị skip. `package.json` chưa có `build` script; Dockerfile gọi trực tiếp `npx next build`. Vì vậy không claim benchmark recovery, runtime/PostgreSQL acceptance hay public deployment đã pass cho release. Nguồn: output verification 2026-08-21; `tools/benchmarks/thinkai-feedback/runner-state.test.mjs`, `src/runtime/http-acceptance.test.ts`, `src/persistence/postgres.integration.test.ts`.

## 10. Phạm vi và giới hạn

### IMPLEMENTED

- Full v1.1 learner/evidence flow: published content → Practice → bounded assistance → hybrid grading → independent Transfer → reveal → receipt → progress/audit.
- Assistance evidence, fail-closed grading gates, fresh Transfer selection, versioned content lifecycle, PostgreSQL persistence và protected Content Studio service.
- Provider-neutral AI contracts cùng TokenRouter/OpenRouter-compatible adapter.

### CURRENTLY BEING COMPLETED IN SLICE 11

- Persistent Docker/Cloudflare deployment and post-deploy verification.
- Final provider/model configuration and live qualification for AI capabilities on published demo content.
- Final runtime/PostgreSQL/browser verification on release-like environment, including the outstanding benchmark runner-state failure.

### FUTURE / OUT OF SCOPE

- Broader curriculum, many subjects/larger content bank, full LMS/class management, adaptive AI curriculum.
- Handwriting OCR/photo ingestion; nếu thêm sau này phải có learner review/confirmation trước grading.
- General chatbot, automatic content publishing, mastery score/long-term learner label.
- Claims về hiệu quả học tập quy mô lớn hoặc user study chưa có evidence.

## 11. Material cho báo cáo Bảng B

| Mục | Nội dung mạnh nên dùng | Hình/nguồn đề xuất |
|---|---|---|
| 1. Vấn đề | Assisted success không bằng independent capability. | Sơ đồ §1; `competition-demo-v1.1-amendment.md`. |
| 2. Đối tượng | Học sinh THPT; teacher/reviewer vận hành nội dung. | Luồng §2, §5. |
| 3. Dữ liệu, prompt, AI | Bảng ranh giới AI §3; Prompt Log append-only. | `evidence/prompt-log/README.md`. |
| 4. Thu thập/xử lý/chuẩn hóa | Reviewed/versioned content, server evidence, privacy. | Content lifecycle §5, data §6. |
| 5. Tool/model/platform | TokenRouter-compatible provider layer, TypeScript/Next/PostgreSQL/Docker/Cloudflare. | Bảng §6. |
| 6. Kiến trúc | Browser → Tunnel → Next/services → AI/PostgreSQL; `/ops` cùng repository. | Sơ đồ §7. |
| 7. Kiểm thử | Isolation/fail-closed/lifecycle/receipt tests; nêu trung thực Slice 11 status. | §9, test artifacts. |
| 8. Hạn chế/rủi ro/hướng phát triển | Scope hẹp, qualification/deployment completion, future items. | §10. |
| 9. Prompt Log/minh chứng | Git commits, append-only Prompt Log, test/deploy command evidence. | `evidence/`, `tools/prompt-log/`. |

Không biến report thành danh sách class/file. Một ảnh Practice, một ảnh Transfer “no help”, Receipt/Progress/Audit, `/ops` lifecycle và sơ đồ kiến trúc là đủ mạnh.

## 12. Material cho hai video

### Video trình bày 5 phút

Trọng tâm: (1) vấn đề “đúng nhờ trợ giúp” không phải bằng chứng độc lập; (2) ThinkAI tách Practice và Transfer; (3) AI có ích nhưng bị bounded, còn backend/teacher-reviewed content giữ authority; (4) receipt là bằng chứng hẹp, trung thực; (5) v1.1 có vertical slice, persistence và deploy stack, đồng thời nói rõ release gates còn hoàn tất trong Slice 11. Dùng sơ đồ §1/§7 và bảng AI §3; không claim user-study hay broad mastery.

### Video demo 3 phút

Chuẩn bị: PostgreSQL/content PUBLISHED hoạt động; learner/presenter session; `/healthz`; reset `demo-clean`; provider/model đã configured hoặc đường fallback AI-unavailable hiển thị trung thực.

Quay theo thứ tự: Subject/Topic/MicroSkill → server-bound Practice → (nếu live AI đã qualified) một Practice Companion interaction → submit/feedback → Independent Transfer với thông điệp không có hint/chat/context → submit đúng → reveal connection → Receipt → Progress/Audit. Có thể quay riêng failure/retry: Transfer không đạt thì không reveal, rồi fresh Transfer hoặc `NO_FRESH_TRANSFER_AVAILABLE`.

Rủi ro quay: thiếu content published, migration/database lỗi, session hết hạn, provider configuration/qualification chưa hoàn tất, hoặc Slice 11 post-deploy checks chưa chạy. Không thay fallback authored bằng output AI hay ngược lại.

## 13. TEAM INPUT REQUIRED

Sau khi phần kỹ thuật được freeze, đội chỉ cần bổ sung ngắn: thành viên/vai trò; teacher/content confirmation; screenshots/presentation assets; public URL; Prompt Log Drive link; provider/model/qualification record và release verification artifacts thực tế. Không suy đoán hay tạo lại các minh chứng này.
