import {expect,test} from "@playwright/test";

const staffBootstrapSecret=process.env.THINKAI_E2E_STAFF_BOOTSTRAP_SECRET;
const enabled=Boolean(process.env.PLAYWRIGHT_BASE_URL&&staffBootstrapSecret);

test.describe("public Ops lifecycle",()=>{
  test.skip(!enabled,"Requires explicit public base URL and short-lived staff bootstrap secret.");

  test("a presenter completes the real draft-to-deprecation lifecycle in the browser",async({page})=>{
    test.setTimeout(90_000);
    const bootstrap=await page.request.post("/api/v1/demo/staff-session",{headers:{"X-ThinkAI-Staff-Bootstrap":staffBootstrapSecret!},data:{role:"presenter"}});
    expect(bootstrap.status()).toBe(200);
    await page.goto("/ops");
    await page.getByRole("button",{name:/DRAFT/}).first().click();
    await expect(page.locator(".ops-editor-heading").getByText("DRAFT",{exact:true})).toBeVisible();
    await page.getByLabel("MicroSkill",{exact:true}).fill("Technical browser lifecycle");
    await Promise.all([page.waitForResponse(response=>response.request().method()==="PUT"&&response.url().includes("/api/v1/ops/revisions/")&&response.ok()),page.getByRole("button",{name:"Lưu draft"}).click()]);
    await page.reload();
    await page.getByRole("button",{name:/Technical browser lifecycle.*DRAFT/}).click();
    await expect(page.getByLabel("MicroSkill",{exact:true})).toHaveValue("Technical browser lifecycle");
    await page.getByRole("button",{name:"Gửi review"}).click();
    await expect(page.locator(".ops-editor-heading").getByText("IN_REVIEW",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Approve"}).click();
    await expect(page.locator(".ops-editor-heading").getByText("APPROVED",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Publish"}).click();
    await expect(page.locator(".ops-editor-heading").getByText("PUBLISHED",{exact:true})).toBeVisible();
    await expect(page.getByText("Revision bất biến")).toBeVisible();
    await page.getByLabel("ID revision draft mới").fill(`revision_ops_browser_next_${Date.now()}`);
    await page.getByRole("button",{name:"Tạo draft từ revision này"}).click();
    await expect(page.locator(".ops-editor-heading").getByText("DRAFT",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:new RegExp("Technical browser lifecycle")}).nth(1).click();
    page.once("dialog",dialog=>dialog.accept());
    await page.getByRole("button",{name:"Deprecate"}).click();
    await expect(page.locator(".ops-editor-heading").getByText("DEPRECATED",{exact:true})).toBeVisible();
  });
});
