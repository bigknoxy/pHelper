import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  // Start a robust dev orchestration script when running tests so health checks
  // pass reliably in CI/local. The script starts DB + server, waits for backend
  // health, then starts the client. Set SKIP_START=1 to skip this behavior.
  webServer: process.env.SKIP_START === '1' ? undefined : {
    command: 'bash ./scripts/e2e-start.sh',
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    // generous timeout to allow DB/container + migrations to run in CI
    timeout: 300000,
    reuseExistingServer: true,
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
