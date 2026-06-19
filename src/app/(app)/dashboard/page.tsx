import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/features/dashboard/components/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(userId: string) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [user, items, outfitCount] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboarded: true, styleProfile: true, name: true },
    }),
    prisma.wardrobeItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.outfit.count({ where: { userId } }),
  ]);

  // Check onboarding from DB — not from JWT (JWT can be stale)
  if (!user?.onboarded) {
    redirect("/onboarding/style");
  }

  const byCategory: Record<string, number> = {};
  for (const item of items) {
    if (item.category)
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }

  const unusedItems = items.filter(
    (i) => i.wornCount === 0 && new Date(i.createdAt) < fourteenDaysAgo,
  );

  const categoryCount = Object.keys(byCategory).length;
  const variety = Math.min(100, (categoryCount / 6) * 100);
  const utilisedCount = items.filter((i) => i.wornCount > 0).length;
  const utilisation =
    items.length > 0 ? Math.min(100, (utilisedCount / items.length) * 100) : 0;
  const outfitPotential = Math.min(
    100,
    (outfitCount / Math.max(1, items.length / 3)) * 100,
  );
  const healthScore = Math.round(
    variety * 0.3 + utilisation * 0.5 + outfitPotential * 0.2,
  );

  const underutilisedItems = [...items]
    .filter((i) => new Date(i.createdAt) < fourteenDaysAgo)
    .sort((a, b) => {
      if (a.wornCount !== b.wornCount) return a.wornCount - b.wornCount;
      const aDate = a.lastWorn ? new Date(a.lastWorn).getTime() : 0;
      const bDate = b.lastWorn ? new Date(b.lastWorn).getTime() : 0;
      return aDate - bDate;
    })
    .slice(0, 6);

  return {
    totalItems: items.length,
    recentItems: items.slice(0, 8),
    underutilisedItems,
    totalOutfits: outfitCount,
    styleProfile: user?.styleProfile ?? null,
    healthScore,
    unusedCount: unusedItems.length,
    categoryCount,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const data = await getDashboardData(session.user.id);

  return (
    <DashboardClient firstName={firstName} userId={session.user.id} {...data} />
  );
}
