# THINKAI — Nguồn nội dung nội bộ cho hồ sơ dự thi

> Mục đích: tập hợp thông tin ngắn gọn, có thể kiểm chứng để đội chuẩn bị báo cáo Bảng B, video trình bày 5 phút, demo 3 phút và gói Prompt Log/minh chứng. Đây không phải báo cáo cuối cùng, không phải audit mã nguồn.
>
> Phạm vi chuẩn: `competition-demo-v1.1`. Khi biên soạn, `main` còn ở checkpoint v1.0 (`c161d10`), còn nhánh/worktree triển khai v1.1 có commit mới nhất `8740225`; theo xác nhận của đội, v1.1 là chuẩn sản phẩm hiện hành. Các claim “VERIFIED” về v1.1 bên dưới được đối chiếu với snapshot đó và các contract v1.1. Cần merge/đồng bộ trước khi chụp bằng chứng phát hành.

## 1. ThinkAI nói đơn giản

**VERIFIED.** ThinkAI là hệ thống học tập giúp học sinh luyện một ý tưởng Toán với hỗ trợ AI có giới hạn, rồi yêu cầu các em tự áp dụng ý tưởng đó vào một bài mới trước khi ghi nhận bằng chứng năng lực. Demo tập trung vào một lát cắt Toán lớp 10, một đường micro-skill nhỏ; không tự nhận là LMS hay hệ thống đánh giá toàn diện. Nguồn: `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`.

Vấn đề thực tế là “làm đúng” chưa luôn đồng nghĩa “tự làm được”. Một em có thể ra đáp án nhờ AI gợi ý công thức, nhắc bước hoặc chỉ đường. Điều đó vẫn có ích cho học tập, nhưng chưa đủ để giáo viên/judge kết luận em có thể vận dụng ý tưởng khi cách trình bày bài toán thay đổi.

Ý tưởng trung tâm của ThinkAI là tách hai việc:

```text
Practice có thể được hỗ trợ  →  ghi điều kiện hỗ trợ
Transfer độc lập              →  kiểm tra việc tự vận dụng
Hai kết quả đủ điều kiện      →  Capability Receipt có giới hạn
```

Người dùng chính là học sinh THPT trong lát cắt demo; giáo viên/người duyệt nội dung là người chuẩn bị và phê duyệt bài; presenter/auditor xem bằng chứng demo. Khác với việc “đưa học sinh ChatGPT”, ThinkAI không để chatbot tự quyết điểm, mở khóa hay cấp chứng nhận; hỗ trợ được giới hạn theo nội dung đã duyệt, còn Transfer không mang theo chat/hint/context Practice. Capability Receipt chỉ nói điều hệ thống thực sự quan sát được trong một cặp bài, không gắn nhãn mastery toàn cục. Nguồn: `docs/decisions/011-evidence-aware-hybrid-grading.md`, `src/receipts/service.ts`.

## 2. Luồng học sinh có thể trình diễn

Luồng v1.1 là:

1. Chọn **Subject → Topic → MicroSkill** trong đường học do nội dung đã duyệt xác định.
2. Server chọn và gắn một cặp Practice/Transfer đã publish với phiên học; trình duyệt không tự chọn cặp.
3. Làm **Practice**: nhập đáp án hoặc lời giải viết; có thể dùng Practice Companion khi cần.
4. Nộp bài. Hệ thống chấm phần có thể chấm xác định và, khi bài yêu cầu, kiểm tra bằng rubric.
5. Nhận kết quả/chỉ dẫn phục hồi; Practice Process Feedback chỉ giải thích quá trình, không đổi điểm hay pass.
6. Khi đủ điều kiện, bắt đầu **Independent Transfer**: bài vận dụng cùng micro-skill trong biểu diễn/bối cảnh khác.
7. Nộp Transfer độc lập, rồi mới chấm. Nếu đạt, mới reveal mối liên hệ do nội dung đã duyệt.
8. Khi chuỗi Practice + Transfer thỏa policy, server cấp **Capability Receipt**; Progress/Audit dựng lại từ evidence.

