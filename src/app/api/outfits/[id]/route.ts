import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const outfit = await prisma.outfit.findFirst({
    where:   { id, userId },
    include: { outfitItems: { include: { wardrobeItem: true } } },
  });

  if (!outfit) return err("Outfit not found", 404);
  return ok(outfit);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.outfit.findFirst({ where: { id, userId } });
  if (!existing) return err("Outfit not found", 404);

  await prisma.outfit.delete({ where: { id } });
  return ok({ deleted: true });
}
