import { expect, test } from "@playwright/test";

test("login page renders without demo accounts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in to your desk" })).toBeVisible();
  await expect(page.getByText("Use the email and password provided by your administrator.")).toBeVisible();
  await expect(page.getByText("Venue Admin Accounts")).toHaveCount(0);
  await expect(page.getByLabel(/email|username/i).or(page.locator("input").first())).toBeVisible();
  expect(errors).toEqual([]);
});