Nếu Practice chưa đạt, learner tiếp tục attempt/recovery theo nội dung được duyệt. Nếu Transfer chưa đạt, không reveal đáp án/mối liên hệ và không có receipt. Một lần Transfer độc lập mới chỉ được lấy từ pair/task chưa từng exposed trong episode; nếu ngân hàng hết bài mới, trả `NO_FRESH_TRANSFER_AVAILABLE`, không tái dùng bài đã lộ rồi gọi đó là kiểm tra mới. Nguồn: `src/transfer/fresh-attempt.ts`, `src/content/selection.ts`, `src/transfer/service.ts`.

## 3. AI được dùng như thế nào

| Tính năng | AI nhận | AI trả | Ranh giới authority |
|---|---|---|---|
| Practice Companion | Bài Practice/snapshot được phép, AI guidance đã duyệt, tin nhắn ngắn của learner và hội thoại Practice đang hoạt động | Câu trả lời ứng viên, hỗ trợ khái niệm/chiến lược; metadata hỗ trợ đề xuất | Không chấm, không cấp pass/receipt, không quyết progression, không biết/tiết lộ Transfer. Server kiểm tra/chặn và tự ghi mức hỗ trợ, attempted reveal, delivery/exposure. |
| Rubric evaluator cho lời giải viết | Sau khi submit: bài làm, expected result, rubric, reference solutions không-canonical, misconceptions và metadata version của **chính task đó** | Facets/criteria có cấu trúc, không phải verdict cuối | Server kiểm schema, criterion ID/độ đầy đủ/tính nhất quán, kết hợp evidence rồi mới suy ra outcome. Output lỗi/thiếu/mâu thuẫn là `UNCERTAIN` fail-closed. |
| Practice Process Feedback | Chỉ sau Practice: evidence đã chấm, tóm tắt assistance, dữ liệu Practice cần thiết và metadata đã duyệt | Phản hồi giải thích cho learner | Không hoạt động trên Transfer, không đổi grade/gate/receipt/progression. |
| Transfer rubric evaluation | Chỉ sau submit: response và nội dung/rubric/reference của Transfer | Facets bằng chứng sau nộp | Không nhận Practice transcript, hints, answers, feedback, pair mapping hay reveal; không có AI help trước submit. |

**VERIFIED.** `CORRECT` là outcome duy nhất có thể qua grading gate; `PARTIALLY_CORRECT`, `INCORRECT`, `UNCERTAIN` không tạo pass/receipt. Confidence của model chỉ là provenance/chẩn đoán, không phải điểm. Nguồn: `docs/architecture/competition-mvp/v1.1-amendment-contracts.md`, `src/grading/gate-policy.ts`, `src/ai/evaluator.ts`, `src/ai/process-feedback.ts`.

Nguyên tắc cần nói rõ trong báo cáo: AI cung cấp hỗ trợ và evidence bị ràng buộc; backend/server policy là authority cho chấm, progression và receipt. Browser cũng không có authority này.

## 4. Practice khác Independent Transfer

Practice là không gian học: có thể dùng hint/Practice Companion; assistance là điều kiện được ghi nhận chứ không phải điểm phạt. Transfer là không gian chứng minh vận dụng độc lập: trước khi submit, không có chat AI, hint, Practice feedback, transcript, đáp án/lời giải Practice, reference solution Practice, pair relation hoặc reveal. Vì vậy, Practice làm đúng có hỗ trợ không tự nó là proof of independent capability; bằng chứng mạnh hơn nằm ở Transfer và chuỗi evidence do server lưu.

**VERIFIED.** DTO/API Transfer và context AI có test phủ định việc rò Practice/hint; reveal chỉ sau verified Transfer. Nguồn: `src/transfer/service.test.ts`, `src/api/dispatcher.test.ts`, `src/transfer/fresh-attempt.test.ts`.

## 5. Giáo viên và Content Studio `/ops`

`/ops` là Content Studio tối thiểu, có bảo vệ phía server, không phải LMS. Giáo viên/content reviewer quản lý cùng kho nội dung mà learner runtime dùng: Subject → Topic → MicroSkill; Practice/Transfer task; expected result; rubric; các reference solutions; common misconceptions; AI guidance; pair Practice–Transfer và nội dung reveal connection.

