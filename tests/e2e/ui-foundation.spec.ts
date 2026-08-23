import {test,expect} from "@playwright/test";

test("foundation routes preserve the intended learner and operations shells",async({page})=>{
  await page.route("**/api/v1/skills", (route) => route.fulfill({ json: { subjects: [], nextAction: { kind: "none" }, progress: { hasPracticeEvidence: false, hasIndependentTransferEvidence: false } } }));
  await page.goto("/learn");
  await expect(page.getByRole("heading",{name:"Lộ trình theo môn học"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Khám phá môn học"})).toBeVisible();

  await page.route("**/api/v1/challenges/demo", (route) => route.fulfill({ json: { sessionId:"demo",context:{label:"Bài luyện"},task:{prompt:{format:"plain_text",body:"Tìm nghiệm của phương trình."},assets:[],input:"text",requiresWrittenSolution:false},progress:{ordinal:1,label:"Bài luyện hiện tại"},state:{stage:"ready",attemptCount:0,submissionCount:0},assistance:{available:true},nextAction:"submit" } }));
  await page.goto("/practice/demo");
  await expect(page.getByRole("heading",{name:"Bài luyện",exact:true})).toBeVisible();
  await expect(page.getByLabel("Đáp án của bạn")).toBeVisible();
  await expect(page.getByRole("button",{name:"Gửi bài làm"})).toBeDisabled();

  await page.route("**/api/v1/transfers/demo",route=>route.fulfill({json:{sessionId:"demo",task:{prompt:{body:"Tự giải bài toán mới."},input:"written_solution"},state:{stage:"working"},canReveal:false}}));
  await page.goto("/transfer/demo");
  await expect(page.getByRole("heading",{name:"Tự áp dụng trong tình huống mới"})).toBeVisible();
  await expect(page.getByLabel("Cách bạn lập luận")).toBeVisible();
  await expect(page.getByText("Practice Companion")).toHaveCount(0);

  await page.goto("/ops");
  await expect(page.getByRole("heading",{name:"Content Studio"})).toBeVisible();
});

test("Ops renders the real revision hierarchy and keeps non-draft revisions read-only", async ({ page }) => {
  const body = { microSkills: [{ subject: { label: "Toán 10" }, topic: { label: "Hàm số" }, microSkill: { title: "Tìm hệ số góc", evidenceSkillId: "skill_gradient" }, practiceGate: { requiredCorrectCount: 2, maxPracticeItems: 3 }, pairs: [{ id: "pair_gradient_a", version: "1", practiceContent: { id: "task_gradient_p", prompt: { body: "Tìm hệ số góc của đồ thị." }, answerSpec: { kind: "exact_text" } }, transferContent: { id: "task_gradient_t", prompt: { body: "Áp dụng vào tình huống mới." }, answerSpec: { kind: "written_solution" } }, connectionReveal: { title: "Cùng một quan hệ" } }] }] };
  const revisions = [{ id: "revision_gradient_draft", lifecycle: "DRAFT", body }, { id: "revision_gradient_published", lifecycle: "PUBLISHED", body }];
  await page.route("**/api/v1/ops/revisions", route => route.fulfill({ json: revisions }));
  await page.goto("/ops");
  await page.getByRole("button", { name: /Toán 10/ }).first().click();
  await expect(page.getByLabel("Môn học", { exact: true })).toHaveValue("Toán 10");
  await expect(page.getByLabel("Đề bài").first()).toHaveValue("Tìm hệ số góc của đồ thị.");
  await expect(page.getByText("Bài vận dụng 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Toán 10/ }).nth(1).click();
  await expect(page.getByText("Revision bất biến")).toBeVisible();
  await expect(page.getByLabel("Môn học", { exact: true })).toHaveCount(0);
});

test("Ops gives an authorized-session failure a safe retry state", async ({ page }) => {
  await page.route("**/api/v1/ops/revisions", route => route.fulfill({ status: 403, json: { error: { code: "FORBIDDEN", message: "Content operations require staff authorization." } } }));
  await page.goto("/ops");
  await expect(page.getByRole("heading", { name: "Không thể mở Content Studio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
});

test("Ops creates a teacher-facing initial draft without exposing internal identities", async ({ page }) => {
  const draft = { id: "revision_server_generated", lifecycle: "DRAFT", body: { microSkills: [{ subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 }, topic: { id: "topic_quadratic", subjectId: "subject_math", label: "Hàm số bậc hai", displayOrder: 1 }, microSkill: { id: "micro_sign", evidenceSkillId: "skill_sign", revisionId: "revision_server_generated", title: "Xét dấu tam thức", displayOrder: 1, prerequisiteMicroSkillIds: [] }, pairs: [] }] } };
  let creation: unknown;
  await page.route("**/api/v1/ops/revisions", route => route.fulfill({ json: [] }));
  await page.route("**/api/v1/ops/content", route => { creation = route.request().postDataJSON(); return route.fulfill({ status: 201, json: draft }); });
  await page.goto("/ops");
  await page.getByRole("button", { name: "+ Tạo nội dung mới" }).click();
  await page.getByLabel("Tên môn học").fill("Toán 10");
  await page.getByLabel("Tên chủ đề").fill("Hàm số bậc hai");
  await page.getByLabel("Tên kỹ năng").fill("Xét dấu tam thức");
  await page.getByRole("button", { name: "Tạo bản nháp" }).click();
  await expect(page.getByText("Xét dấu tam thức").first()).toBeVisible();
  expect(creation).toEqual({ subjectLabel: "Toán 10", topicLabel: "Hàm số bậc hai", microSkillTitle: "Xét dấu tam thức" });
  await expect(page.getByLabel(/Evidence skill ID|MicroSkill revision ID/)).toHaveCount(0);
});

test("Ops adds a server-owned Practice to Transfer pair to a new draft", async ({ page }) => {
  const base = { id: "revision_server_generated", lifecycle: "DRAFT", body: { microSkills: [{ subject: { id: "subject_math", label: "Toán 10", displayOrder: 1 }, topic: { id: "topic_quadratic", subjectId: "subject_math", label: "Hàm số bậc hai", displayOrder: 1 }, microSkill: { id: "micro_sign", evidenceSkillId: "skill_sign", revisionId: "revision_server_generated", title: "Xét dấu tam thức", displayOrder: 1, prerequisiteMicroSkillIds: [] }, pairs: [] }] } };
  const paired = structuredClone(base); paired.body.microSkills[0].pairs.push({ id: "pair_server_generated", version: "1", microSkillRevisionId: "revision_server_generated", practiceContent: { id: "task_practice_server", role: "practice", prompt: { body: "" }, answerSpec: { kind: "exact_text" } }, transferContent: { id: "task_transfer_server", role: "transfer", prompt: { body: "" }, answerSpec: { kind: "exact_text" } }, connectionReveal: { title: "", explanation: { body: "" } } });
  let pairRequest = 0;
  await page.route("**/api/v1/ops/revisions", route => route.fulfill({ json: [base] }));
  await page.route("**/api/v1/ops/revisions/revision_server_generated/readiness", route => route.fulfill({ json: { ready: false, issues: ["EMPTY_PUBLISHED_PAIR_BANK"] } }));
  await page.route("**/api/v1/ops/revisions/revision_server_generated/pairs", route => { pairRequest += 1; return route.fulfill({ json: paired }); });
  await page.goto("/ops"); await page.getByRole("button", { name: /Toán 10/ }).click();
  await page.getByRole("button", { name: "+ Thêm cặp Bài luyện – Bài vận dụng" }).click();
  await expect(page.getByText("Bài luyện 1 ↔ Bài vận dụng 1", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Đề bài").first()).toBeVisible();
  expect(pairRequest).toBe(1);
});

test("Ops persists the displayed draft before submitting it for review", async ({ page }) => {
  const body = { microSkills: [{ subject: { label: "Toán 10" }, topic: { label: "Hàm số" }, microSkill: { title: "Bản nháp cũ", evidenceSkillId: "skill_gradient", revisionId: "revision_gradient_1" }, practiceGate: { requiredCorrectCount: 1, maxPracticeItems: 1 }, pairs: [{ id: "pair_1", version: "1", microSkillRevisionId: "revision_gradient_1", practiceContent: { id: "practice_1", prompt: { body: "practice" } }, transferContent: { id: "transfer_1", prompt: { body: "transfer" } } }] }] };
  let saved: { contentAggregate?: typeof body } | undefined; let savedMethod: string | undefined; let reviewed: { revisionId?: string } | undefined;
  await page.route("**/api/v1/ops/revisions", route => route.fulfill({ json: [{ id: "revision_gradient_draft", lifecycle: "DRAFT", body }] }));
  await page.route("**/api/v1/ops/revisions/revision_gradient_draft", route => { savedMethod = route.request().method(); saved = route.request().postDataJSON(); return route.fulfill({ json: { id: "revision_gradient_draft", lifecycle: "DRAFT", body: saved!.contentAggregate } }); });
  await page.route("**/api/v1/ops/review", route => { reviewed = route.request().postDataJSON(); return route.fulfill({ json: { id: "revision_gradient_draft", lifecycle: "IN_REVIEW", body: saved!.contentAggregate } }); });
  await page.goto("/ops"); await page.getByRole("button", { name: /Toán 10/ }).click();
  await page.getByLabel("Tên kỹ năng", { exact: true }).fill("Bản nháp đang mở");
  await page.getByRole("button", { name: "Gửi duyệt" }).click();
  await expect.poll(() => reviewed?.revisionId).toBe("revision_gradient_draft");
  expect(savedMethod).toBe("PUT");
  expect(saved?.contentAggregate?.microSkills[0]?.pairs?.[0]?.microSkillRevisionId).toBe("revision_gradient_1");
  expect(saved?.contentAggregate?.microSkills[0]?.microSkill?.title).toBe("Bản nháp đang mở");
});

test("Home and Learn render the learner-safe authored hierarchy and next action", async ({ page }) => {
  const discovery = {
    subjects: [{ id: "subject_math", label: "Toán 10", displayOrder: 1, topics: [{ id: "topic_equation", label: "Phương trình", displayOrder: 1, microSkills: [
      { id: "micro_factor", revisionId: "revision_factor", title: "Phân tích nhân tử", displayOrder: 1, state: "current" },
      { id: "micro_zero", revisionId: "revision_zero", title: "Dùng tích bằng 0", displayOrder: 2, state: "unavailable", unavailableReason: "Hoàn thành micro-skill trước để tiếp tục." },
    ] }] }],
    nextAction: { kind: "resume_practice", microSkillRevisionId: "revision_factor", practiceSessionId: "challenge_factor" },
    progress: { hasPracticeEvidence: true, hasIndependentTransferEvidence: false },
  };
  await page.route("**/api/v1/home", (route) => route.fulfill({ json: { actorId: "actor_demo", ...discovery } }));
  await page.route("**/api/v1/skills", (route) => route.fulfill({ json: discovery }));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tiếp tục từ đây" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp tục bài luyện" })).toBeVisible();

  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: "Toán 10" })).toBeVisible();
  await expect(page.getByText("Phân tích nhân tử")).toBeVisible();
  await expect(page.getByText("Hoàn thành micro-skill trước để tiếp tục.")).toBeVisible();
});

test("Home starts only the server-selected Practice handoff for a first-use learner", async ({ page }) => {
  const discovery = { subjects: [{ id: "subject_math", label: "Toán 10", displayOrder: 1, topics: [{ id: "topic_equation", label: "Phương trình", displayOrder: 1, microSkills: [{ id: "micro_factor", revisionId: "revision_factor", title: "Phân tích nhân tử", displayOrder: 1, state: "available" }] }] }], nextAction: { kind: "start_practice", microSkillRevisionId: "revision_factor" }, progress: { hasPracticeEvidence: false, hasIndependentTransferEvidence: false } };
  await page.route("**/api/v1/home", (route) => route.fulfill({ json: { actorId: "actor_demo", ...discovery } }));
  await page.route("**/api/v1/practice/start", (route) => route.fulfill({ status: 201, json: { sessionId: "challenge_factor" } }));

  await page.goto("/");
  await page.getByRole("button", { name: "Mở bài luyện" }).click();
  await expect(page).toHaveURL(/\/practice\/challenge_factor$/);
});

test("Practice renders authoritative result before secondary Process Feedback",async({page})=>{
  await page.route("**/api/v1/challenges/result",route=>route.fulfill({json:{sessionId:"result",context:{label:"Bài luyện"},task:{prompt:{body:"Tìm nghiệm."},input:"text"},progress:{ordinal:1,label:"Bài luyện hiện tại"},state:{outcome:"CORRECT"},nextAction:"READY_FOR_TRANSFER"}}));
  await page.route("**/api/v1/challenges/result/process-feedback",route=>route.fulfill({json:{message:"Bạn đã chọn một hướng giải rõ ràng."}}));
  await page.goto("/practice/result");
  await expect(page.getByText("Đúng",{exact:true})).toBeVisible();
  await expect(page.getByText("Bạn đã chọn một hướng giải rõ ràng.")).toBeVisible();
});

test("Transfer unwraps the authoritative Reveal envelope without a client exception",async({page})=>{
  await page.route("**/api/v1/transfers/reveal-test",route=>route.fulfill({json:{sessionId:"reveal-test",task:{prompt:{body:"Tình huống mới."},input:"text"},state:{stage:"verified",outcome:"CORRECT"},canReveal:true}}));
  await page.route("**/api/v1/transfers/reveal-test/connection/reveal",route=>route.fulfill({json:{replayed:false,reveal:{title:"Liên hệ đã duyệt",explanation:{body:"Nội dung Reveal chính xác."}}}}));
  await page.goto("/transfer/reveal-test");
  await page.getByRole("button",{name:"Xem mối liên hệ"}).click();
  await expect(page.getByText("Nội dung Reveal chính xác.")).toBeVisible();
  await expect(page.getByRole("heading",{name:/Application error/})).toHaveCount(0);
});

test("Practice preserves a draft and presents bounded Companion assistance separately",async({page})=>{
  await page.route("**/api/v1/challenges/draft",route=>route.fulfill({json:{sessionId:"draft",context:{label:"Bài luyện"},task:{prompt:{body:"Tìm nghiệm."},input:"text"},progress:{ordinal:1,label:"Bài luyện hiện tại"},state:{},nextAction:"submit"}}));
  await page.route("**/api/v1/challenges/draft/companion",route=>route.fulfill({json:{delivery:"Hãy thử xác định điều kiện trước."}}));
  await page.goto("/practice/draft");
  await page.getByLabel("Đáp án của bạn").fill("x = 2");
  await page.getByLabel("Nhắn Practice Companion").fill("Em chưa biết bắt đầu từ đâu");
  await page.getByRole("button",{name:"Yêu cầu một gợi ý"}).click();
  await expect(page.getByText("Hãy thử xác định điều kiện trước.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Đáp án của bạn")).toHaveValue("x = 2");
});

test("Home provides a concrete retry after a discovery request fails", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/v1/home", (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE", message: "Nội dung chưa sẵn sàng." } } })
      : route.fulfill({ json: { actorId: "actor_demo", subjects: [], nextAction: { kind: "none" }, progress: { hasPracticeEvidence: false, hasIndependentTransferEvidence: false } } });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Chưa tải được lộ trình" })).toBeVisible();
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByRole("heading", { name: "Bạn đã hoàn tất nội dung đang mở" })).toBeVisible();
});

