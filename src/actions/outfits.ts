"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveOutfitSchema } from "@/schemas/outfit";
import { revalidatePath } from "next/cache";
import type { ApiResponse, OutfitWithItems } from "@/types";

// ─── Save outfit ──────────────────────────────────────────────────────────────

export async function saveOutfit(data: unknown): Promise<ApiResponse<OutfitWithItems>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const parsed = saveOutfitSchema.safeParse(data);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message };

  const { itemIds, ...outfitData } = parsed.data;

  // Verify ownership
  const items = await prisma.wardrobeItem.findMany({
    where:  { id: { in: itemIds }, userId: session.user.id },
    select: { id: true },
  });
  if (items.length !== itemIds.length) {
    return { data: null, error: "One or more items not found in your wardrobe" };
  }

  // Compute items hash for deduplication
  const sortedIds = [...itemIds].sort();
  const itemsHash = sortedIds.join("|");

  const outfit = await prisma.outfit.create({
    data: {
      userId:  session.user.id,
      ...outfitData,
      itemsHash,
      savedAt: new Date(),
      outfitItems: {
        create: itemIds.map((wardrobeItemId) => ({ wardrobeItemId })),
      },
    },
    include: {
      outfitItems: { include: { wardrobeItem: true } },
    },
  });

  revalidatePath("/outfits");
  revalidatePath("/dashboard");
  return { data: outfit as OutfitWithItems, error: null };
}

// ─── Delete outfit ────────────────────────────────────────────────────────────

export async function deleteOutfit(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const existing = await prisma.outfit.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { data: null, error: "Outfit not found" };

  await prisma.outfit.delete({ where: { id } });

  revalidatePath("/outfits");
  revalidatePath("/dashboard");
  return { data: { deleted: true }, error: null };
}

// ─── Wear outfit today ────────────────────────────────────────────────────────
// Increments wornCount on outfit AND on every wardrobe item in it

export async function wearOutfit(
  id: string
): Promise<ApiResponse<{ wornCount: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const outfit = await prisma.outfit.findFirst({
    where:   { id, userId: session.user.id },
    include: { outfitItems: { select: { wardrobeItemId: true } } },
  });
  if (!outfit) return { data: null, error: "Outfit not found" };

  const now = new Date();

  // Update outfit wear stats + all wardrobe items in one transaction
  await prisma.$transaction([
    prisma.outfit.update({
      where: { id },
      data:  { wornCount: { increment: 1 }, wornAt: now },
    }),
    ...outfit.outfitItems.map((oi) =>
      prisma.wardrobeItem.update({
        where: { id: oi.wardrobeItemId },
        data:  { wornCount: { increment: 1 }, lastWorn: now },
      })
    ),
  ]);

  revalidatePath("/outfits");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  return { data: { wornCount: outfit.wornCount + 1 }, error: null };
}

// ─── Update outfit (name / notes) ─────────────────────────────────────────────

export async function updateOutfit(
  id:   string,
  data: { name?: string; notes?: string }
): Promise<ApiResponse<{ id: string; name: string | null; notes: string | null }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const existing = await prisma.outfit.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { data: null, error: "Outfit not found" };

  const updated = await prisma.outfit.update({
    where:  { id },
    data:   { name: data.name, notes: data.notes },
    select: { id: true, name: true, notes: true },
  });

  revalidatePath("/outfits");
  revalidatePath(`/outfits/${id}`);
  return { data: updated, error: null };
}
