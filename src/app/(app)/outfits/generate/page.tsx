import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OutfitGeneratorClient } from "@/features/outfits/components/OutfitGeneratorClient";

export const metadata: Metadata = { title: "Generate Outfit" };

export default async function GenerateOutfitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [wardrobeCount, styleProfile] = await prisma.$transaction([
    prisma.wardrobeItem.count({ where: { userId: session.user.id } }),
    prisma.styleProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <OutfitGeneratorClient
      wardrobeCount={wardrobeCount}
      styleProfile={styleProfile}
    />
  );
}
