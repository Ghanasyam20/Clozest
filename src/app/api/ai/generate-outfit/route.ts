import { NextRequest } from "next/server";
import { ok, err, requireAuth, checkRateLimit } from "@/lib/api";
import { generateOutfitSchema } from "@/schemas/outfit";
import { prisma } from "@/lib/prisma";
import type { WardrobeItem } from "@/types";

// ── Hash helpers ─────────────────────────────────────────────────────────────

function buildHash(itemIds: string[]): string {
  return [...itemIds].sort().join("|");
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const rl = checkRateLimit(`generate:${userId}`, 15, 60_000);
  if (!rl.allowed) return err("Too many requests. Please slow down.", 429);

  const body   = await req.json();
  const parsed = generateOutfitSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  // Fetch user's full wardrobe
  const wardrobeItems = await prisma.wardrobeItem.findMany({
    where: { userId },
  });

  if (wardrobeItems.length < 2) {
    return err("Add at least 2 items to your wardrobe before generating outfits.", 400);
  }

  // Lookup map so we can always resolve back to the full local record
  // (imageUrl, color, wornCount, etc.) regardless of what shape the AI
  // service returns its item references in.
  const itemsById = new Map(wardrobeItems.map((i) => [i.id, i]));

  // Fetch recent outfit hashes to avoid repetition (last 5)
  const recentOutfits = await prisma.outfit.findMany({
    where:   { userId, itemsHash: { not: null } },
    orderBy: { generatedAt: "desc" },
    take:    5,
    select:  { itemsHash: true },
  });
  const recentHashes = new Set(recentOutfits.map((o) => o.itemsHash).filter(Boolean) as string[]);

  const aiUrl    = process.env.AI_SERVICE_URL;
  const aiSecret = process.env.AI_SERVICE_SECRET;

  let result: { items: WardrobeItem[]; confidenceScore: number; reasoning: string };

  // Try AI service (up to 2 attempts)
  if (aiUrl && process.env.NEXT_PUBLIC_AI_CLASSIFICATION_ENABLED === "true") {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(`${aiUrl}/generate-outfit`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Secret": aiSecret ?? "",
          },
          body: JSON.stringify({
            occasion:       parsed.data.occasion,
            weather_data:   parsed.data.weatherData,
            style_profile:  parsed.data.styleProfile,
            wardrobe_items: wardrobeItems,
            exclude_hashes: Array.from(recentHashes),
          }),
          signal: AbortSignal.timeout(35_000),
        });

        if (res.ok) {
          const aiResult = await res.json();

          // The AI service may only return lightweight item references
          // (e.g. just an id, or a partial/reshaped object) rather than
          // full WardrobeItem records. Re-resolve every returned item
          // against our own freshly-fetched wardrobeItems so fields like
          // imageUrl, color, and wornCount are always the real, complete
          // values — never whatever (possibly incomplete) shape the AI
          // service happened to send back.
          const rawItems: Array<{ id?: string }> = aiResult.items ?? [];
          const resolvedItems = rawItems
            .map((raw) => (raw?.id ? itemsById.get(raw.id) : undefined))
            .filter((item): item is WardrobeItem => Boolean(item));

          // If resolution dropped items (e.g. AI returned an id that no
          // longer exists, or no ids at all), don't silently ship a
          // broken/empty outfit — fall through to the rule-based
          // generator instead, which always works against real data.
          if (resolvedItems.length >= 2) {
            result = {
              items:           resolvedItems,
              confidenceScore: aiResult.confidence_score ?? aiResult.confidenceScore ?? 0,
              reasoning:       aiResult.reasoning ?? "",
            };
            break;
          }
        }

        if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
      } catch (e) {
        if (attempt < 2) {
          console.warn("[generate-outfit] AI attempt failed, retrying…", (e as Error).message);
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  }

  // Rule-based fallback
  if (!result!) {
    result = ruleBasedOutfitGenerator(
      wardrobeItems,
      parsed.data.occasion,
      parsed.data.weatherData,
      parsed.data.styleProfile,
      recentHashes
    );
  }

  // Compute and attach items hash for dedup tracking
  const itemsHash = buildHash(result.items.map((i) => i.id));

  return ok({ ...result, itemsHash });
}

// ─── Enhanced rule-based generator ───────────────────────────────────────────

