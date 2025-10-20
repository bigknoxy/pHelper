import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register, login, and verify auth state', async ({ page }) => {
    const timestamp = Date.now();
    const email = `smoke+${timestamp}@example.com`;
    const password = 'testpassword123';

    // Register - navigate via client-side routing
    await page.goto('/');
    // push /register into history and wait for the form to render
    await page.evaluate(() => window.history.pushState({}, '', '/register'));
    await page.waitForSelector('input[aria-label="email"]', { timeout: 10000 });
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);
    await page.click('button[aria-label="register button"]');
    await page.waitForSelector('button:has-text("Logout")', { timeout: 10000 });

    // Check if TopBar shows logout (indicating success)
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Verify token in localStorage (app uses key "jwt")
    const token = await page.evaluate(() => localStorage.getItem('jwt'));
    expect(token).toBeTruthy();

    // Logout and go to login
    await page.click('button:has-text("Logout")');
    await page.evaluate(() => window.history.pushState({}, '', '/login'));
    await page.waitForSelector('input[aria-label="email"]', { timeout: 10000 });

    // Login
    await page.fill('input[aria-label="email"]', email);
    await page.fill('input[aria-label="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForSelector('button:has-text("Logout")', { timeout: 10000 });

    // Verify login success
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    const tokenAfterLogin = await page.evaluate(() => localStorage.getItem('jwt'));
    expect(tokenAfterLogin).toBeTruthy();

    // Optionally, navigate to dashboard and create a task
    await page.click('button:has-text("Dashboard")');
    await page.fill('input[placeholder*="task"]', 'Test Task');
    await page.click('button:has-text("Add")');
    await expect(page.locator('text=Test Task')).toBeVisible();
  });
});