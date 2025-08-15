import { test } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Client Form Inspection", () => {
  test("should inspect Add Client form fields", async ({ page }) => {
    // Navigate to clients page
    await page.goto("/clients");

    // Authenticate if needed
    await TestHelpers.authenticate(page, "1234");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Click Add Client button
    const addClientButton = page.locator("button:has-text('Add Client')");
    await addClientButton.waitFor({ state: "visible" });
    await addClientButton.click();

    // Wait for form to appear
    await page.waitForTimeout(2000);

    // Take a screenshot for debugging
    await page.screenshot({ path: "client-form-debug.png", fullPage: true });

    console.log("🔍 Inspecting Add Client form...");

    // Check for any modal or form container
    const modal = page.locator(
      '[role="dialog"], .modal, .form-container, [class*="modal"], [class*="form"]'
    );
    const modalCount = await modal.count();
    console.log(`📋 Found ${modalCount} modal/form containers`);

    // Check for any input fields
    const inputs = page.locator("input, textarea, select");
    const inputCount = await inputs.count();
    console.log(`⌨️ Found ${inputCount} input fields`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute("type");
      const placeholder = await input.getAttribute("placeholder");
      const name = await input.getAttribute("name");
      const id = await input.getAttribute("id");
      const className = await input.getAttribute("class");
      const value = await input.getAttribute("value");

      console.log(`  Input ${i + 1}:`);
      console.log(`    type="${type}"`);
      console.log(`    placeholder="${placeholder}"`);
      console.log(`    name="${name}"`);
      console.log(`    id="${id}"`);
      console.log(`    class="${className}"`);
      console.log(`    value="${value}"`);
    }

    // Check for any labels
    const labels = page.locator("label");
    const labelCount = await labels.count();
    console.log(`🏷️ Found ${labelCount} labels`);

    for (let i = 0; i < Math.min(labelCount, 10); i++) {
      const text = await labels.nth(i).textContent();
      const forAttr = await labels.nth(i).getAttribute("for");
      console.log(`  Label ${i + 1}: "${text}" (for: "${forAttr}")`);
    }

    // Check for any buttons in the form
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log(`🔘 Found ${buttonCount} buttons`);

    for (let i = 0; i < buttonCount; i++) {
      const text = await buttons.nth(i).textContent();
      const type = await buttons.nth(i).getAttribute("type");
      console.log(`  Button ${i + 1}: "${text}" (type: "${type}")`);
    }

    // Check for any text content that might indicate field names
    const formText = page.locator(
      "text=/name|company|email|phone|industry|address|contact/i"
    );
    const formTextCount = await formText.count();
    console.log(`📝 Found ${formTextCount} elements with form-related text`);

    // Check page URL to see if we're on a different page
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Final verification - form should be visible
    if (inputCount > 0) {
      console.log("✅ Form fields found and visible");
    } else {
      console.log("❌ No form fields found");
    }
  });
});
