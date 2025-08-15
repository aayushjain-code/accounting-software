import { test, expect } from "@playwright/test";

test.describe("Client Management Functional Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/clients");

    // Handle authentication if needed
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }
  });

  test("should add a new client", async ({ page }) => {
    // Click add client button
    await page.click("text=Add Client");

    // Fill in client form
    await page.fill('input[placeholder*="name"]', "Test Client");
    await page.fill('input[placeholder*="company"]', "Test Company");
    await page.fill('input[placeholder*="email"]', "test@example.com");
    await page.fill('input[placeholder*="phone"]', "+1234567890");
    await page.fill('input[placeholder*="industry"]', "Technology");

    // Select company size and status
    await page.selectOption('select[name="companySize"]', "small");
    await page.selectOption('select[name="status"]', "active");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator("text=Client added successfully")).toBeVisible();

    // Verify client appears in list
    await expect(page.locator("text=Test Client")).toBeVisible();
    await expect(page.locator("text=Test Company")).toBeVisible();
  });

  test("should edit an existing client", async ({ page }) => {
    // Find and click edit button for first client
    const editButton = page.locator('button[aria-label*="Edit"]').first();
    await editButton.click();

    // Update client information
    await page.fill('input[placeholder*="name"]', "Updated Client Name");
    await page.fill('input[placeholder*="company"]', "Updated Company");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(
      page.locator("text=Client updated successfully")
    ).toBeVisible();

    // Verify changes are reflected
    await expect(page.locator("text=Updated Client Name")).toBeVisible();
    await expect(page.locator("text=Updated Company")).toBeVisible();
  });

  test("should delete a client", async ({ page }) => {
    // Get initial client count
    const initialClientCount = await page
      .locator('[data-testid="client-card"]')
      .count();

    // Find and click delete button for first client
    const deleteButton = page.locator('button[aria-label*="Delete"]').first();
    await deleteButton.click();

    // Confirm deletion
    await page.click("text=Delete");

    // Verify success message
    await expect(
      page.locator("text=Client deleted successfully")
    ).toBeVisible();

    // Verify client count decreased
    const finalClientCount = await page
      .locator('[data-testid="client-card"]')
      .count();
    expect(finalClientCount).toBe(initialClientCount - 1);
  });

  test("should search and filter clients", async ({ page }) => {
    // Test search functionality
    await page.fill('input[placeholder*="Search clients"]', "Test");
    await page.waitForTimeout(500); // Wait for search to complete

    // Verify search results
    const searchResults = page.locator('[data-testid="client-card"]');
    await expect(searchResults).toHaveCount(1);

    // Test status filter
    await page.selectOption('select[value="all"]', "active");
    await page.waitForTimeout(500);

    // Verify filter results
    const filteredResults = page.locator('[data-testid="client-card"]');
    await expect(filteredResults).toBeVisible();
  });

  test("should view client details", async ({ page }) => {
    // Find and click view button for first client
    const viewButton = page.locator('button[aria-label*="View"]').first();
    await viewButton.click();

    // Verify client details modal is visible
    await expect(
      page.locator('[data-testid="client-view-modal"]')
    ).toBeVisible();

    // Verify client information is displayed
    await expect(page.locator('[data-testid="client-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-company"]')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Close"]');

    // Verify modal is closed
    await expect(
      page.locator('[data-testid="client-view-modal"]')
    ).not.toBeVisible();
  });

  test("should handle form validation", async ({ page }) => {
    // Click add client button
    await page.click("text=Add Client");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Company is required")).toBeVisible();

    // Fill required fields
    await page.fill('input[placeholder*="name"]', "Test Client");
    await page.fill('input[placeholder*="email"]', "test@example.com");
    await page.fill('input[placeholder*="company"]', "Test Company");

    // Submit form again
    await page.click('button[type="submit"]');

    // Verify no validation errors
    await expect(page.locator("text=Name is required")).not.toBeVisible();
    await expect(page.locator("text=Email is required")).not.toBeVisible();
    await expect(page.locator("text=Company is required")).not.toBeVisible();
  });

  test("should toggle between card and table view", async ({ page }) => {
    // Check default view (cards)
    await expect(page.locator('[data-testid="client-card"]')).toBeVisible();

    // Switch to table view
    await page.click('[data-testid="view-toggle"] >> text=Table');

    // Verify table view is displayed
    await expect(page.locator('[data-testid="clients-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-card"]')).not.toBeVisible();

    // Switch back to card view
    await page.click('[data-testid="view-toggle"] >> text=Cards');

    // Verify card view is displayed
    await expect(page.locator('[data-testid="client-card"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="clients-table"]')
    ).not.toBeVisible();
  });
});
