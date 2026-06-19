import { test, expect } from "@playwright/test";

// ── Landing page ──────────────────────────────────────────────────────────────

test.describe("Landing page", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

  test("renders headline and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText(/wardrobe/i);
    await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("logo links to home", async ({ page }) => {
    await page.goto("/");
    await page.locator("text=Clozest").first().click();
    await expect(page).toHaveURL("/");
  });

  test("features section is visible", async ({ page }) => {
    await page.goto("/");
    await page.locator("#features").scrollIntoViewIfNeeded();
    await expect(page.locator("#features")).toBeVisible();
  });

  test("Get Started navigates to register", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started/i }).first().click();
    await expect(page).toHaveURL("/register");
  });
});

// ── Registration ──────────────────────────────────────────────────────────────

test.describe("Registration", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Create account" }).click();
    // Should stay on register (client-side validation)
    await expect(page).toHaveURL("/register");
  });

  test("shows error for weak password", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Password").fill("weak");
    await page.getByRole("button", { name: "Create account" }).click();
    // Password strength indicator should show unmet requirements
    await expect(page.locator("text=At least 8 characters")).toBeVisible();
  });

  test("shows password strength indicator", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Password").fill("P");
    await expect(page.locator("text=At least 8 characters")).toBeVisible();
    await page.getByLabel("Password").fill("Password1");
    // All requirements met — all items should be in accent color
    await expect(page.locator("text=One number")).toBeVisible();
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

test.describe("Login page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create one free/i })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("nobody@example.com");
    await page.getByLabel("Password").fill("WrongPass1");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Toast should appear with error
    await expect(page.locator("text=/sign-in failed|invalid/i")).toBeVisible({ timeout: 5_000 });
  });

  test("link to register works", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /create one free/i }).click();
    await expect(page).toHaveURL("/register");
  });
});

// ── 404 page ──────────────────────────────────────────────────────────────────

test("404 page shows for unknown routes", async ({ page }) => {
  test.use({ storageState: { cookies: [], origins: [] } });
  await page.goto("/this-page-does-not-exist");
  await expect(page.locator("h1")).toContainText(/exist|404/i);
  await expect(page.getByRole("link", { name: /back to clozest/i })).toBeVisible();
});
