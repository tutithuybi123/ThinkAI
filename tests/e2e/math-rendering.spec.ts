import { expect, test } from "@playwright/test";

test("Practice renders trusted Markdown math but never injects untrusted HTML", async ({ page }) => {
  await page.route("**/api/v1/challenges/math", (route) => route.fulfill({ json: {
    sessionId: "math", context: { label: "Bài luyện" },
    task: { prompt: { body: "Với \\(x^2-5x+6\\), xét $x_1 < x < x_2$.\n\n\\[f(x)=\\frac{a}{b}\\sqrt{x}\\]" }, input: "text" },
    progress: { ordinal: 1, label: "Bài luyện hiện tại" }, state: {}, nextAction: "submit",
  }}));
  await page.route("**/api/v1/challenges/math/companion", (route) => route.fulfill({ json: { delivery: "Thử xác định \\(\\Delta\\) trước. <script>window.__xss = true</script>" } }));
  await page.goto("/practice/math");
  await expect(page.locator(".katex-display")).toHaveCount(1);
  await expect(page.locator(".katex")).toHaveCount(3);
  await page.getByLabel("Nhắn Practice Companion").fill("Em bắt đầu thế nào?");
  await page.getByRole("button", { name: "Yêu cầu một gợi ý" }).click();
  await expect(page.locator(".feedback-surface .katex")).toHaveCount(1);
  await expect(page.locator(".feedback-surface script")).toHaveCount(0);
  await expect(page.locator(".feedback-surface img")).toHaveCount(0);
});

test("malformed math stays readable and cannot create horizontal page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/v1/challenges/math-safe", (route) => route.fulfill({ json: {
    sessionId: "math-safe", context: { label: "Bài luyện" },
    task: { prompt: { body: "Kiểm tra \\(\\frac{a}{\\) và \\[x^2+x^2+x^2+x^2+x^2+x^2+x^2+x^2+x^2\\]" }, input: "text" },
    progress: { ordinal: 1, label: "Bài luyện hiện tại" }, state: {}, nextAction: "submit",
  }}));
  await page.goto("/practice/math-safe");
  await expect(page.getByText(/\\frac/)).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
