import { NextRequest } from "next/server";
import { ok, err, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

/** POST /api/outfits/:id/wear — increment worn count on outfit + all items */
export async function POST(_req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const outfit = await prisma.outfit.findFirst({
    where:   { id, userId },
    include: { outfitItems: { select: { wardrobeItemId: true } } },
  });
  if (!outfit) return err("Outfit not found", 404);

  const now = new Date();
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

  return ok({ wornCount: (outfit.wornCount ?? 0) + 1 });
}
