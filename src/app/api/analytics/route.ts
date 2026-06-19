import { prisma } from "@/lib/prisma";
import { ok, requireAuth } from "@/lib/api";
import type { WardrobeAnalytics, GapAnalysis, WornByDay, HealthSnapshot } from "@/types";

const ALL_CATEGORIES = ["tops", "bottoms", "footwear", "accessories", "outerwear", "dresses"];

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  // ── Parallel data fetch ───────────────────────────────────────────────────
  const [items, outfits, styleProfile, recentSnapshots] = await prisma.$transaction([
    prisma.wardrobeItem.findMany({
      where:   { userId },
      include: { outfitItems: true },
    }),
    prisma.outfit.findMany({
      where:   { userId },
      select:  { id: true, wornCount: true, wornAt: true, outfitItems: { select: { wardrobeItemId: true } } },
    }),
    prisma.styleProfile.findUnique({ where: { userId } }),
    prisma.healthSnapshot.findMany({
      where:   { userId },
      orderBy: { snappedAt: "asc" },
      take:    12,  // ~3 months of weekly data
    }),
  ]);

  // ── Empty wardrobe ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return ok<WardrobeAnalytics>({
      totalItems:       0,
      byCategory:       {},
      byColor:          {},
      unusedItems:      [],
      mostWornItems:    [],
      healthScore:      0,
      outfitPotential:  0,
      variety:          0,
      utilisation:      0,
      totalOutfits:     0,
      wornOutfits:      0,
      averageWornCount: 0,
      styleAlignment:   0,
      gapAnalysis:      { missingCategories: ALL_CATEGORIES, underrepresented: [], overrepresented: [], recommendations: ["Start by adding clothes to your wardrobe."] },
      wornByDay:        [],
      healthHistory:    [],
    });
  }

  // ── Category + colour distributions ──────────────────────────────────────
  const byCategory: Record<string, number> = {};
  const byColor:    Record<string, number> = {};

  for (const item of items) {
    if (item.category) byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    if (item.color)    byColor[item.color]        = (byColor[item.color]        ?? 0) + 1;
  }

  // ── Wear data ─────────────────────────────────────────────────────────────
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const unusedItems     = items.filter(
    (i) => i.wornCount === 0 && new Date(i.createdAt) < fourteenDaysAgo
  );
  const mostWornItems   = [...items]
    .sort((a, b) => b.wornCount - a.wornCount)
    .slice(0, 5);
  const averageWornCount = items.length > 0
    ? parseFloat((items.reduce((s, i) => s + i.wornCount, 0) / items.length).toFixed(2))
    : 0;

  // ── Core health score ─────────────────────────────────────────────────────
  const categoryCount   = Object.keys(byCategory).length;
  const variety         = Math.min(100, (categoryCount / 6) * 100);
  const utilisedCount   = items.filter((i) => i.wornCount > 0).length;
  const utilisation     = Math.min(100, (utilisedCount / items.length) * 100);
  const outfitPotential = Math.min(100, (outfits.length / Math.max(1, items.length / 3)) * 100);
  const healthScore     = Math.round((variety * 0.3) + (utilisation * 0.5) + (outfitPotential * 0.2));

  // ── Outfit stats ──────────────────────────────────────────────────────────
  const wornOutfits = outfits.filter((o) => (o.wornCount ?? 0) > 0).length;

  // ── Style alignment — worn colours vs. stated favourites ──────────────────
  const favouriteColors = (styleProfile?.favoriteColors as string[] | undefined) ?? [];
  let styleAlignment = 50; // neutral default when no preferences set

  if (favouriteColors.length > 0) {
    const itemsWithColor = items.filter((i) => i.color && i.wornCount > 0);
    if (itemsWithColor.length > 0) {
      const aligned = itemsWithColor.filter((i) =>
        favouriteColors.some((fc) =>
          fc.toLowerCase().includes(i.color!.toLowerCase()) ||
          i.color!.toLowerCase().includes(fc.toLowerCase())
        )
      );
      styleAlignment = Math.round((aligned.length / itemsWithColor.length) * 100);
    }
  }

  // ── Gap analysis ──────────────────────────────────────────────────────────
  const missingCategories   = ALL_CATEGORIES.filter((c) => !byCategory[c]);
  const underrepresented    = ALL_CATEGORIES.filter((c) => byCategory[c] > 0 && byCategory[c] < 2);
  const overrepresented     = Object.entries(byCategory)
    .filter(([, count]) => count / items.length > 0.35)
    .map(([cat]) => cat);

  const recommendations: string[] = [];
  if (missingCategories.includes("footwear"))  recommendations.push("Add footwear to complete outfits.");
  if (missingCategories.includes("outerwear")) recommendations.push("Add outerwear for seasonal variety.");
  if (missingCategories.includes("accessories")) recommendations.push("Accessories can elevate any look.");
  if (utilisation < 40)    recommendations.push("Many items are unworn — try mixing them into your outfits.");
  if (outfits.length === 0) recommendations.push("Generate your first outfit to improve your outfit potential score.");
  if (styleAlignment < 40 && favouriteColors.length > 0)
    recommendations.push(`You wear colours outside your stated palette often — consider updating your Style DNA.`);
  if (overrepresented.length > 0)
    recommendations.push(`You have many ${overrepresented[0]} — consider balancing with other categories.`);
  if (recommendations.length === 0)
    recommendations.push("Great wardrobe balance! Keep wearing your full collection.");

  const gapAnalysis: GapAnalysis = {
    missingCategories, underrepresented, overrepresented, recommendations,
  };

  // ── Worn-by-day (last 30 days) ────────────────────────────────────────────
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const wornByDayMap  = new Map<string, { outfits: number; items: number }>();

  for (const outfit of outfits) {
    if (outfit.wornAt && outfit.wornAt > thirtyDaysAgo) {
      const key = outfit.wornAt.toISOString().slice(0, 10);
      const cur = wornByDayMap.get(key) ?? { outfits: 0, items: 0 };
      wornByDayMap.set(key, {
        outfits: cur.outfits + 1,
        items:   cur.items   + outfit.outfitItems.length,
      });
    }
  }

  // Fill in the last 30 days (including zeros)
  const wornByDay: WornByDay[] = [];
  for (let d = 29; d >= 0; d--) {
    const date  = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const key   = date.toISOString().slice(0, 10);
    const entry = wornByDayMap.get(key) ?? { outfits: 0, items: 0 };
    wornByDay.push({ date: key, ...entry });
  }

  // ── Health history from snapshots ─────────────────────────────────────────
  const healthHistory: HealthSnapshot[] = recentSnapshots.map((s) => ({
    date:        s.snappedAt.toISOString().slice(0, 10),
    healthScore: s.healthScore,
  }));

  // Always append today's current score
  const todayKey = new Date().toISOString().slice(0, 10);
  if (!healthHistory.length || healthHistory[healthHistory.length - 1].date !== todayKey) {
    healthHistory.push({ date: todayKey, healthScore });
  }

  // ── Persist today's snapshot (upsert by day, keep one per week) ───────────
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existingToday = await prisma.healthSnapshot.findFirst({
    where: { userId, snappedAt: { gte: startOfDay } },
  });

  if (!existingToday) {
    await prisma.healthSnapshot.create({
      data: {
        userId,
        healthScore,
        variety:     Math.round(variety),
        utilisation: Math.round(utilisation),
        totalItems:  items.length,
      },
    }).catch(() => {}); // Non-blocking — analytics should not fail if snapshot fails
  }

  return ok<WardrobeAnalytics>({
    totalItems:       items.length,
    byCategory,
    byColor,
    unusedItems,
    mostWornItems,
    healthScore,
    outfitPotential:  Math.round(outfitPotential),
    variety:          Math.round(variety),
    utilisation:      Math.round(utilisation),
    totalOutfits:     outfits.length,
    wornOutfits,
    averageWornCount,
    styleAlignment,
    gapAnalysis,
    wornByDay,
    healthHistory,
  });
}
