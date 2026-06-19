import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SavedOutfitsClient } from "@/features/outfits/components/SavedOutfitsClient";

export const metadata: Metadata = { title: "Saved Outfits" };

export default async function OutfitsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const outfits = await prisma.outfit.findMany({
    where: { userId: session.user.id },
    include: {
      outfitItems: {
        include: { wardrobeItem: true },
      },
    },
    orderBy: { generatedAt: "desc" },
    take: 60,
  });

  return <SavedOutfitsClient outfits={outfits} />;
}
