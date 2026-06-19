import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(process.cwd(), "src/tests/.auth/user.json");

// Ensure the .auth directory exists
const authDir = path.dirname(AUTH_FILE);
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

/**
 * Auth setup — runs once before all E2E tests.
 * Creates a test account (or logs into existing) and saves session cookies.
 */
setup("authenticate test user", async ({ page }) => {
  // Unique email per test run to avoid conflicts
  const testEmail    = `e2e-${Date.now()}@clozest-test.example.com`;
  const testPassword = "TestPass1!";
  const testName     = "E2E Test User";

  await page.goto("/register");

  // Fill registration form
  await page.getByLabel("Full name").fill(testName);
  await page.getByLabel("Email address").fill(testEmail);
  await page.getByLabel("Password").fill(testPassword);
  await page.getByRole("button", { name: "Create account" }).click();

  // Should redirect to onboarding after registration
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 });

  // Skip onboarding to reach dashboard
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

  // Save auth state for reuse across tests
  await page.context().storageState({ path: AUTH_FILE });
});
