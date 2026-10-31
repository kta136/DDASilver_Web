import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "4173";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command:
      `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    // These journeys exercise an unconfigured feed. Do not let a developer's
    // .env.local provide server-rendered rates or a live stream during tests.
    env: {
      DDAJEWELS_RATES_SNAPSHOT_URL: "",
      DDAJEWELS_RATES_STREAM_URL: "",
      DDAJEWELS_RATE_TICKET_URL: "",
    },
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
