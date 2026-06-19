import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { updateWardrobeItemSchema } from "@/schemas/wardrobe";

interface Params { params: Promise<{ id: string }> }

async function getItemForUser(id: string, userId: string) {
  return prisma.wardrobeItem.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const item = await getItemForUser(id, userId);
  if (!item) return err("Item not found", 404);

  return ok(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await getItemForUser(id, userId);
  if (!existing) return err("Item not found", 404);

  const body   = await req.json();
  const parsed = updateWardrobeItemSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const updated = await prisma.wardrobeItem.update({
    where: { id },
    data:  parsed.data,
  });

  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await getItemForUser(id, userId);
  if (!existing) return err("Item not found", 404);

  await prisma.wardrobeItem.delete({ where: { id } });

  return ok({ deleted: true });
}
