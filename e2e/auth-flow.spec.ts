import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (default login)', () => {
  test('unauthenticated shows login by default and full flow', async ({ page }) => {
    const timestamp = Date.now();
    const email = `smoke+${timestamp}@example.com`;
    const password = 'testpassword123';

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err && err.message));

    // prepare environment and avoid modal confirm interfering with tests
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      // @ts-expect-error - stub confirm in the browser context
      // eslint-disable-next-line no-global-assign
      window.confirm = () => false;
      try { localStorage.setItem('migrationComplete', 'true') } catch { /* ignore */ }
    });

    // ensure clean state
    await page.evaluate(() => { try { localStorage.removeItem('jwt') } catch { /* ignore */ } });

    // Visiting root should show login form by default when not authenticated
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });
    await expect(page.locator('form[aria-label="login-form"]')).toBeVisible();

    // Navigate to register directly
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[aria-label="register-form"]', { timeout: 60000 });
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 200, { timeout: 60000 }),
      page.click('button[aria-label="register button"]')
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
  });
});
