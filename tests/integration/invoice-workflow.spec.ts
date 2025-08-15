import { test, expect } from "@playwright/test";

test.describe("Invoice Workflow Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Handle authentication if needed
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }
  });

  test("should complete full invoice workflow from timesheet to invoice", async ({
    page,
  }) => {
    // Step 1: Navigate to Timesheets
    await page.click("text=Timesheets");
    await expect(page).toHaveURL(/.*timesheets/);

    // Step 2: Create a new timesheet
    await page.click("text=Add Timesheet");

    // Fill timesheet form
    await page.selectOption('select[name="projectId"]', "1"); // Select first project
    await page.fill('input[name="month"]', "2024-12");
    await page.fill('input[name="year"]', "2024");
    await page.fill('input[name="daysWorked"]', "22");
    await page.fill('input[name="hoursPerDay"]', "8");

    // Submit timesheet
    await page.click('button[type="submit"]');

    // Verify timesheet created
    await expect(
      page.locator("text=Timesheet created successfully")
    ).toBeVisible();

    // Step 3: Navigate to Invoices
    await page.click("text=Invoices");
    await expect(page).toHaveURL(/.*invoices/);

    // Step 4: Create invoice from timesheet
    await page.click("text=Create Invoice");

    // Select timesheet
    await page.selectOption('select[name="timesheetId"]', "1"); // Select the timesheet we just created

    // Fill invoice details
    await page.fill('input[name="issueDate"]', "2024-12-01");
    await page.fill('input[name="dueDate"]', "2024-12-31");
    await page.fill('input[name="poNumber"]', "PO-2024-001");

    // Add invoice items
    await page.click("text=Add Item");
    await page.fill('input[name="title"]', "Development Services");
    await page.fill(
      'input[name="description"]',
      "Software development for December 2024"
    );
    await page.fill('input[name="quantity"]', "176"); // 22 days * 8 hours
    await page.fill('input[name="unitPrice"]', "100");
    await page.fill('input[name="hsnCode"]', "998314");
    await page.selectOption('select[name="unit"]', "hours");

    // Submit invoice
    await page.click('button[type="submit"]');

    // Verify invoice created
    await expect(
      page.locator("text=Invoice created successfully")
    ).toBeVisible();

    // Step 5: Verify invoice details
    await expect(page.locator("text=Development Services")).toBeVisible();
    await expect(page.locator("text=PO-2024-001")).toBeVisible();

    // Step 6: Generate PDF
    await page.click("text=Download PDF");

    // Verify PDF generation (this might download a file)
    await expect(page.locator("text=PDF generated successfully")).toBeVisible();
  });

  test("should handle invoice approval workflow", async ({ page }) => {
    // Navigate to Invoices
    await page.click("text=Invoices");

    // Find an invoice and change status
    const statusSelect = page.locator('select[name="status"]').first();
    await statusSelect.selectOption("sent");

    // Verify status change
    await expect(
      page.locator("text=Invoice updated successfully")
    ).toBeVisible();

    // Change to paid status
    await statusSelect.selectOption("paid");
    await expect(
      page.locator("text=Invoice updated successfully")
    ).toBeVisible();
  });

  test("should calculate taxes correctly", async ({ page }) => {
    // Navigate to Invoices
    await page.click("text=Invoices");

    // Create a new invoice
    await page.click("text=Create Invoice");

    // Fill basic details
    await page.selectOption('select[name="clientId"]', "1");
    await page.selectOption('select[name="projectId"]', "1");
    await page.fill('input[name="issueDate"]', "2024-12-01");
    await page.fill('input[name="dueDate"]', "2024-12-31");

    // Add item with specific amount
    await page.click("text=Add Item");
    await page.fill('input[name="title"]', "Test Service");
    await page.fill('input[name="quantity"]', "1");
    await page.fill('input[name="unitPrice"]', "1000");
    await page.fill('input[name="hsnCode"]', "998314");

    // Verify tax calculations
    const subtotal = page.locator('[data-testid="subtotal"]');
    const taxAmount = page.locator('[data-testid="tax-amount"]');
    const total = page.locator('[data-testid="total"]');

    await expect(subtotal).toContainText("₹1,000.00");
    await expect(taxAmount).toContainText("₹180.00"); // 18% GST
    await expect(total).toContainText("₹1,180.00");
  });

  test("should handle different tax types", async ({ page }) => {
    // Navigate to Invoices
    await page.click("text=Invoices");

    // Create a new invoice
    await page.click("text=Create Invoice");

    // Test IGST (Inter-state)
    await page.selectOption('select[name="taxType"]', "igst");
    await page.selectOption('select[name="clientId"]', "1");
    await page.selectOption('select[name="projectId"]', "1");

    // Add item
    await page.click("text=Add Item");
    await page.fill('input[name="title"]', "IGST Service");
    await page.fill('input[name="quantity"]', "1");
    await page.fill('input[name="unitPrice"]', "1000");

    // Verify IGST calculation (18% IGST)
    await expect(page.locator('[data-testid="tax-amount"]')).toContainText(
      "₹180.00"
    );

    // Test SGST+CGST (Intra-state)
    await page.selectOption('select[name="taxType"]', "sgst-cgst");

    // Verify SGST+CGST calculation (9% + 9% = 18%)
    await expect(page.locator('[data-testid="sgst-amount"]')).toContainText(
      "₹90.00"
    );
    await expect(page.locator('[data-testid="cgst-amount"]')).toContainText(
      "₹90.00"
    );
  });

  test("should export invoice data", async ({ page }) => {
    // Navigate to Invoices
    await page.click("text=Invoices");

    // Click export button
    await page.click("text=Export");

    // Select export format
    await page.click("text=Export as CSV");

    // Verify export success
    await expect(
      page.locator("text=Export completed successfully")
    ).toBeVisible();
  });
});
