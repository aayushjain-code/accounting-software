import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  // Clean up any test data or resources
  console.log("🧹 Global teardown completed");
}

export default globalTeardown;
