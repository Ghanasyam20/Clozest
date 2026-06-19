import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemDetailClient } from "@/features/closet/components/ItemDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.wardrobeItem.findUnique({
    where: { id },
    select: { name: true, category: true },
  });
  const label = item?.name ?? item?.category ?? "Item";
  return { title: `${label} — My Closet` };
}

export default async function ItemDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const { id } = await params;

  const item = await prisma.wardrobeItem.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!item) notFound();

  return (
    <div className="max-w-3xl animate-fade-in">
      <ItemDetailClient item={item} />
    </div>
  );
}
