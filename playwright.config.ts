import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir:   "./src/tests/e2e",
  fullyParallel: false,       // run sequentially — DB state depends on order
  forbidOnly: !!process.env.CI,
  retries:    process.env.CI ? 2 : 0,
  workers:    1,
  reporter:   "html",

  use: {
    baseURL:       process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace:         "on-first-retry",
    screenshot:    "only-on-failure",
    video:         "on-first-retry",
  },

  projects: [
    // ── Auth setup ─────────────────────────────────────────────────────────
    {
      name:    "setup",
      testMatch: "**/auth.setup.ts",
    },

    // ── Chrome (primary) ───────────────────────────────────────────────────
    {
      name:         "chromium",
      use:          { ...devices["Desktop Chrome"], storageState: "src/tests/.auth/user.json" },
      dependencies: ["setup"],
    },

    // ── Mobile (smoke) ────────────────────────────────────────────────────
    {
      name: "mobile-chrome",
      use:  { ...devices["Pixel 5"], storageState: "src/tests/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command:            "npm run dev",
    url:                "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout:            120_000,
  },
});
