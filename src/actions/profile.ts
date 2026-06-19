"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, styleProfileSchema } from "@/schemas/profile";
import { revalidatePath } from "next/cache";
import type { ApiResponse, StyleProfile, User } from "@/types";

// ─── Update basic profile ────────────────────────────────────────────────────

export async function updateProfile(data: unknown): Promise<ApiResponse<Partial<User>>> {
const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message };

  const updated = await prisma.user.update({
    where:  { id: session.user.id },
    data:   parsed.data,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  revalidatePath("/profile");
  return { data: updated, error: null };
}

// ─── Upsert style profile ─────────────────────────────────────────────────────

export async function saveStyleProfile(
  data: unknown
): Promise<ApiResponse<StyleProfile>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const parsed = styleProfileSchema.safeParse(data);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message };

  const profile = await prisma.styleProfile.upsert({
    where:  { userId: session.user.id },
    update: {
      styleTypes:         parsed.data.styleTypes,
      favoriteColors:     parsed.data.favoriteColors ?? [],
      fashionPreferences: parsed.data.fashionPreferences ?? {},
    },
    create: {
      userId:             session.user.id,
      styleTypes:         parsed.data.styleTypes,
      favoriteColors:     parsed.data.favoriteColors ?? [],
      fashionPreferences: parsed.data.fashionPreferences ?? {},
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { data: profile, error: null };
}

// ─── Complete onboarding ─────────────────────────────────────────────────────

export async function completeOnboarding(): Promise<ApiResponse<{ onboarded: boolean }>> {
const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { onboarded: true },
  });

  revalidatePath("/dashboard");
  return { data: { onboarded: true }, error: null };
}
