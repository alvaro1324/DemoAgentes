import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  use: {baseURL: 'http://127.0.0.1:4201', trace: 'retain-on-failure'},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: [
    {command: 'node scripts/e2e-backend.mjs', url: 'http://127.0.0.1:8001/api/tasks', reuseExistingServer: false, timeout: 60000},
    {command: 'node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4201 --proxy-config proxy.e2e.json', url: 'http://127.0.0.1:4201', reuseExistingServer: false, timeout: 120000},
  ],
});
