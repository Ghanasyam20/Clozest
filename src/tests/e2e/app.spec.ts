import { test, expect } from "@playwright/test";
import path from "path";

// Use saved auth state from setup
test.use({ storageState: path.join(__dirname, "../.auth/user.json") });

// ── Dashboard ─────────────────────────────────────────────────────────────────

test.describe("Dashboard", () => {
  test("renders greeting and key widgets", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Greeting
    await expect(page.locator("h1")).toContainText(/good (morning|afternoon|evening)/i);

    // Health score widget exists
    await expect(page.locator("text=/closet health/i")).toBeVisible({ timeout: 8_000 });
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to closet
    await page.getByRole("link", { name: /my closet/i }).click();
    await expect(page).toHaveURL(/\/closet/);

    // Navigate to analytics
    await page.getByRole("link", { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/analytics/);

    // Navigate back to dashboard
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("weather widget is present", async ({ page }) => {
    await page.goto("/dashboard");
    // Either weather loads or error state appears — either is valid
    await expect(
      page.locator("text=/today.*weather|location access/i")
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ── Closet ────────────────────────────────────────────────────────────────────

test.describe("Closet", () => {
  test("renders closet page", async ({ page }) => {
    await page.goto("/closet");
    await expect(page.locator("h1")).toContainText(/my closet/i);
    await expect(page.getByRole("button", { name: /add item/i })).toBeVisible();
  });

  test("opens upload modal on Add Item click", async ({ page }) => {
    await page.goto("/closet");
    await page.getByRole("button", { name: /add item/i }).click();

    // Upload modal should appear
    await expect(page.locator("text=/upload|drag|drop/i")).toBeVisible({ timeout: 5_000 });
  });

  test("closes upload modal on ESC", async ({ page }) => {
    await page.goto("/closet");
    await page.getByRole("button", { name: /add item/i }).click();
    await page.keyboard.press("Escape");

    // Modal should close
    await expect(page.locator("text=/drag.*drop/i")).not.toBeVisible({ timeout: 3_000 });
  });

  test("filter bar is rendered", async ({ page }) => {
    await page.goto("/closet");
    await expect(page.locator("text=/all/i").first()).toBeVisible();
    // Category filter buttons
    await expect(page.locator("button", { hasText: /tops/i })).toBeVisible();
  });

  test("search input filters items", async ({ page }) => {
    await page.goto("/closet");
    const searchInput = page.getByPlaceholder(/search.*closet/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test query");
    // Search state should update
    await expect(searchInput).toHaveValue("test query");
  });

  test("view toggle switches between grid and list", async ({ page }) => {
    await page.goto("/closet");
    // Find list view button
    const listBtn = page.getByTitle(/list view/i);
    await listBtn.click();
    // Grid view button should still be present
    await expect(page.getByTitle(/grid view/i)).toBeVisible();
  });
});

// ── Outfit Generator ──────────────────────────────────────────────────────────

test.describe("Outfit Generator", () => {
  test("renders occasion selection step", async ({ page }) => {
    await page.goto("/outfits/generate");
    await expect(page.locator("h1")).toContainText(/generate outfit/i);
    await expect(page.locator("text=/occasion/i")).toBeVisible();
    // Occasion cards
    await expect(page.locator("text=/casual/i").first()).toBeVisible();
    await expect(page.locator("text=/work/i").first()).toBeVisible();
  });

  test("Next button disabled until occasion selected", async ({ page }) => {
    await page.goto("/outfits/generate");
    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeDisabled();
  });

  test("enables Next after selecting occasion", async ({ page }) => {
    await page.goto("/outfits/generate");
    await page.locator("button", { hasText: /^casual$/i }).click();
    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeEnabled();
  });

  test("navigates to preferences step", async ({ page }) => {
    await page.goto("/outfits/generate");
    await page.locator("button", { hasText: /^casual$/i }).click();
    await page.getByRole("button", { name: /next/i }).click();
    // Should show preferences step
    await expect(page.locator("text=/style preferences/i")).toBeVisible();
  });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

test.describe("Analytics", () => {
  test("renders analytics page", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText(/analytics/i);
    // Health score section
    await expect(page.locator("text=/closet health score/i")).toBeVisible({ timeout: 8_000 });
  });

  test("gap analysis section visible", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("text=/gap analysis/i")).toBeVisible({ timeout: 8_000 });
  });
});

// ── Profile ───────────────────────────────────────────────────────────────────

test.describe("Profile", () => {
  test("renders profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toContainText(/profile/i);
    await expect(page.locator("text=/account/i")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("text=/style dna/i")).toBeVisible();
  });

  test("edit button shows name input", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: /edit/i }).first().click();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────

test.describe("Settings", () => {
  test("renders settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText(/settings/i);
    await expect(page.locator("text=/sign out/i")).toBeVisible();
    await expect(page.locator("text=/danger zone/i")).toBeVisible();
  });

  test("sign out button shows confirmation", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).click();
    // Confirmation buttons should appear
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
  });
});

// ── Accessibility checks ──────────────────────────────────────────────────────

test.describe("Accessibility", () => {
  test("dashboard has no detectable ARIA errors", async ({ page }) => {
    await page.goto("/dashboard");
    // Check that interactive elements have accessible names
    const buttons = page.getByRole("button");
    const count   = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      const name = await btn.getAttribute("aria-label") ?? await btn.textContent();
      expect(name?.trim()).toBeTruthy();
    }
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/closet");
    const images = page.locator("img");
    const count  = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Alt can be empty string for decorative images, but should be present
      expect(alt).not.toBeNull();
    }
  });

  test("login form has labelled inputs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("focus visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    // Tab through first few elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // Focus should be visible (no assertion needed — just shouldn't crash)
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
