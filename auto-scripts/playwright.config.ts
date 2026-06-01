import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config cho QA automation suite.
 */
export default defineConfig({
  testDir: './tests/specs',
  outputDir: 'run-results/',
  timeout: 10000,
  retries: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'run-results/results.json' }],
  ],
  use: {
    baseURL: 'https://practicetestautomation.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})
