import {test,expect} from "@playwright/test";

test("foundation routes preserve the intended learner and operations shells",async({page})=>{
  await page.goto("/learn");
  await expect(page.getByRole("heading",{name:"Lộ trình đang học"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Khám phá môn học"})).toBeVisible();

  await page.goto("/practice/demo");
  await expect(page.getByRole("heading",{name:"Bài luyện",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Gửi bài làm"})).toBeDisabled();
  await expect(page.getByRole("button",{name:"Đang xử lý…"})).toBeDisabled();

  await page.goto("/transfer/demo");
  await expect(page.getByRole("heading",{name:"Thử vận dụng"})).toBeVisible();
  await expect(page.getByText("Không có Companion hoặc dữ liệu Bài luyện ở đây.")).toBeVisible();

  await page.goto("/ops");
  await expect(page.getByRole("heading",{name:"Content Studio"})).toBeVisible();
});
