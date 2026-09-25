import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ui",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  fullyParallel: false,
  outputDir: "/tmp/safesport-playwright-results",
  reporter: [["list"]],
  use: {
    actionTimeout: 15000,
    baseURL: process.env.SAFESPORT_TEST_URL || "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
