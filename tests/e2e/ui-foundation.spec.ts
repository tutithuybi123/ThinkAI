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

  await page.goto("/transfer/demo");
  await expect(page.getByRole("heading",{name:"Thử vận dụng"})).toBeVisible();
  await expect(page.getByText("Không có Companion hoặc dữ liệu Bài luyện ở đây.")).toBeVisible();

  await page.goto("/ops");
  await expect(page.getByRole("heading",{name:"Content Studio"})).toBeVisible();
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
