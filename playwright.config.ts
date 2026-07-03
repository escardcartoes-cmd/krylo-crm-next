import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Krylo end-to-end smoke tests.
 *
 * Requires the Flask backend + Next.js dev server both running.
 * FLASK_URL and PLAYWRIGHT_BASE_URL are read from the environment.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
