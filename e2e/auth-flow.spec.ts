import { test, expect } from '@playwright/test';
import { waitForHealth, waitForFrontend } from './utils'

// Increase timeout because we poll backend/frontend readiness and run full flow
test.setTimeout(180000);

test.describe('Authentication Flow (default login)', () => {
  test('unauthenticated shows login by default and full flow', async ({ page, request }) => {
    const timestamp = Date.now();
    const email = `smoke+${timestamp}@example.com`;
    const password = 'testpassword123';

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err && err.message));

    // Wait for backend and frontend readiness before navigating
    await waitForHealth(request, 30000);
    await waitForFrontend(request, 30000);

    // prepare environment and avoid modal confirm interfering with tests
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      // stub confirm in the browser context
      // eslint-disable-next-line no-global-assign
      // @ts-ignore
      window.confirm = () => false;
      try { localStorage.setItem('migrationComplete', 'true') } catch { /* ignore */ }
    });

    // ensure clean state
    await page.evaluate(() => { try { localStorage.removeItem('jwt') } catch { /* ignore */ } });

    // Visiting root should show login form by default when not authenticated
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });
    await expect(page.locator('form[aria-label="login-form"]')).toBeVisible();

    // test password toggle on login form
    const toggle = page.locator('button[aria-label="Show password"]')
    if (await toggle.count() > 0) {
      // show password
      await toggle.first().click()
      // ensure the input type changed to text
      await expect(page.locator('input[aria-label="password"]')).toHaveAttribute('type', 'text')
      // hide it again
      await page.locator('button[aria-label="Hide password"]').first().click()
      await expect(page.locator('input[aria-label="password"]')).toHaveAttribute('type', 'password')
    }

    // Navigate to register directly
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[aria-label="register-form"]', { timeout: 60000 });
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 200, { timeout: 60000 }),
      page.click('button[aria-label="register button"], button:has-text("Create account"), button:has-text("Create account")')
    ]);
    await page.waitForSelector('button:has-text("Logout")', { timeout: 60000 });

    // Logout should return to login form
    await page.click('button:has-text("Logout")');
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });

    // Login
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);
    await page.check('input[aria-label="remember me"]');

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login') && resp.status() === 200, { timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);
    await page.waitForSelector('button:has-text("Logout")', { timeout: 60000 });

    // Logout again to ensure flow
    await page.click('button:has-text("Logout")');
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });

    // Mobile responsive check: ensure form is usable on small viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });
    await expect(page.locator('form[aria-label="login-form"]')).toBeVisible();
    // ensure password toggle still works on mobile
    const mobileToggle = page.locator('button[aria-label="Show password"]')
    if (await mobileToggle.count() > 0) {
      await mobileToggle.first().click()
      await expect(page.locator('input[aria-label="password"]')).toHaveAttribute('type', 'text')
    }
  });
});
