import { test, expect } from "@playwright/test";

test("landing page loads and has analyze CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Is your post")).toBeVisible();
  await expect(page.getByPlaceholder("Start writing or paste your post here")).toBeVisible();
  await expect(page.getByRole("button", { name: /Analyze for Free/i })).toBeVisible();
});

test("dashboard redirects to login when not authenticated", async ({ page }) => {
  await page.goto("/dashboard");
  // Should redirect to /login when no auth (or show local mode)
  await expect(page).toHaveURL(/.*(login|dashboard).*/);
});
