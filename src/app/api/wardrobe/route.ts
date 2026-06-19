import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth, checkRateLimit } from "@/lib/api";
import { wardrobeItemSchema } from "@/schemas/wardrobe";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const season   = searchParams.get("season")   ?? undefined;
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));

  const [items, total] = await prisma.$transaction([
    prisma.wardrobeItem.findMany({
      where: {
        userId,
        ...(category && { category }),
        ...(season && { season: { has: season } }),
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.wardrobeItem.count({
      where: {
        userId,
        ...(category && { category }),
        ...(season && { season: { has: season } }),
      },
    }),
  ]);

  return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  // Rate limit: 30 uploads per minute per user
  const rl = checkRateLimit(`wardrobe:${userId}`, 30, 60_000);
  if (!rl.allowed) return err("Too many requests. Please slow down.", 429);

  const body   = await req.json();
  const parsed = wardrobeItemSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const item = await prisma.wardrobeItem.create({
    data: { userId, ...parsed.data },
  });

  return ok(item, 201);
}
