import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1, retries: 0, timeout: 60_000,
  use: { baseURL: "http://localhost:3000", headless: true, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" }, trace: "retain-on-failure" },
  reporter: "list",
});
