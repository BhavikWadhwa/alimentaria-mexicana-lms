import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/pilot/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    actionTimeout: 15000,
    baseURL: process.env.PILOT_TEST_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: process.env.PILOT_TEST_URL
    ? undefined
    : {
        command: "npm run dev:pilot",
        url: "http://localhost:3000/pilot/login",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
