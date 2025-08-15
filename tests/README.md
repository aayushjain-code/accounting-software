# 🧪 Testing Framework Documentation

This document outlines the comprehensive testing setup for the BST Accounting Management System using **Playwright**.

## 🎯 **Why Playwright?**

Playwright is our chosen testing framework because it provides:

- **All-in-one solution**: E2E, functional, and integration testing
- **Multi-browser support**: Chrome, Firefox, Safari, Edge
- **Excellent Next.js integration**: Built-in support for modern web apps
- **Fast execution**: Parallel test execution and smart waiting
- **Great debugging**: Visual trace viewer and step-by-step debugging
- **TypeScript support**: Native TypeScript support
- **Visual testing**: Screenshot and video recording

## 📁 **Test Structure**

```
tests/
├── e2e/                    # End-to-end tests
│   ├── navigation.spec.ts  # Navigation flow tests
│   └── dashboard.spec.ts   # Dashboard functionality tests
├── functional/             # Functional tests
│   └── client-management.spec.ts  # Client CRUD operations
├── integration/            # Integration tests
│   └── invoice-workflow.spec.ts   # Complete workflow tests
├── utils/                  # Test utilities
│   └── test-helpers.ts     # Reusable test functions
├── fixtures/               # Test data fixtures
├── global-setup.ts         # Global test setup
├── global-teardown.ts      # Global test cleanup
└── README.md               # This file
```

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Install Playwright Browsers**

```bash
npm run test:install
```

### **3. Run Tests**

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

## 🧪 **Test Types**

### **End-to-End (E2E) Tests**

- **Purpose**: Test complete user workflows from start to finish
- **Location**: `tests/e2e/`
- **Examples**: Navigation, dashboard functionality, complete user journeys
- **When to use**: Verify the entire application works together

### **Functional Tests**

- **Purpose**: Test specific functionality and features
- **Location**: `tests/functional/`
- **Examples**: CRUD operations, form validation, search functionality
- **When to use**: Verify individual features work correctly

### **Integration Tests**

- **Purpose**: Test how different parts of the system work together
- **Location**: `tests/integration/`
- **Examples**: Invoice workflow, data relationships, API integration
- **When to use**: Verify system components integrate properly

## 🛠️ **Test Utilities**

### **TestHelpers Class**

Located in `tests/utils/test-helpers.ts`, provides common functions:

```typescript
import { TestHelpers } from "../utils/test-helpers";

// Authenticate user
await TestHelpers.authenticate(page);

// Navigate to section
await TestHelpers.navigateToSection(page, "Clients");

// Fill form with data
await TestHelpers.fillForm(page, {
  name: "Test Client",
  email: "test@example.com",
});

// Wait for toast message
await TestHelpers.waitForToast(page, "Client added successfully");
```

### **Common Test Patterns**

```typescript
// Setup before each test
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await TestHelpers.authenticate(page);
});

// Test with assertions
test("should add a new client", async ({ page }) => {
  // Action
  await page.click("text=Add Client");

  // Verification
  await expect(page.locator("h1")).toContainText("Add New Client");
});
```

## 📊 **Test Data Management**

### **Generating Test Data**

```typescript
// Generate unique test data
const clientData = TestHelpers.generateTestData("client");
const projectData = TestHelpers.generateTestData("project");
```

### **Cleaning Up Test Data**

```typescript
// Clean up after tests
await TestHelpers.cleanupTestData(page, "client");
```

## 🔧 **Configuration**

### **Playwright Config**

Located in `playwright.config.ts`:

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: Pixel 5, iPhone 12
- **Parallel execution**: Enabled for faster runs
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

### **Environment Variables**

```bash
# CI mode
CI=true npm test

# Custom base URL
BASE_URL=http://localhost:3001 npm test
```

## 📱 **Cross-Browser Testing**

### **Desktop Browsers**

- **Chromium**: Chrome-based testing
- **Firefox**: Mozilla browser testing
- **WebKit**: Safari engine testing

