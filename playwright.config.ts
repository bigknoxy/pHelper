import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true, launchOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } },
    },
  ],
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html']],
});