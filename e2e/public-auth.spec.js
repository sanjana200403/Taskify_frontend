import { expect, test } from "@playwright/test";

test("Get Started opens login by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Manage What To Do" })).toBeVisible();
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("registration form remains usable at a mobile viewport", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  const password = page.locator("#auth-password");
  await expect(password).toBeVisible();
  await expect(password).toHaveAccessibleName("Password");
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});
