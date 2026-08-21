import {test,expect} from "@playwright/test";

test("learner home starts with the current learning shell instead of Transfer content",async({page})=>{
  const errors:string[]=[];
  page.on("console",m=>{if(m.type()==="error"&&!m.text().includes("favicon.ico"))errors.push(m.text())});
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Học theo cách có thể nhìn lại."})).toBeVisible();
  await expect(page.getByRole("link",{name:"Học",exact:true})).toBeVisible();
  await expect(page.getByText("Không có Companion hoặc dữ liệu Bài luyện ở đây.")).toHaveCount(0);
  expect(errors).toEqual([]);
});
