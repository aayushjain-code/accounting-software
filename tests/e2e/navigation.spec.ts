import { test, expect } from "@playwright/test";

test.describe("Navigation E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto("/");

    // Handle authentication if needed
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }
  });

  test("should navigate to all main sections", async ({ page }) => {
    // Test navigation to Clients
    await page.click("text=Clients");
    await expect(page).toHaveURL(/.*clients/);
    await expect(page.locator("h1")).toContainText("Clients");

    // Test navigation to Projects
    await page.click("text=Projects");
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.locator("h1")).toContainText("Projects");

    // Test navigation to Timesheets
    await page.click("text=Timesheets");
    await expect(page).toHaveURL(/.*timesheets/);
    await expect(page.locator("h1")).toContainText("Timesheets");

    // Test navigation to Invoices
    await page.click("text=Invoices");
    await expect(page).toHaveURL(/.*invoices/);
    await expect(page.locator("h1")).toContainText("Invoices");

    // Test navigation to Expenses
    await page.click("text=Expenses");
    await expect(page).toHaveURL(/.*expenses/);
    await expect(page.locator("h1")).toContainText("Expenses");

    // Test navigation to Daily Logs
    await page.click("text=Daily Logs");
    await expect(page).toHaveURL(/.*daily-logs/);
    await expect(page.locator("h1")).toContainText("Daily Logs");

    // Test navigation to Reports
    await page.click("text=Reports");
    await expect(page).toHaveURL(/.*reports/);
    await expect(page.locator("h1")).toContainText("Reports");

    // Test navigation to Storage
    await page.click("text=Storage");
    await expect(page).toHaveURL(/.*storage/);
    await expect(page.locator("h1")).toContainText("Storage");

    // Test navigation to Profile
    await page.click("text=Profile");
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator("h1")).toContainText("Profile");
  });

  test("should maintain navigation state", async ({ page }) => {
    // Navigate to Clients
    await page.click("text=Clients");
    await expect(page).toHaveURL(/.*clients/);

    // Refresh the page
    await page.reload();

    // Should still be on Clients page
    await expect(page).toHaveURL(/.*clients/);
    await expect(page.locator("h1")).toContainText("Clients");
  });

  test("should handle mobile navigation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu is accessible
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Verify mobile menu items are visible
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Test navigation from mobile menu
      await page.click('[data-testid="mobile-menu"] >> text=Clients');
      await expect(page).toHaveURL(/.*clients/);
    }
  });
});
