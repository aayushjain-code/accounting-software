import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Clients Page Inspection", () => {
  test("should inspect clients page content", async ({ page }) => {
    // Navigate to clients page
    await page.goto("/clients");

    // Authenticate if needed
    await TestHelpers.authenticate(page, "1234");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Take a screenshot for debugging
    await page.screenshot({ path: "clients-page-debug.png", fullPage: true });

    // Check what's actually on the page
    console.log("🔍 Inspecting clients page...");

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for any headings
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    console.log(`📝 Found ${headingCount} headings`);

    for (let i = 0; i < Math.min(headingCount, 5); i++) {
      const text = await headings.nth(i).textContent();
      console.log(`  Heading ${i + 1}: ${text}`);
    }

    // Check for buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log(`🔘 Found ${buttonCount} buttons`);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute("aria-label");
      console.log(`  Button ${i + 1}: "${text}" (aria-label: "${ariaLabel}")`);
    }

    // Check for forms
    const forms = page.locator("form");
    const formCount = await forms.count();
    console.log(`📋 Found ${formCount} forms`);

    // Check for input fields
    const inputs = page.locator("input, textarea, select");
    const inputCount = await inputs.count();
    console.log(`⌨️ Found ${inputCount} input fields`);

    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const type = await inputs.nth(i).getAttribute("type");
      const placeholder = await inputs.nth(i).getAttribute("placeholder");
      const name = await inputs.nth(i).getAttribute("name");
      console.log(
        `  Input ${i + 1}: type="${type}", placeholder="${placeholder}", name="${name}"`
      );
    }

    // Check for client-related elements
    const clientCards = page.locator('[data-testid="client-card"]');
    const clientCardsCount = await clientCards.count();
    console.log(`🃏 Found ${clientCardsCount} client cards`);

    const clientTables = page.locator("table");
    const clientTablesCount = await clientTables.count();
    console.log(`📊 Found ${clientTablesCount} tables`);

    // Check for any text containing "client"
    const clientText = page.locator("text=/client/i");
    const clientTextCount = await clientText.count();
    console.log(`🔍 Found ${clientTextCount} elements with "client" text`);

    // Check page URL
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Check for any error messages
    const errors = page.locator("text=/error|Error|ERROR/");
    const errorCount = await errors.count();
    console.log(`❌ Found ${errorCount} error messages`);

    // Check for any loading states
    const loading = page.locator("text=/loading|Loading|LOADING/");
    const loadingCount = await loading.count();
    console.log(`⏳ Found ${loadingCount} loading messages`);

    // Final verification - page should be visible
    await expect(page.locator("body")).toBeVisible();
    console.log("✅ Page body is visible");
  });
});
