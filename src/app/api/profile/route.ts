import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { updateProfileSchema } from "@/schemas/profile";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      id:           true,
      name:         true,
      email:        true,
      avatarUrl:    true,
      onboarded:    true,
      createdAt:    true,
      styleProfile: true,
    },
  });

  if (!user) return err("User not found", 404);
  return ok(user);
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body   = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const updated = await prisma.user.update({
    where:  { id: userId },
    data:   parsed.data,
    select: { id: true, name: true, email: true, avatarUrl: true, onboarded: true },
  });

  return ok(updated);
}
