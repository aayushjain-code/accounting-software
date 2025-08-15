import { Page, expect } from "@playwright/test";

export class TestHelpers {
  /**
   * Authenticate user with PIN
   */
  static async authenticate(page: Page, pin: string = "1234"): Promise<void> {
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      await page.fill('[data-testid="pin-input"]', pin);
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }
  }

  /**
   * Navigate to a specific section
   */
  static async navigateToSection(page: Page, section: string): Promise<void> {
    await page.click(`text=${section}`);
    await page.waitForLoadState("networkidle");
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