test("Receipt and evidence history render learner-safe server views",async({page})=>{const issuedAt="2026-08-22T17:54:39.000Z";await page.route("**/api/v1/receipts/receipt_demo",route=>route.fulfill({json:{id:"receipt_demo",claim:"Đã áp dụng độc lập trong tình huống mới.",observedConditions:["Hoàn thành bài luyện liên kết.","Hoàn thành tình huống mới."],unknownConditions:["Chưa kiểm tra khả năng ghi nhớ lâu dài."],issuedAt}}));await page.goto("/receipts/receipt_demo");await expect(page.getByRole("heading",{name:"Điều bạn đã thể hiện"})).toBeVisible();await expect(page.getByText("CHƯA ĐƯỢC XÁC LẬP")).toBeVisible();await expect(page.getByText(issuedAt)).toHaveCount(0);await page.route("**/api/v1/progress",route=>route.fulfill({json:{items:[{title:"Phân tích nhân tử",revisionId:"revision_factor",solvedWithSupport:true,demonstratedInChangedSituation:true,delayedEvidenceObserved:false}],nextAction:{kind:"none"}}}));await page.goto("/progress");await expect(page.getByRole("heading",{name:"Đường bằng chứng"})).toBeVisible();await expect(page.getByText("Phân tích nhân tử")).toBeVisible();});
