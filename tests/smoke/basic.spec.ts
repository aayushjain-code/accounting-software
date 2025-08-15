import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/BST Accounting|Accounting Software/);
    
    // Check if main content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check if there's any content on the page
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/');
    
    // Check if authentication overlay is present
    const authOverlay = page.locator('[data-testid="auth-overlay"]');
    
    if (await authOverlay.isVisible()) {
      // Test authentication
      await page.fill('[data-testid="pin-input"]', '1234');
      await page.click('[data-testid="pin-submit"]');
      
      // Wait for auth to complete
      await page.waitForLoadState('networkidle');
      
      // Verify we're authenticated (auth overlay should be gone)
      await expect(authOverlay).not.toBeVisible();
    } else {
      // Already authenticated or no auth required
      console.log('No authentication required or already authenticated');
    }
  });

  test('should have basic navigation structure', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any navigation elements
    const navElements = page.locator('nav, [role="navigation"], a[href]');
    const navCount = await navElements.count();
    
    // Should have at least some navigation elements
    expect(navCount).toBeGreaterThan(0);
  });

  test('should handle page refresh', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Refresh the page
    await page.reload();
    
    // Wait for page to load again
    await page.waitForLoadState('networkidle');
    
    // Verify page is still accessible
    await expect(page.locator('body')).toBeVisible();
  });
});