Vòng đời phiên bản là `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → DEPRECATED`. Chỉ thân `DRAFT` được sửa. Gửi review làm đóng băng phiên bản; sửa sau đó phải fork DRAFT/version mới. Chỉ content `PUBLISHED` được chọn cho learner mới; `DEPRECATED` giữ lại cho history/audit. Cách này quan trọng vì bài, rubric, guidance và pair đã review phải đúng là thứ learner đã nhận; evidence quá khứ không thay đổi khi nội dung được sửa sau này. Nguồn: `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`, `src/content/lifecycle.test.ts`, `src/ops/service.ts`, `app/ops/page.tsx`.

## 6. Dữ liệu và công cụ AI

### Dữ liệu

- Nội dung giáo dục là content do đội/giáo viên chuẩn bị, có provenance và version: task, expected result, rubric, reference solutions, misconceptions, AI guidance và pair mapping. Production loader từ chối fixture chỉ dùng kiểm thử hoặc content thiếu review. Nguồn: `src/content/repository.test.ts`, `src/content/rubric.ts`.
- App lưu synthetic demo identity/session, câu trả lời, event Practice/Transfer, assistance facts, phiên bản content/scorer/policy, receipt và projection Progress/Audit trong PostgreSQL. Evidence append-only; raw hội thoại Practice là dữ liệu vận hành, không phải thứ cần phô bày cho Transfer hay ordinary logs. Nguồn: `src/evidence/schema.ts`, `src/persistence/index.ts`, `docs/product-scope/competition-demo/competition-demo-v1.1-amendment.md`.
- ThinkAI không huấn luyện mô hình riêng. Nó gọi provider tương thích OpenAI khi AI được cấu hình; provider/model được lưu như provenance, không phải bí mật. Raw child/student data không được dùng; demo dùng danh tính synthetic. Nguồn: `src/ai/openai-compatible.ts`, `evidence/README.md`.

### Công cụ/nền tảng cần khai báo

| Hạng mục | Vai trò |
|---|---|
| TypeScript, Node.js | Mã nguồn và runtime server.
| Next.js 16, React 19 | Web UI và Route Handler API.
| PostgreSQL + `pg` | Lưu content revisions, session/evidence/receipt bền vững.
| Docker, Docker Compose | Đóng gói app Node và PostgreSQL cho deploy.
| Cloudflare Tunnel (`cloudflared`) | Public ingress; app/database không publish host port trong compose.
| TokenRouter hoặc OpenRouter | Lớp provider AI tương thích OpenAI, chọn bằng biến môi trường; model phải cố định và qualified.
| Playwright | E2E browser; Node test runner/`tsx` | test TypeScript.
| Codex/AI coding tools | Hỗ trợ nghiên cứu, viết/kiểm tra code và tài liệu; phải có Prompt Log trung thực, không thay thế quyết định đội. |

Nguồn: `package.json`, `Dockerfile`, `docker-compose.yml`, `.env.production.example`, `src/ai/openai-compatible.ts`, `evidence/preflight/tooling-manifest.yaml`.

**TEAM INPUT REQUIRED.** Xác nhận provider, model và cấu hình thực sự dùng trong video/release; không ghi một model cụ thể nếu chưa có qualification record đúng cấu hình đó. Không đưa key, URL private hoặc SSH key vào Bảng B/PDF.

## 7. Kiến trúc để vẽ sơ đồ

```text
Learner browser / Ops browser
        │ HTTPS qua Cloudflare Tunnel
        ▼
ThinkAI Next.js web + API/backend policy
  ├─ Practice / grading / Transfer / receipt & evidence services
  ├─ Content Studio /ops ───────► reviewed, versioned content
  ├─ OpenAI-compatible adapter ─► TokenRouter hoặc OpenRouter (optional AI)
  └─ PostgreSQL ────────────────► content, sessions, append-only evidence, receipts
```

App và PostgreSQL chạy thành hai container; `cloudflared` là container ingress. Tailscale/SSH chỉ là chi tiết vận hành để deploy/admin, không nên đặt làm tính năng sản phẩm. Nguồn: `docker-compose.yml`, `docs/deployment/ubuntu-cloudflare.md`, `src/runtime/server.ts`.

## 8. Kiểm thử và kết quả thực tế

