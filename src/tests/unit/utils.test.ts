import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatDate, formatRelative, formatBytes, capitalise, truncate, formatTemp } from "@/utils/formatters";
import { cn } from "@/utils/cn";

// ── cn (className merger) ─────────────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    // tailwind-merge should prefer the last class
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null as unknown as string, "end")).toBe("base end");
  });
});

// ── formatters ────────────────────────────────────────────────────────────────

describe("capitalise", () => {
  it("capitalises first letter", () => {
    expect(capitalise("tops")).toBe("Tops");
    expect(capitalise("old-money")).toBe("Old-money");
  });

  it("handles empty string", () => {
    expect(capitalise("")).toBe("");
  });

  it("handles already capitalised", () => {
    expect(capitalise("Tops")).toBe("Tops");
  });
});

describe("formatTemp", () => {
  it("formats Celsius correctly", () => {
    expect(formatTemp(22)).toBe("22°C");
    expect(formatTemp(22.7)).toBe("23°C");
  });

  it("converts to Fahrenheit", () => {
    expect(formatTemp(0, "F")).toBe("32°F");
    expect(formatTemp(100, "F")).toBe("212°F");
  });
});

describe("truncate", () => {
  it("returns string unchanged if short enough", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("hello world", 8)).toBe("hello…");
    expect(truncate("hello world", 8).length).toBeLessThanOrEqual(8);
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("formatBytes", () => {
  it("formats bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("handles large sizes", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-06-15");
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it("accepts a Date object", () => {
    const date = new Date(2024, 5, 15); // June 15 2024
    const result = formatDate(date);
    expect(result).toMatch(/Jun/);
  });
});

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "yesterday" for a date 24h ago', () => {
    const yesterday = new Date("2024-06-14T12:00:00Z");
    const result = formatRelative(yesterday);
    expect(result.toLowerCase()).toMatch(/yesterday/);
  });

  it('returns relative for recent dates', () => {
    const twoHoursAgo = new Date("2024-06-15T10:00:00Z");
    const result = formatRelative(twoHoursAgo);
    expect(result.toLowerCase()).toMatch(/hour/);
  });
});

// ── Analytics score calculation (pure functions) ──────────────────────────────

describe("Health score calculation", () => {
  // Mirrors the calculation from analytics route
  function calculateHealthScore(
    items: { category: string | null; wornCount: number }[],
    outfitCount: number
  ) {
    const byCategory: Record<string, number> = {};
    for (const item of items) {
      if (item.category) byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    }
    const categoryCount   = Object.keys(byCategory).length;
    const variety         = Math.min(100, (categoryCount / 6) * 100);
    const utilisedCount   = items.filter((i) => i.wornCount > 0).length;
    const utilisation     = items.length > 0 ? Math.min(100, (utilisedCount / items.length) * 100) : 0;
    const outfitPotential = Math.min(100, (outfitCount / Math.max(1, items.length / 3)) * 100);
    return Math.round((variety * 0.3) + (utilisation * 0.5) + (outfitPotential * 0.2));
  }

  it("returns 0 for empty wardrobe", () => {
    expect(calculateHealthScore([], 0)).toBe(0);
  });

  it("calculates variety correctly", () => {
    const items = [
      { category: "tops",    wornCount: 1 },
      { category: "bottoms", wornCount: 1 },
      { category: "footwear",wornCount: 1 },
    ];
    // variety = 3/6 * 100 = 50, utilisation = 100, outfitPotential = capped
    const score = calculateHealthScore(items, 1);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("perfect score requires 6+ categories, all worn, many outfits", () => {
    const items = [
      "tops","bottoms","footwear","accessories","outerwear","dresses"
    ].map((cat) => ({ category: cat, wornCount: 5 }));
    const score = calculateHealthScore(items, 10);
    expect(score).toBeGreaterThan(80);
  });

  it("penalises zero utilisation", () => {
    const wornItems   = [{ category: "tops",    wornCount: 1 }];
    const unwornItems = [{ category: "tops",    wornCount: 0 }];
    const wornScore   = calculateHealthScore(wornItems,   0);
    const unwornScore = calculateHealthScore(unwornItems, 0);
    expect(wornScore).toBeGreaterThan(unwornScore);
  });
});
