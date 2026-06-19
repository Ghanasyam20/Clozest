import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Pure logic extracted for testability ─────────────────────────────────────
// These mirror the implementations in src/lib/api.ts

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now    = Date.now();
  const record = map.get(key);

  if (!record || now > record.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES    = 10 * 1024 * 1024;

function validateImageFile(file: { type: string; size: number }): { valid: boolean; reason?: string } {
  if (!ALLOWED_MIME.includes(file.type)) {
    return { valid: false, reason: "Invalid file type." };
  }
  if (file.size > MAX_BYTES) {
    return { valid: false, reason: "File too large." };
  }
  return { valid: true };
}

// ── Rate limiter ──────────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  let map: Map<string, { count: number; resetAt: number }>;

  beforeEach(() => {
    map = new Map();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit(map, "user:1", 5);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after limit is reached", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(map, "user:1", 5);
    const result = checkRateLimit(map, "user:1", 5);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(map, "user:1", 5);
    // Advance time past window
    vi.advanceTimersByTime(61_000);
    const result = checkRateLimit(map, "user:1", 5);
    expect(result.allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(map, "user:1", 5);
    const result = checkRateLimit(map, "user:2", 5);
    expect(result.allowed).toBe(true);
  });
});

// ── File validation ───────────────────────────────────────────────────────────

describe("validateImageFile", () => {
  it("accepts valid JPEG", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 1024 }).valid).toBe(true);
  });

  it("accepts valid PNG", () => {
    expect(validateImageFile({ type: "image/png", size: 1024 }).valid).toBe(true);
  });

  it("accepts valid WebP", () => {
    expect(validateImageFile({ type: "image/webp", size: 1024 }).valid).toBe(true);
  });

  it("rejects PDF", () => {
    const result = validateImageFile({ type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/type/i);
  });

  it("rejects executable", () => {
    const result = validateImageFile({ type: "application/x-executable", size: 100 });
    expect(result.valid).toBe(false);
  });

  it("rejects oversized file", () => {
    const result = validateImageFile({ type: "image/jpeg", size: 11 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/large/i);
  });

  it("accepts file exactly at size limit", () => {
    expect(validateImageFile({ type: "image/jpeg", size: MAX_BYTES }).valid).toBe(true);
  });

  it("rejects file one byte over limit", () => {
    expect(validateImageFile({ type: "image/jpeg", size: MAX_BYTES + 1 }).valid).toBe(false);
  });
});

// ── Season inference (mirrors FastAPI logic in Next.js context) ───────────────

describe("Season inference", () => {
  function inferSeasons(category: string, fabric: string): string[] {
    const warm  = new Set(["linen", "cotton", "silk"]);
    const cool  = new Set(["wool", "velvet"]);
    if (cool.has(fabric))        return ["autumn", "winter"];
    if (warm.has(fabric) && ["tops","bottoms","dresses","footwear"].includes(category))
                                  return ["spring", "summer"];
    if (category === "outerwear") return ["autumn", "winter"];
    return ["spring", "summer", "autumn", "winter"];
  }

  it("wool → autumn/winter", () => {
    expect(inferSeasons("tops", "wool")).toEqual(["autumn", "winter"]);
  });

  it("linen tops → spring/summer", () => {
    expect(inferSeasons("tops", "linen")).toEqual(["spring", "summer"]);
  });

  it("outerwear → autumn/winter regardless of fabric", () => {
    expect(inferSeasons("outerwear", "cotton")).toEqual(["autumn", "winter"]);
  });

  it("synthetic → all seasons", () => {
    expect(inferSeasons("tops", "synthetic")).toEqual(["spring","summer","autumn","winter"]);
  });
});
