import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { saveOutfitSchema } from "@/schemas/outfit";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit = Math.min(50,  parseInt(searchParams.get("limit") ?? "20", 10));

  const [outfits, total] = await prisma.$transaction([
    prisma.outfit.findMany({
      where:   { userId },
      include: {
        outfitItems: {
          include: { wardrobeItem: true },
        },
      },
      orderBy: { generatedAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.outfit.count({ where: { userId } }),
  ]);

  return ok({ outfits, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body   = await req.json();
  const parsed = saveOutfitSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { itemIds, ...outfitData } = parsed.data;

  // Verify all items belong to this user
  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: itemIds }, userId },
    select: { id: true },
  });

  if (items.length !== itemIds.length) {
    return err("One or more items not found in your wardrobe", 400);
  }

  const outfit = await prisma.outfit.create({
    data: {
      userId,
      ...outfitData,
      savedAt:     new Date(),
      outfitItems: {
        create: itemIds.map((wardrobeItemId) => ({ wardrobeItemId })),
      },
    },
    include: {
      outfitItems: { include: { wardrobeItem: true } },
    },
  });

  return ok(outfit, 201);
}
