import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/health-snapshot
 *
 * Weekly cron job that snapshots every user's health score.
 * Called by Vercel Cron (configured in vercel.json) once per day.
 * Only persists if no snapshot exists today for a given user.
 *
 * Auth: CRON_SECRET header must match env var.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true },
    where:  { onboarded: true },
  });

  let snapped  = 0;
  let skipped  = 0;
  let errored  = 0;

  const today     = new Date();
  today.setHours(0, 0, 0, 0);

  for (const { id: userId } of users) {
    try {
      // Skip if already snapped today
      const existing = await prisma.healthSnapshot.findFirst({
        where: { userId, snappedAt: { gte: today } },
      });
      if (existing) { skipped++; continue; }

      // Compute score
      const [items, outfitCount] = await prisma.$transaction([
        prisma.wardrobeItem.findMany({ where: { userId }, select: { wornCount: true, category: true } }),
        prisma.outfit.count({ where: { userId } }),
      ]);

      if (items.length === 0) continue;

      const byCategory: Record<string, number> = {};
      for (const item of items) {
        if (item.category) byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
      }

      const categoryCount   = Object.keys(byCategory).length;
      const variety         = Math.min(100, (categoryCount / 6) * 100);
      const utilisedCount   = items.filter((i) => i.wornCount > 0).length;
      const utilisation     = Math.min(100, (utilisedCount / items.length) * 100);
      const outfitPotential = Math.min(100, (outfitCount / Math.max(1, items.length / 3)) * 100);
      const healthScore     = Math.round((variety * 0.3) + (utilisation * 0.5) + (outfitPotential * 0.2));

      await prisma.healthSnapshot.create({
        data: {
          userId,
          healthScore,
          variety:     Math.round(variety),
          utilisation: Math.round(utilisation),
          totalItems:  items.length,
        },
      });

      snapped++;
    } catch {
      errored++;
    }
  }

  return NextResponse.json({ snapped, skipped, errored, users: users.length });
}
