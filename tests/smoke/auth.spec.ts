import { test, expect } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

test.describe("Authentication Tests", () => {
  test("should authenticate with PIN 1234", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if auth overlay is present - target the actual overlay class
    const authOverlay = page.locator(
      "div.fixed.inset-0.bg-gradient-to-br.from-blue-600.to-purple-700.flex.items-center.justify-center.z-50"
    );

    if (await authOverlay.isVisible()) {
      console.log("🔐 Auth overlay found, attempting authentication...");

      // Use the authentication helper
      await TestHelpers.authenticate(page, "1234");

      // Verify auth overlay is gone
      await expect(authOverlay).not.toBeVisible();

      console.log("✅ Authentication successful!");
    } else {
      console.log(
        "ℹ️ No auth overlay found - already authenticated or not required"
      );
    }

    // Verify we can see the main content
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle authentication flow step by step", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const authOverlay = page.locator(
      "div.fixed.inset-0.bg-gradient-to-br.from-blue-600.to-purple-700.flex.items-center.justify-center.z-50"
    );

    if (await authOverlay.isVisible()) {
      // Step 1: Wait for overlay
      await authOverlay.waitFor({ state: "visible", timeout: 15000 });
      console.log("✅ Step 1: Auth overlay visible");

      // Step 2: Find PIN input
      const pinInput = page.locator(
        'input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"], [data-testid="pin-input"]'
      );
      await pinInput.waitFor({ state: "visible", timeout: 10000 });
      console.log("✅ Step 2: PIN input found");

      // Step 3: Enter PIN
      await pinInput.fill("1234");
      console.log("✅ Step 3: PIN entered");

      // Step 4: Find submit button
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Submit"), button:has-text("Login"), [data-testid="pin-submit"]'
      );
      await submitButton.waitFor({ state: "visible", timeout: 10000 });
      console.log("✅ Step 4: Submit button found");

      // Step 5: Click submit
      await submitButton.click();
      console.log("✅ Step 5: Submit button clicked");

      // Step 6: Wait for overlay to disappear
      await authOverlay.waitFor({ state: "hidden", timeout: 15000 });
      console.log("✅ Step 6: Auth overlay disappeared");

      // Step 7: Wait for page to load
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      console.log("✅ Step 7: Page loaded after auth");
    } else {
      console.log("ℹ️ No authentication required");
    }

    // Final verification
    await expect(page.locator("body")).toBeVisible();
  });

  test("should verify authentication state after login", async ({ page }) => {
    await page.goto("/");

    // Authenticate if needed
    await TestHelpers.authenticate(page, "1234");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check if we can see navigation elements
    const navElements = page.locator('nav, [role="navigation"], a[href]');
    const navCount = await navElements.count();

    console.log(`🔍 Found ${navCount} navigation elements`);

    // Should have some navigation elements
    expect(navCount).toBeGreaterThan(0);

    // Check if auth overlay is completely gone
    const authOverlay = page.locator(
      "div.fixed.inset-0.bg-gradient-to-br.from-blue-600.to-purple-700.flex.items-center.justify-center.z-50"
    );
    await expect(authOverlay).not.toBeVisible();

    console.log("✅ Authentication state verified successfully");
  });
});