function ruleBasedOutfitGenerator(
  items:        WardrobeItem[],
  occasion:     string,
  weatherData?: { temperature?: number; isRaining?: boolean; condition?: string },
  styleProfile?: { styleTypes?: string[]; favoriteColors?: string[] },
  excludeHashes?: Set<string>
): { items: WardrobeItem[]; confidenceScore: number; reasoning: string } {
  const byCategory: Record<string, WardrobeItem[]> = {};
  for (const item of items) {
    const cat = item.category ?? "uncategorised";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  const temp = weatherData?.temperature;
  const targetSeason =
    temp === undefined ? null :
    temp >= 25 ? "summer" :
    temp >= 15 ? "spring" :
    temp >= 5  ? "autumn" : "winter";

  const preferredColors = styleProfile?.favoriteColors ?? [];
  const preferredStyles = styleProfile?.styleTypes ?? [];

  const OCCASION_STYLES: Record<string, string[]> = {
    casual:  ["casual", "streetwear", "minimalist", "bohemian"],
    work:    ["formal", "minimalist"],
    formal:  ["formal", "old-money"],
    date:    ["minimalist", "vintage", "formal", "old-money"],
    sport:   ["sport", "athleisure"],
    travel:  ["casual", "minimalist", "athleisure"],
    party:   ["streetwear", "vintage", "casual"],
  };
  const occasionStyles = OCCASION_STYLES[occasion] ?? [];

  function scoreItem(item: WardrobeItem): number {
    let s = 1.0;

    // Season match
    if (targetSeason && item.season.length > 0) {
      s *= item.season.includes(targetSeason) ? 1.0 : 0.2;
    }

    // Style match
    if (item.style && occasionStyles.length > 0) {
      s *= occasionStyles.includes(item.style) ? 1.2 : 0.6;
    }

    // Preferred style match
    if (item.style && preferredStyles.length > 0) {
      s *= preferredStyles.some((ps) => item.style?.includes(ps)) ? 1.15 : 1.0;
    }

    // Boost preferred colours
    if (item.color && preferredColors.length > 0) {
      const colorLower = item.color.toLowerCase();
      const matched = preferredColors.some((c) => colorLower.includes(c.toLowerCase()));
      s *= matched ? 1.2 : 1.0;
    }

    // Penalise heavily-worn — promote underused
    s *= Math.max(0.25, 1.0 - item.wornCount * 0.04);

    return Math.min(s, 1.5);
  }

  function pickBest(category: string): WardrobeItem | null {
    const pool = byCategory[category] ?? [];
    if (!pool.length) return null;
    return [...pool].sort((a, b) => scoreItem(b) - scoreItem(a))[0];
  }

  // Build outfit
  let selected: WardrobeItem[] = [];
  const top    = pickBest("tops");
  const bottom = pickBest("bottoms");
  const dress  = pickBest("dresses");

  if (dress && (!top || !bottom)) {
    selected.push(dress);
  } else {
    if (top)    selected.push(top);
    if (bottom) selected.push(bottom);
  }

  const shoe = pickBest("footwear");
  if (shoe) selected.push(shoe);

  const needsOuter = (temp !== undefined && temp < 15) || !!weatherData?.isRaining;
  if (needsOuter) {
    const outer = pickBest("outerwear");
    if (outer) selected.push(outer);
  }

  if (selected.length < 5) {
    const acc = pickBest("accessories");
    if (acc) selected.push(acc);
  }

  // If the result hash was recently used, try swapping one item
  if (excludeHashes && selected.length > 0) {
    let hash = [...selected].sort((a, b) => a.id.localeCompare(b.id)).map((i) => i.id).join("|");
    if (excludeHashes.has(hash)) {
      // Try swapping the top / bottom with second-best alternative
      for (const cat of ["tops", "bottoms", "footwear", "accessories"]) {
        const pool = (byCategory[cat] ?? []).filter((i) => !selected.find((s) => s.id === i.id));
        if (pool.length > 0) {
          const alt = pool.sort((a, b) => scoreItem(b) - scoreItem(a))[0];
          const idx = selected.findIndex((s) => s.category === cat);
          if (idx !== -1) {
            selected[idx] = alt;
            hash = [...selected].sort((a, b) => a.id.localeCompare(b.id)).map((i) => i.id).join("|");
            if (!excludeHashes.has(hash)) break;
          }
        }
      }
    }
  }

  if (!selected.length) {
    // Last resort: just pick any items
    selected = items.slice(0, Math.min(3, items.length));
  }

  // Confidence score
  const completeness    = Math.min(1, selected.length / 3);
  const colorSet        = new Set(selected.map((i) => i.color).filter(Boolean));
  const colorHarmony    = colorSet.size <= 3 ? 0.9 : 0.6;
  const avgItemScore    = selected.reduce((a, i) => a + scoreItem(i), 0) / selected.length;
  const confidenceScore = parseFloat(
    Math.min(0.97, (avgItemScore / 1.5) * 0.5 + colorHarmony * 0.3 + completeness * 0.2).toFixed(3)
  );

  const reasoning = [
    `Rule-based outfit for ${occasion}`,
    targetSeason ? `(${targetSeason})` : "",
    `— ${selected.length} items selected.`,
    selected.some((i) => i.wornCount === 0) ? "Includes unworn pieces." : "",
  ].filter(Boolean).join(" ");

  return { items: selected, confidenceScore, reasoning };
}