**VERIFIED trên worktree v1.1, 2026-08-21.** `npm run check` chạy không báo lỗi TypeScript. `npm test` chạy 108 test: 95 pass, 1 fail, 12 skip. Các test pass có nhóm grading fail-closed, companion bị chặn khi lộ đáp án, lifecycle content, Transfer isolation/fresh-attempt, receipt chain, persistence/evidence và API golden flow. E2E UI hiện có kiểm tra màn learner không render Transfer khi chưa có server session: `tests/e2e/learner-flow.spec.ts`.

Các test PostgreSQL/integration/runtime cần môi trường PostgreSQL phù hợp nên đang skip trong lần chạy này; không được mô tả là đã pass. `tools/benchmarks/thinkai-feedback/runner-state.test.mjs` fail với `completed_result_missing_fail_closed`; vì vậy benchmark checkpoint/recovery chưa đạt. `npm run build` không chạy vì `package.json` chưa định nghĩa script `build`, dù Dockerfile gọi `npx next build`. Không có bằng chứng trong repo về deploy public, live E2E trên host, hoặc AI provider/model qualification hoàn tất cho cấu hình release.

Nguồn: lệnh kiểm tra 2026-08-21; `src/runtime/http-acceptance.test.ts`, `src/persistence/postgres.integration.test.ts`, `tests/e2e/learner-flow.spec.ts`, `tools/benchmarks/thinkai-feedback/runner-state.test.mjs`.

## 9. Lịch sử phát triển và AI assistance

Mốc có ích để trình bày: ý tưởng/demo ban đầu → deterministic scoring, evidence append-only, Practice/Transfer/Receipt/PostgreSQL (các commit 2026-08-14 đến 19) → v1.1: content revisions/lifecycle, hybrid grading, bounded companion, fresh Transfer, `/ops`, learner flow và deployment configuration (commit 2026-08-20–21). Xem `git log --oneline --all`, `docs/decisions/001-modular-monolith-stack.md` đến `011-evidence-aware-hybrid-grading.md`.

Phân biệt trung thực: đội quyết định phạm vi, nội dung giáo dục và tiêu chí; AI/coding tools hỗ trợ nghiên cứu, code/tài liệu/kiểm tra; framework, database, provider và thư viện là thành phần bên ngoài. Prompt Log chỉ ghi nhận những prompt/hoạt động quan sát được theo cơ chế append-only; không tái dựng hoặc nhận vơ phần hội thoại thiếu. Nguồn: `evidence/prompt-log/README.md`, `evidence/README.md`.

## 10. Phạm vi hiện tại

### Implemented now

v1.1 có contract/mã cho content revision lifecycle, selection Transfer mới, deterministic + rubric-facet aggregation fail-closed, bounded companion adapter, Practice Process Feedback non-authoritative, Transfer isolation, evidence/receipt, API learner flow, `/ops` shell/service và Docker deployment config. Xem các source ở mục 3–7.

### Limitations

- Live provider/model chính xác và qualification release chưa có evidence hoàn tất trong repo; không gọi adapter/unit test là AI live đã verified.
- Nội dung demo phải là content giáo viên duyệt thật; fixtures structural/test không phải bằng chứng học thuật.
- Có test benchmark fail, PostgreSQL/runtime tests bị skip trong lần kiểm tra, và chưa có script npm build.
- UI `/ops` hiện là workspace tối thiểu; cần kiểm tra trực tiếp luồng author/review/publish trước khi quay.
- Không có bằng chứng user study/teacher approval/hiệu quả học tập ngoài luồng demo kỹ thuật.

### Future work

**PLANNED.** Mở rộng môn học/content bank, handwriting/OCR có bước learner xác nhận, math editor phong phú, nghiên cứu người dùng/quy mô trường học, retention policy production cụ thể, và broader adaptive curriculum. Không claim các mục này là có sẵn.

## 11. Map cho 9 mục Bảng B