### **Mobile Testing**

- **Mobile Chrome**: Android device simulation
- **Mobile Safari**: iOS device simulation

### **Viewport Testing**

```typescript
// Test mobile responsiveness
await page.setViewportSize({ width: 375, height: 667 });

// Test tablet responsiveness
await page.setViewportSize({ width: 768, height: 1024 });
```

## 🎭 **Test Modes**

### **Headless Mode (Default)**

```bash
npm test  # Runs tests without opening browser windows
```

### **Headed Mode**

```bash
npm run test:headed  # Opens browser windows to see tests running
```

### **UI Mode**

```bash
npm run test:ui  # Opens Playwright UI for interactive testing
```

### **Debug Mode**

```bash
npm run test:debug  # Runs tests with debugging enabled
```

## 📈 **Test Reports**

### **HTML Report**

```bash
npm run test:report  # Opens HTML test report
```

### **JSON Report**

Automatically generated in `test-results/results.json`

### **JUnit Report**

Automatically generated in `test-results/results.xml`

## 🐛 **Debugging Tests**

### **Visual Trace Viewer**

```bash
# View trace for failed test
npx playwright show-trace test-results/trace.zip
```

### **Screenshots and Videos**

- **Screenshots**: Automatically saved on failure
- **Videos**: Automatically recorded on failure
- **Location**: `test-results/` directory

### **Console Logging**

```typescript
// Add logging to tests
console.log("Current URL:", page.url());
console.log("Element count:", await elements.count());
```

## 📝 **Writing Tests**

### **Test Structure**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test("should do something specific", async ({ page }) => {
    // Test implementation
  });

  test.afterEach(async ({ page }) => {
    // Cleanup code
  });
});
```

### **Best Practices**

1. **Use descriptive test names**: `'should add a new client successfully'`
2. **Test one thing at a time**: Each test should verify one specific behavior
3. **Use data-testid attributes**: For reliable element selection
4. **Handle async operations**: Use proper waiting strategies
5. **Clean up test data**: Remove test data after tests complete

### **Element Selection**

```typescript
// Preferred selectors (in order of preference)
await page.locator('[data-testid="add-button"]').click(); // Best
await page.locator('button:has-text("Add Client")').click(); // Good
await page.locator("text=Add Client").click(); // Acceptable
await page.locator("button").nth(0).click(); // Avoid
```

## 🚨 **Common Issues & Solutions**

### **Element Not Found**

```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="element"]', { state: "visible" });

// Wait for element to exist
await page.waitForSelector('[data-testid="element"]', { state: "attached" });
```

### **Timing Issues**

```typescript
// Wait for network to be idle
await page.waitForLoadState("networkidle");

// Wait for specific timeout
await page.waitForTimeout(1000);

// Wait for element to change
await expect(page.locator('[data-testid="status"]')).toContainText("Completed");
```

### **Authentication Issues**

```typescript
// Check if authentication is needed
const authOverlay = page.locator('[data-testid="auth-overlay"]');
if (await authOverlay.isVisible()) {
  await TestHelpers.authenticate(page);
}
```

## 🔄 **Continuous Integration**

### **GitHub Actions Example**

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 📚 **Additional Resources**

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library](https://testing-library.com/) (for component testing)

## 🤝 **Contributing to Tests**

### **Adding New Tests**

1. Create test file in appropriate directory
2. Follow naming convention: `feature-name.spec.ts`
3. Use descriptive test names
4. Add proper setup and cleanup
5. Include error handling

### **Updating Existing Tests**

1. Maintain backward compatibility
2. Update selectors if UI changes
3. Add new test cases for new features
4. Remove obsolete tests

### **Test Review Checklist**

- [ ] Tests are descriptive and clear
- [ ] Proper setup and cleanup
- [ ] Error handling included
- [ ] Cross-browser compatibility
- [ ] Performance considerations
- [ ] Documentation updated

---

**Happy Testing! 🎯✨**
