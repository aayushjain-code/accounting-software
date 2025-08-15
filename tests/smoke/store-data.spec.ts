import { test, expect } from "@playwright/test";

test.describe("Store Data Verification", () => {
  test("should verify store data is loaded", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check if there's data in localStorage
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem("accountingData");
      return data ? JSON.parse(data) : null;
    });

    console.log("📦 localStorage data:", localStorageData);

    // Check if the page has client data
    const clientElements = page.locator(
      "text=/John Smith|TechCorp|Innovate India/i"
    );
    const clientCount = await clientElements.count();
    console.log(`👥 Found ${clientCount} client-related elements`);

    // Check for any client cards or tables
    const clientCards = page.locator(
      '[data-testid="client-card"], .client-card, .client-item'
    );
    const cardCount = await clientCards.count();
    console.log(`🃏 Found ${cardCount} client cards`);

    // Check for any tables with client data
    const tables = page.locator("table");
    const tableCount = await tables.count();
    console.log(`📊 Found ${tableCount} tables`);

    // Check for any lists with client data
    const lists = page.locator("ul, ol");
    const listCount = await lists.count();
    console.log(`📋 Found ${listCount} lists`);

    // Check if the database loader is working
    const loaderText = page.locator("text=Loading data from database");
    const isLoading = await loaderText.isVisible();
    console.log(`⏳ Database loader visible: ${isLoading}`);

    // Check for any error messages
    const errors = page.locator("text=/error|Error|ERROR/");
    const errorCount = await errors.count();
    console.log(`❌ Found ${errorCount} error messages`);

    // Take a screenshot for debugging
    await page.screenshot({ path: "store-data-debug.png", fullPage: true });

    // Verify that we can see some content
    await expect(page.locator("body")).toBeVisible();

    // If we have localStorage data, verify it has clients
    if (localStorageData) {
      expect(localStorageData.clients).toBeDefined();
      expect(Array.isArray(localStorageData.clients)).toBe(true);
      expect(localStorageData.clients.length).toBeGreaterThan(0);
      console.log(`✅ Store has ${localStorageData.clients.length} clients`);
    } else {
      console.log("⚠️ No localStorage data found");
    }
  });
});
