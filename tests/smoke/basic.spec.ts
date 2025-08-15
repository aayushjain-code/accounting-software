import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("should load the application", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Verify the page loads
    await expect(page).toHaveTitle(/BST Accounting|Accounting Software/);

    // Check if main content is visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle authentication flow", async ({ page }) => {
    await page.goto("/");

    // Check if authentication overlay is present
    const authOverlay = page.locator('[data-testid="auth-overlay"]');

    if (await authOverlay.isVisible()) {
      // Test authentication
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');

      // Wait for authentication to complete
      await page.waitForLoadState("networkidle");

      // Verify we're past authentication
      await expect(authOverlay).not.toBeVisible();
    } else {
      // If no authentication needed, verify we can see main content
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    }
  });

  test("should have basic navigation elements", async ({ page }) => {
    await page.goto("/");

    // Handle authentication if needed
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }

    // Check for basic navigation elements
    const hasNavigation = await page
      .locator('nav, [role="navigation"]')
      .isVisible();
    const hasMainContent = await page
      .locator('main, [role="main"]')
      .isVisible();

    expect(hasNavigation || hasMainContent).toBeTruthy();
  });

  test("should be responsive", async ({ page }) => {
    await page.goto("/");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("body")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("body")).toBeVisible();
  });
});
