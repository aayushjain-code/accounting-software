import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Client Management Functional Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/clients");

    // Use the authentication helper to properly handle auth
    await TestHelpers.authenticate(page, "1234");

    // Wait for the clients page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check for the specific auth overlay that's blocking clicks
    const authOverlay = page.locator(
      "div.fixed.inset-0.bg-gradient-to-br.from-blue-600.to-purple-700.flex.items-center.justify-center.z-50"
    );
    if (await authOverlay.isVisible()) {
      console.log("🔍 Found auth overlay, waiting for it to disappear...");
      await authOverlay.waitFor({ state: "hidden", timeout: 10000 });
      await page.waitForTimeout(1000);
    }
  });

  test("should add a new client", async ({ page }) => {
    // Click add client button
    await page.click("text=Add Client");

    // Fill in client form using specific label text to avoid ambiguity
    const clientNameLabel = page.locator('label:has-text("Client Name *")');
    const clientNameInput = clientNameLabel.locator(
      "xpath=following::input[1]"
    );
    await clientNameInput.fill("Test Client");

    const companyLabel = page.locator('label:has-text("Company *")');
    const companyInput = companyLabel.locator("xpath=following::input[1]");
    await companyInput.fill("Test Company");

    const emailLabel = page.locator('label:has-text("Email *")');
    const emailInput = emailLabel.locator("xpath=following::input[1]");
    await emailInput.fill("test@example.com");

    const phoneLabel = page.locator('label:has-text("Phone")');
    const phoneInput = phoneLabel.locator("xpath=following::input[1]");
    await phoneInput.fill("+1234567890");

    const industryLabel = page.locator('label:has-text("Industry")');
    const industryInput = industryLabel.locator("xpath=following::input[1]");
    await industryInput.fill("Technology");

    // Skip select dropdowns for now - focus on basic form submission
    console.log(
      "⏭️ Skipping select dropdowns to focus on basic form submission"
    );

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