| Mục Bảng B | Fact/screenshot/diagram mạnh | Nguồn | Cần đội bổ sung |
|---|---|---|---|
| 1. Vấn đề | Assisted success ≠ independent capability; sơ đồ Practice → Transfer | §1, `competition-demo-v1.1-amendment.md` | Ví dụ lớp học thật nếu có.
| 2. Đối tượng | Học sinh THPT; teacher/reviewer; demo Toán 10 | §1, §5 | Tên trường/lớp, consent nếu nêu pilot.
| 3. Dữ liệu, prompt, AI | Bảng §3 và Prompt Log policy | §3, `evidence/prompt-log/README.md` | Link Prompt Log final.
| 4. Thu thập/xử lý dữ liệu | Content reviewed/versioned; evidence append-only; privacy | §5–6 | Nguồn/permission nội dung giáo dục.
| 5. Tool/model/library | Bảng §6 | `package.json`, compose, manifest | Provider/model/version thực tế, ngày qualification.
| 6. Kiến trúc | Sơ đồ §7; screenshot learner + `/ops` + audit | §7 | Sơ đồ final và URL public nếu có.
| 7. Kiểm thử | Kết quả trung thực §8; Transfer isolation, Postgres/runtime screenshots khi chạy | §8 | Chạy lại test/deploy final, ghi artifact.
| 8. Hạn chế/rủi ro/future | §10; provider, content, benchmark, no user study | §10 | Cam kết phạm vi sau cuộc thi.
| 9. Prompt Log/minh chứng | Prompt log append-only, Git history, command/test evidence | §9, `evidence/` | Drive link và danh mục minh chứng cuối.

## 12. Vật liệu cho hai video

### Video trình bày 5 phút

Thông điệp mạnh: (1) một đáp án đúng khi có AI giúp chưa là minh chứng tự vận dụng; (2) ThinkAI tạo một luồng học có ranh giới evidence rõ ràng; (3) AI giúp ở Practice nhưng server/teacher-reviewed content kiểm soát điểm và progression; (4) Transfer độc lập và receipt có giới hạn giúp giải thích trung thực hơn; (5) kết quả hiện tại là vertical slice kỹ thuật, không phải claim hiệu quả học tập quy mô lớn. Dùng sơ đồ §1/§7, ảnh Practice/Transfer/Receipt/Progress/Audit và bảng AI boundaries §3.

### Video demo 3 phút

Chuẩn bị: deploy/khởi động với PostgreSQL và published demo content; bootstrap learner/presenter hợp lệ; xác nhận `/healthz`; reset synthetic `demo-clean`; chuẩn bị provider fallback trung thực nếu AI không sẵn sàng. Không quay bằng fixture structural hoặc dùng dữ liệu trẻ em thật.

Thứ tự tốt: Home/path → chọn MicroSkill → Practice (có thể gửi một tin nhắn bounded nếu provider đã qualified) → nộp → chỉ ra kết quả/feedback → Start Independent Transfer và dòng “No hints…” → nộp đúng → reveal connection → issue Receipt → Progress/Audit. Nếu muốn minh họa recovery, quay riêng: Transfer fail → không reveal → fresh pair hoặc `NO_FRESH_TRANSFER_AVAILABLE`.

Điểm dễ hỏng: thiếu published content/demo seed; cookie/session hết hạn; provider key/model chưa qualified; content không đúng đáp án demo; database migration; test/deploy chưa chạy; UI `/ops` còn tối giản. Luôn có presenter reset và đường AI-unavailable rõ ràng.

## 13. Thông tin đội cần tự bổ sung

**TEAM INPUT REQUIRED.** Chỉ bổ sung khi có bằng chứng: tên/thành viên/vai trò; giáo viên/reviewer và xác nhận/permission nội dung; phản hồi người dùng thật hoặc pilot (nếu có); screenshots final; public demo URL; provider/model/deployment thực tế và ngày qualification; link Drive Prompt Log; nguồn nội dung/dataset ngoài repo và quyền sử dụng; kết quả test/deploy final; commit đã merge v1.1.

## Checklist trước khi dùng làm hồ sơ

- [ ] Bảng B đủ 9 mục ở §11, không thay nhãn VERIFIED bằng số liệu suy đoán.
- [ ] Video phân biệt hỗ trợ Practice và Transfer độc lập.
- [ ] AI/tool disclosure điền provider/model thật, không secret.
- [ ] Prompt Log/evidence link là bản final append-only.
- [ ] Đã cập nhật lại §8 sau khi chạy test, deploy và demo cuối.
