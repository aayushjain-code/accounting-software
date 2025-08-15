import { Page, expect } from "@playwright/test";

export class TestHelpers {
  /**
   * Authenticate user with PIN
   */
  static async authenticate(page: Page, pin: string = "1234"): Promise<void> {
    // Check if auth overlay is present - target the actual overlay class
    const authOverlay = page.locator(
      "div.fixed.inset-0.bg-gradient-to-br.from-blue-600.to-purple-700.flex.items-center.justify-center.z-50"
    );

    try {
      // Wait a bit for page to load
      await page.waitForTimeout(1000);

      // Check if auth overlay is visible
      if (await authOverlay.isVisible()) {
        console.log("🔐 Auth overlay found, authenticating...");

        // Wait a bit for overlay to fully render
        await page.waitForTimeout(1000);

        // Fill in PIN - use more specific selector
        const pinInput = page.locator(
          'input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"], [data-testid="pin-input"]'
        );
        await pinInput.waitFor({ state: "visible", timeout: 10000 });
        await pinInput.fill(pin);

        // Submit PIN - use more specific selector
        const submitButton = page.locator(
          'button[type="submit"], button:has-text("Submit"), button:has-text("Login"), [data-testid="pin-submit"]'
        );
        await submitButton.waitFor({ state: "visible", timeout: 10000 });
        await submitButton.click();

        // Wait for auth overlay to disappear
        await authOverlay.waitFor({ state: "hidden", timeout: 15000 });

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // Additional wait to ensure auth is complete
        await page.waitForTimeout(2000);

        console.log("✅ Authentication completed");
      } else {
        console.log(
          "ℹ️ No auth overlay found - already authenticated or not required"
        );
      }
    } catch (error) {
      console.log("Auth overlay not found or already authenticated:", error);
    }
  }

  /**
   * Navigate to a specific section
   */
  static async navigateToSection(page: Page, section: string): Promise<void> {
    // First ensure we're authenticated
    await this.authenticate(page);

    // Wait for navigation to be ready
    await page.waitForLoadState("networkidle");

    // Try to find the navigation link - be more specific
    const navLink = page.locator(`a[href*="${section.toLowerCase()}"]`).first();

    // Wait for navigation to be visible and clickable
    await navLink.waitFor({ state: "visible", timeout: 10000 });

    // Ensure element is not covered by overlay
    await page.waitForTimeout(1000);

    // Click the navigation link
    await navLink.click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  }

  /**
   * Wait for toast message to appear
   */
  static async waitForToast(page: Page, message: string): Promise<void> {
    await expect(page.locator(`text=${message}`)).toBeVisible();
  }

  /**
   * Fill form fields from an object
   */
  static async fillForm(
    page: Page,
    formData: Record<string, string>
  ): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
      const selector = this.getFieldSelector(field);
      if (selector) {
        await page.fill(selector, value);
      }
    }
  }

  /**
   * Get field selector based on field name
   */
  private static getFieldSelector(field: string): string | null {
    const selectors: Record<string, string> = {
      name: 'input[placeholder*="name"], input[name="name"]',
      email: 'input[type="email"], input[name="email"]',
      phone: 'input[type="tel"], input[name="phone"]',
      company: 'input[placeholder*="company"], input[name="company"]',
      address: 'input[name="address"], textarea[name="address"]',
      description: 'textarea[name="description"]',
      amount: 'input[name="amount"], input[type="number"]',
      quantity: 'input[name="quantity"], input[type="number"]',
      unitPrice: 'input[name="unitPrice"], input[name="price"]',
    };

    return selectors[field] || null;
  }

  /**
   * Select option from dropdown
   */
  static async selectOption(
    page: Page,
    field: string,
    value: string
  ): Promise<void> {
    const selector = `select[name="${field}"], select[data-testid="${field}"]`;
    await page.selectOption(selector, value);
  }

  /**
   * Click button by text or test ID
   */
  static async clickButton(page: Page, identifier: string): Promise<void> {
    // Try by text first
    try {
      await page.click(`text=${identifier}`);
    } catch {
      // Try by test ID
      await page.click(`[data-testid="${identifier}"]`);
    }
  }

  /**
   * Verify element is visible
   */
  static async verifyVisible(page: Page, identifier: string): Promise<void> {
    await expect(page.locator(`[data-testid="${identifier}"]`)).toBeVisible();
  }

  /**
   * Verify element is not visible
   */
  static async verifyNotVisible(page: Page, identifier: string): Promise<void> {
    await expect(
      page.locator(`[data-testid="${identifier}"]`)
    ).not.toBeVisible();
  }

  /**
   * Wait for page to load completely
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState("domcontentloaded");
  }

  /**
   * Take screenshot for debugging
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Generate test data
   */
  static generateTestData(type: "client" | "project" | "invoice" | "expense") {
    const baseData = {
      client: {
        name: `Test Client ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        company: `Test Company ${Date.now()}`,
        phone: "+1234567890",
        industry: "Technology",
        companySize: "small",
        status: "active",
      },
      project: {
        name: `Test Project ${Date.now()}`,
        description: `Test project description ${Date.now()}`,
        budget: "10000",
        billingRate: "100",
        estimatedHours: "80",
        gstRate: "18",
      },
      invoice: {
        issueDate: "2024-12-01",
        dueDate: "2024-12-31",
        poNumber: `PO-${Date.now()}`,
        deliveryNote: `Test delivery note ${Date.now()}`,
        paymentTerms: "Net 30",
      },
      expense: {
        description: `Test expense ${Date.now()}`,
        amount: "500",
        category: "Travel",
        date: "2024-12-01",
        notes: `Test expense notes ${Date.now()}`,
      },
    };

    return baseData[type];
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(page: Page, type: string): Promise<void> {
    // Navigate to the appropriate section
    await this.navigateToSection(
      page,
      type.charAt(0).toUpperCase() + type.slice(1) + "s"
    );

    // Delete test items (this is a simplified version)
    const deleteButtons = page.locator('button[aria-label*="Delete"]');
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
      try {
        await deleteButtons.first().click();
        await this.clickButton(page, "Delete");
        await this.waitForToast(page, "deleted successfully");
      } catch (error) {
        console.log("Error during cleanup:", error);
      }
    }
  }
}
