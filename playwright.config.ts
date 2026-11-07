import { defineConfig } from "@playwright/test";

// End-to-end tests of the Chrome build in a real Chromium: pnpm test:e2e (pnpm exec playwright install chromium first).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
});
