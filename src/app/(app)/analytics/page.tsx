import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/features/analytics/components/AnalyticsClient";
import type { WardrobeAnalytics, GapAnalysis } from "@/types";

export const metadata: Metadata = { title: "Analytics" };

const ALL_CATEGORIES = [
  "tops",
  "bottoms",
  "footwear",
  "accessories",
  "outerwear",
  "dresses",
];

async function getAnalyticsData(userId: string): Promise<WardrobeAnalytics> {
  const [items, outfits, styleProfile, snapshots] = await prisma.$transaction([
    prisma.wardrobeItem.findMany({
      where: { userId },
      include: { outfitItems: true },
    }),
    prisma.outfit.findMany({
      where: { userId },
      select: {
        id: true,
        wornCount: true,
        wornAt: true,
        outfitItems: { select: { wardrobeItemId: true } },
      },
    }),
    prisma.styleProfile.findUnique({ where: { userId } }),
    prisma.healthSnapshot.findMany({
      where: { userId },
      orderBy: { snappedAt: "asc" },
      take: 12,
    }),
  ]);

  if (items.length === 0) {
    return {
      totalItems: 0,
      byCategory: {},
      byColor: {},
      unusedItems: [],
      mostWornItems: [],
      healthScore: 0,
      outfitPotential: 0,
      variety: 0,
      utilisation: 0,
      totalOutfits: 0,
      wornOutfits: 0,
      averageWornCount: 0,
      styleAlignment: 0,
      gapAnalysis: {
        missingCategories: ALL_CATEGORIES,
        underrepresented: [],
        overrepresented: [],
        recommendations: ["Start by adding clothes to your wardrobe."],
      },
      wornByDay: [],
      healthHistory: [],
    };
  }

  const byCategory: Record<string, number> = {};
  const byColor: Record<string, number> = {};

  for (const item of items) {
    if (item.category)
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    if (item.color) byColor[item.color] = (byColor[item.color] ?? 0) + 1;
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const unusedItems = items.filter(
    (i) => i.wornCount === 0 && new Date(i.createdAt) < fourteenDaysAgo,
  );
  const mostWornItems = [...items]
    .sort((a, b) => b.wornCount - a.wornCount)
    .slice(0, 5);
  const averageWornCount = parseFloat(
    (items.reduce((s, i) => s + i.wornCount, 0) / items.length).toFixed(2),
  );

  const categoryCount = Object.keys(byCategory).length;
  const variety = Math.min(100, (categoryCount / 6) * 100);
  const utilisedCount = items.filter((i) => i.wornCount > 0).length;
  const utilisation = Math.min(100, (utilisedCount / items.length) * 100);
  const outfitPotential = Math.min(
    100,
    (outfits.length / Math.max(1, items.length / 3)) * 100,
  );
  const healthScore = Math.round(
    variety * 0.3 + utilisation * 0.5 + outfitPotential * 0.2,
  );

  const wornOutfits = outfits.filter((o) => (o.wornCount ?? 0) > 0).length;

  // Style alignment
  const favouriteColors =
    (styleProfile?.favoriteColors as string[] | undefined) ?? [];
  let styleAlignment = 50;
  if (favouriteColors.length > 0) {
    const wornItems = items.filter((i) => i.color && i.wornCount > 0);
    if (wornItems.length > 0) {
      const aligned = wornItems.filter((i) =>
        favouriteColors.some(
          (fc) =>
            fc.toLowerCase().includes(i.color!.toLowerCase()) ||
            i.color!.toLowerCase().includes(fc.toLowerCase()),
        ),
      );
      styleAlignment = Math.round((aligned.length / wornItems.length) * 100);
    }
  }

  // Gap analysis
  const missingCategories = ALL_CATEGORIES.filter((c) => !byCategory[c]);
  const underrepresented = ALL_CATEGORIES.filter(
    (c) => byCategory[c] > 0 && byCategory[c] < 2,
  );
  const overrepresented = Object.entries(byCategory)
    .filter(([, count]) => count / items.length > 0.35)
    .map(([cat]) => cat);

  const recommendations: string[] = [];
  if (missingCategories.includes("footwear"))
    recommendations.push("Add footwear to complete your outfits.");
  if (missingCategories.includes("outerwear"))
    recommendations.push(
      "Outerwear expands your outfit options across seasons.",
    );
  if (missingCategories.includes("accessories"))
    recommendations.push(
      "Accessories can elevate any look — even a simple belt or watch.",
    );
  if (utilisation < 40)
    recommendations.push(
      `${unusedItems.length} items haven't been worn yet — try styling them in your next outfit.`,
    );
  if (outfits.length === 0)
    recommendations.push(
      "Generate your first outfit to see your outfit potential score grow.",
    );
  if (styleAlignment < 40 && favouriteColors.length > 0)
    recommendations.push(
      "You often wear colours outside your style profile — consider updating your colour preferences.",
    );
  if (overrepresented.length > 0)
    recommendations.push(
      `${Math.round((byCategory[overrepresented[0]] / items.length) * 100)}% of your wardrobe is ${overrepresented[0]} — balance with other categories.`,
    );
  if (recommendations.length === 0)
    recommendations.push(
      "Great wardrobe balance! Keep wearing the full range of what you own.",
    );

  const gapAnalysis: GapAnalysis = {
    missingCategories,
    underrepresented,
    overrepresented,
    recommendations,
  };

  // Worn by day (last 30)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const wornByDayMap = new Map<string, { outfits: number; items: number }>();
  for (const outfit of outfits) {
    if (outfit.wornAt && outfit.wornAt > thirtyDaysAgo) {
      const key = outfit.wornAt.toISOString().slice(0, 10);
      const cur = wornByDayMap.get(key) ?? { outfits: 0, items: 0 };
      wornByDayMap.set(key, {
        outfits: cur.outfits + 1,
        items: cur.items + outfit.outfitItems.length,
      });
    }
  }
  const wornByDay = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const entry = wornByDayMap.get(key) ?? { outfits: 0, items: 0 };
    return { date: key, ...entry };
  });

  // Health history
  const healthHistory = snapshots.map((s) => ({
    date: s.snappedAt.toISOString().slice(0, 10),
    healthScore: s.healthScore,
  }));
  const todayKey = new Date().toISOString().slice(0, 10);
  if (
    !healthHistory.length ||
    healthHistory[healthHistory.length - 1].date !== todayKey
  ) {
    healthHistory.push({ date: todayKey, healthScore });
  }

  // Persist today's snapshot
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const existingToday = await prisma.healthSnapshot.findFirst({
    where: { userId, snappedAt: { gte: startOfDay } },
  });
  if (!existingToday) {
    await prisma.healthSnapshot
      .create({
        data: {
          userId,
          healthScore,
          variety: Math.round(variety),
          utilisation: Math.round(utilisation),
          totalItems: items.length,
        },
      })
      .catch(() => {});
  }

  return {
    totalItems: items.length,
    byCategory,
    byColor,
    unusedItems,
    mostWornItems,
    healthScore,
    outfitPotential: Math.round(outfitPotential),
    variety: Math.round(variety),
    utilisation: Math.round(utilisation),
    totalOutfits: outfits.length,
    wornOutfits,
    averageWornCount,
    styleAlignment,
    gapAnalysis,
    wornByDay,
    healthHistory,
  };
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const data = await getAnalyticsData(session.user.id);
  return <AnalyticsClient {...data} />;
}
