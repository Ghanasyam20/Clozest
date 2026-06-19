import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { wardrobeItemSchema, updateWardrobeItemSchema, CATEGORIES } from "@/schemas/wardrobe";
import { generateOutfitSchema, saveOutfitSchema, OCCASIONS } from "@/schemas/outfit";
import { styleProfileSchema, updateProfileSchema, STYLE_AESTHETICS } from "@/schemas/profile";

// ── Auth schemas ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "Password1" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "Password1" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toMatch(/email/i);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { name: "Alex Johnson", email: "alex@example.com", password: "Password1" };

  it("accepts valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = registerSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...valid, password: "password1" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toMatch(/uppercase/i);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({ ...valid, password: "PasswordABC" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toMatch(/number/i);
  });
});

// ── Wardrobe schemas ──────────────────────────────────────────────────────────

describe("wardrobeItemSchema", () => {
  it("accepts a minimal item with just imageUrl", () => {
    const result = wardrobeItemSchema.safeParse({
      imageUrl: "https://example.com/shirt.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fully specified item", () => {
    const result = wardrobeItemSchema.safeParse({
      imageUrl: "https://example.com/shirt.jpg",
      name:     "White Oxford",
      category: "tops",
      color:    "white",
      fabric:   "cotton",
      pattern:  "solid",
      season:   ["spring", "summer"],
      style:    "minimalist",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = wardrobeItemSchema.safeParse({
      imageUrl: "https://example.com/shirt.jpg",
      category: "socks",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid image URL", () => {
    const result = wardrobeItemSchema.safeParse({ imageUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("covers all defined categories", () => {
    for (const cat of CATEGORIES) {
      const result = wardrobeItemSchema.safeParse({
        imageUrl: "https://example.com/img.jpg",
        category: cat,
      });
      expect(result.success, `Category "${cat}" should be valid`).toBe(true);
    }
  });
});

describe("updateWardrobeItemSchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(updateWardrobeItemSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial update", () => {
    expect(updateWardrobeItemSchema.safeParse({ color: "blue", season: ["summer"] }).success).toBe(true);
  });

  it("does not include imageUrl", () => {
    // imageUrl should not be a valid key in update schema
    const keys = Object.keys(updateWardrobeItemSchema.shape);
    expect(keys).not.toContain("imageUrl");
  });
});

// ── Outfit schemas ────────────────────────────────────────────────────────────

describe("generateOutfitSchema", () => {
  it("accepts minimal input with just occasion", () => {
    const result = generateOutfitSchema.safeParse({ occasion: "casual" });
    expect(result.success).toBe(true);
  });

  it("accepts full input with weather and style", () => {
    const result = generateOutfitSchema.safeParse({
      occasion:    "work",
      weatherData: { temperature: 18, condition: "Partly cloudy", humidity: 60 },
      styleProfile: { styleTypes: ["minimalist"], favoriteColors: ["black", "white"] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid occasion", () => {
    const result = generateOutfitSchema.safeParse({ occasion: "grocery-shopping" });
    expect(result.success).toBe(false);
  });

  it("covers all defined occasions", () => {
    for (const occ of OCCASIONS) {
      expect(generateOutfitSchema.safeParse({ occasion: occ }).success, `Occasion "${occ}"`).toBe(true);
    }
  });
});

describe("saveOutfitSchema", () => {
  const validItemIds = [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
  ];

  it("accepts valid save payload", () => {
    const result = saveOutfitSchema.safeParse({ itemIds: validItemIds, occasion: "casual" });
    expect(result.success).toBe(true);
  });

  it("rejects empty itemIds array", () => {
    const result = saveOutfitSchema.safeParse({ itemIds: [] });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toMatch(/at least one/i);
  });

  it("rejects non-UUID item IDs", () => {
    const result = saveOutfitSchema.safeParse({ itemIds: ["not-a-uuid"] });
    expect(result.success).toBe(false);
  });

  it("accepts optional name and notes", () => {
    const result = saveOutfitSchema.safeParse({
      itemIds: validItemIds,
      name:    "Summer look",
      notes:   "Great for the beach",
    });
    expect(result.success).toBe(true);
  });
});

// ── Profile schemas ───────────────────────────────────────────────────────────

describe("styleProfileSchema", () => {
  it("accepts valid style types", () => {
    const result = styleProfileSchema.safeParse({ styleTypes: ["minimalist", "formal"] });
    expect(result.success).toBe(true);
  });

  it("rejects empty styleTypes array", () => {
    const result = styleProfileSchema.safeParse({ styleTypes: [] });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toMatch(/at least one/i);
  });

  it("accepts up to 10 favourite colours", () => {
    const colors = Array.from({ length: 10 }, (_, i) => `color-${i}`);
    const result = styleProfileSchema.safeParse({ styleTypes: ["minimalist"], favoriteColors: colors });
    expect(result.success).toBe(true);
  });

  it("rejects more than 10 favourite colours", () => {
    const colors = Array.from({ length: 11 }, (_, i) => `color-${i}`);
    const result = styleProfileSchema.safeParse({ styleTypes: ["minimalist"], favoriteColors: colors });
    expect(result.success).toBe(false);
  });

  it("covers all defined style aesthetics", () => {
    for (const style of STYLE_AESTHETICS) {
      const result = styleProfileSchema.safeParse({ styleTypes: [style] });
      expect(result.success, `Style "${style}" should be valid`).toBe(true);
    }
  });
});

describe("updateProfileSchema", () => {
  it("accepts empty object", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("accepts name update", () => {
    expect(updateProfileSchema.safeParse({ name: "New Name" }).success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    expect(updateProfileSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    expect(updateProfileSchema.safeParse({ name: "A".repeat(101) }).success).toBe(false);
  });
});
