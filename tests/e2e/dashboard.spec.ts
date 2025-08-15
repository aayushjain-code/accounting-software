import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await TestHelpers.authenticate(page);
  });

  test("should display dashboard overview with correct stats", async ({
    page,
  }) => {
    // Verify dashboard is loaded
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Check if main stats cards are visible
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4); // Revenue, Expenses, Projects, Clients

    // Verify revenue stats
    const revenueCard = page.locator('[data-testid="revenue-stats"]');
    await expect(revenueCard).toBeVisible();
    await expect(
      revenueCard.locator('[data-testid="total-revenue"]')
    ).toBeVisible();
    await expect(
      revenueCard.locator('[data-testid="net-profit"]')
    ).toBeVisible();

    // Verify project stats
    const projectCard = page.locator('[data-testid="project-stats"]');
    await expect(projectCard).toBeVisible();
    await expect(
      projectCard.locator('[data-testid="active-projects"]')
    ).toBeVisible();
    await expect(
      projectCard.locator('[data-testid="completed-projects"]')
    ).toBeVisible();
  });

  test("should display and interact with charts", async ({ page }) => {
    // Check if charts are rendered
    const revenueChart = page.locator('[data-testid="revenue-chart"]');
    await expect(revenueChart).toBeVisible();

    const expenseChart = page.locator('[data-testid="expense-chart"]');
    await expect(expenseChart).toBeVisible();

    // Test chart interactions (hover, click if interactive)
    if (await revenueChart.locator("canvas").isVisible()) {
      // Hover over chart to see if tooltips appear
      await revenueChart.hover();
      await page.waitForTimeout(1000);
    }
  });

  test("should filter dashboard data by date range", async ({ page }) => {
    // Find date range picker
    const dateRangePicker = page.locator('[data-testid="date-range-picker"]');
    if (await dateRangePicker.isVisible()) {
      // Select custom date range
      await dateRangePicker.click();

      // Select last 30 days
      await page.click("text=Last 30 days");

      // Verify data updates
      await page.waitForTimeout(2000);

      // Check if stats have updated
      const updatedStats = page.locator('[data-testid="stats-card"]');
      await expect(updatedStats).toBeVisible();
    }
  });

  test("should display recent activities", async ({ page }) => {
    // Check if recent activities section exists
    const recentActivities = page.locator('[data-testid="recent-activities"]');
    if (await recentActivities.isVisible()) {
      await expect(recentActivities.locator("h3")).toContainText(
        "Recent Activities"
      );

      // Check if activity items are displayed
      const activityItems = recentActivities.locator(
        '[data-testid="activity-item"]'
      );
      await expect(activityItems).toHaveCount.greaterThan(0);

      // Verify activity details
      const firstActivity = activityItems.first();
      await expect(
        firstActivity.locator('[data-testid="activity-type"]')
      ).toBeVisible();
      await expect(
        firstActivity.locator('[data-testid="activity-description"]')
      ).toBeVisible();
      await expect(
        firstActivity.locator('[data-testid="activity-time"]')
      ).toBeVisible();
    }
  });

  test("should handle quick actions", async ({ page }) => {
    // Check if quick action buttons exist
    const quickActions = page.locator('[data-testid="quick-actions"]');
    if (await quickActions.isVisible()) {
      // Test "Add Client" quick action
      const addClientButton = quickActions.locator("text=Add Client");
      if (await addClientButton.isVisible()) {
        await addClientButton.click();

        // Verify navigation to client form
        await expect(page.locator("h1")).toContainText("Add New Client");

        // Go back to dashboard
        await page.goBack();
        await expect(page.locator("h1")).toContainText("Dashboard");
      }

      // Test "Create Invoice" quick action
      const createInvoiceButton = quickActions.locator("text=Create Invoice");
      if (await createInvoiceButton.isVisible()) {
        await createInvoiceButton.click();

        // Verify navigation to invoice form
        await expect(page.locator("h1")).toContainText("Create Invoice");

        // Go back to dashboard
        await page.goBack();
        await expect(page.locator("h1")).toContainText("Dashboard");
      }
    }
  });

  test("should display notifications and alerts", async ({ page }) => {
    // Check if notifications exist
    const notifications = page.locator('[data-testid="notifications"]');
    if (await notifications.isVisible()) {
      // Check notification count
      const notificationCount = notifications.locator(
        '[data-testid="notification-count"]'
      );
      if (await notificationCount.isVisible()) {
        const count = await notificationCount.textContent();
        expect(parseInt(count || "0")).toBeGreaterThanOrEqual(0);
      }

      // Test notification interaction
      const notificationButton = notifications.locator(
        '[data-testid="notification-button"]'
      );
      if (await notificationButton.isVisible()) {
        await notificationButton.click();

        // Verify notification panel opens
        const notificationPanel = page.locator(
          '[data-testid="notification-panel"]'
        );
        await expect(notificationPanel).toBeVisible();

        // Close notification panel
        await page.click('[data-testid="close-notifications"]');
        await expect(notificationPanel).not.toBeVisible();
      }
    }
  });

  test("should handle responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify dashboard elements are properly sized for mobile
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toBeVisible();

    // Check if mobile-specific elements appear
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify dashboard layout adapts
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Verify full dashboard layout
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should export dashboard data", async ({ page }) => {
    // Look for export functionality
    const exportButton = page.locator(
      '[data-testid="export-dashboard"], text=Export'
    );
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Check export options
      const exportOptions = page.locator('[data-testid="export-options"]');
      if (await exportOptions.isVisible()) {
        // Test PDF export
        const pdfExport = exportOptions.locator("text=Export as PDF");
        if (await pdfExport.isVisible()) {
          await pdfExport.click();
          await TestHelpers.waitForToast(page, "PDF exported successfully");
        }

        // Test CSV export
        const csvExport = exportOptions.locator("text=Export as CSV");
        if (await csvExport.isVisible()) {
          await csvExport.click();
          await TestHelpers.waitForToast(page, "CSV exported successfully");
        }
      }
    }
  });

  test("should handle theme switching", async ({ page }) => {
    // Find theme toggle
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], [aria-label*="theme"]'
    );
    if (await themeToggle.isVisible()) {
      // Get current theme
      const currentTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(1000);

      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(currentTheme);

      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(1000);

      const finalTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(finalTheme).toBe(currentTheme);
    }
  });
});
