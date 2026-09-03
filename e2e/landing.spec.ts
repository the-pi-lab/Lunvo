import { test, expect } from "@playwright/test";

test("landing page loads with hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter|Dashboard|GitHub/i }).first()).toBeVisible();
});

test("dashboard loads in local mode (no login route)", async ({ page }) => {
  await page.goto("/dashboard");
  // Self-host local-first: no /login route, dashboard renders directly
  await expect(page).toHaveURL(/.*dashboard.*/);
});
