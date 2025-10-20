import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register, login, and verify auth state', async ({ page }) => {
    const timestamp = Date.now();
    const email = `smoke+${timestamp}@example.com`;
    const password = 'testpassword123';

    // capture page console and runtime errors to aid debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err && err.message));

    // Prevent modal confirm from blocking tests and mark migration done
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      // stub window.confirm used by migration prompt
      // eslint-disable-next-line no-global-assign
      // @ts-ignore
      window.confirm = () => false;
      try {
        localStorage.setItem('migrationComplete', 'true');
      } catch (e) {
        // ignore
      }
    });

    // ensure a clean start (no lingering jwt)
    await page.evaluate(() => {
      try { localStorage.removeItem('jwt'); } catch (e) { /* ignore */ }
    });

    // Register - navigate directly to the register route to avoid relying on TopBar link
    await page.goto('/register', { waitUntil: 'networkidle' });
    // give the client a moment to hydrate and then dump the body HTML for debugging
    await page.waitForTimeout(2000);
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY HTML (preview):', bodyHtml.slice(0, 2000));
    await page.waitForSelector('form[aria-label="register-form"]', { timeout: 60000 });
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);
    // Wait for the register network response and assert token presence
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 200, { timeout: 60000 }),
      page.click('button[aria-label="register button"]'),
    ])
    let registerResponseBody = null as any
    try {
      registerResponseBody = await response.json()
    } catch (e) {
      console.log('Failed to parse register response JSON', e)
    }
    console.log('REGISTER RESPONSE', response.status(), registerResponseBody)


    // Check if TopBar shows logout (indicating success)
    await page.waitForSelector('button:has-text("Logout")', { timeout: 60000 });
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Ensure token was persisted to localStorage
    await page.waitForFunction(() => !!localStorage.getItem('jwt'), null, { timeout: 5000 });
    const regJwt = await page.evaluate(() => localStorage.getItem('jwt'));
    console.log('LOCALSTORAGE jwt after register:', regJwt ? '[REDACTED]' : null);
    expect(regJwt).toBeTruthy();

    // Logout and go to login
    await page.click('button:has-text("Logout")');
    await page.click('text=Login');
    await page.waitForSelector('form[aria-label="login-form"]', { timeout: 60000 });

    // Login
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);

    // Make login persist token by checking "Remember me"
    await page.check('input[aria-label="remember me"]');

    const [loginResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/login') && resp.status() === 200, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForSelector('button:has-text("Logout")', { timeout: 60000 });

    // Ensure login persisted token to localStorage
    await page.waitForFunction(() => !!localStorage.getItem('jwt'), null, { timeout: 5000 });
    const loginJwt = await page.evaluate(() => localStorage.getItem('jwt'));
    console.log('LOCALSTORAGE jwt after login:', loginJwt ? '[REDACTED]' : null);
    expect(loginJwt).toBeTruthy();

    // Verify login success
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Optionally, navigate to dashboard and create a task
    const postLoginBody = await page.evaluate(() => document.body.innerHTML)
    console.log('BODY AFTER LOGIN:', postLoginBody.slice(0, 2000))
    // Try to click dashboard if present
    if (await page.locator('button:has-text("Dashboard")').count() > 0) {
      await page.click('button:has-text("Dashboard")')
      await page.fill('input[placeholder*="task"]', 'Test Task')
      await page.click('button:has-text("Add")')
      await expect(page.locator('text=Test Task')).toBeVisible()
    } else {
      console.log('Dashboard button not present; skipping task creation')
    }

    // cleanup persisted token
    await page.evaluate(() => { try { localStorage.removeItem('jwt'); } catch (e) { /* ignore */ } });
  });
});