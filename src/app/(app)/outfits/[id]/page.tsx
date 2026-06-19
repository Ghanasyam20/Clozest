import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OutfitDetailClient } from "@/features/outfits/components/OutfitDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const outfit = await prisma.outfit.findUnique({
    where: { id },
    select: { name: true, occasion: true },
  });
  const label = outfit?.name ?? outfit?.occasion ?? "Outfit";
  return { title: `${label} — Outfits` };
}

export default async function OutfitDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const { id } = await params;

  const outfit = await prisma.outfit.findFirst({
    where: { id, userId: session.user.id },
    include: {
      outfitItems: {
        include: { wardrobeItem: true },
        orderBy: { wardrobeItem: { category: "asc" } },
      },
    },
  });

  if (!outfit) notFound();

  return (
    <div className="max-w-3xl animate-fade-in">
      <OutfitDetailClient outfit={outfit} />
    </div>
  );
}
