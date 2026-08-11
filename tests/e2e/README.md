# THINKAI KIDS — Playwright E2E Browser Testing

This directory hosts Playwright E2E browser tests and workflows for verifying user interaction flows in **THINKAI KIDS**.

---

## 1. Setup & Execution

### Prerequisites
Make sure Playwright browsers are installed:
```bash
npx playwright install chromium
```

### Running E2E Tests
```bash
# Run all E2E tests headless
npx playwright test

# Run tests in headed UI mode for visual debugging
npx playwright test --headed

# Debug specific test file
npx playwright test tests/e2e/home.spec.ts --debug
```

---

## 2. Agent Playwright Workflow Guidelines

When an AI agent (Codex or Antigravity) needs to verify a UI flow:

1. **Start Development Server**: Ensure the local app server is running (e.g. `http://localhost:3000`).
2. **Inspect Console Errors**: Capture and inspect console log errors if a page fails to load or render.
3. **Capture Screenshots for Debugging**: Save temporary screenshots under `test-results/` (ignored by `.gitignore`).
4. **Never Commit Auth State**: Never commit authenticated browser storage or cookies.

---

## 3. Example Test Template (`tests/e2e/home.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('THINKAI KIDS Home Page', () => {
  test('should load home page and display title', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: "${msg.text()}"`);
      }
    });

    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/THINKAI/i);
  });
});
```
