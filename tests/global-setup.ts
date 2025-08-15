import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Launch browser and create a new context
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the app and perform any necessary setup
  try {
    await page.goto(baseURL!);

    // Wait for the app to load
    await page.waitForLoadState("networkidle");

    // Check if authentication is required and handle it
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    if (await authOverlay.isVisible()) {
      // Handle authentication if needed
      await page.fill('[data-testid="pin-input"]', "1234");
      await page.click('[data-testid="pin-submit"]');
      await page.waitForLoadState("networkidle");
    }

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
