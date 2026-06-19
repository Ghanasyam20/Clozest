"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/services/storage";
import { validateImageFile } from "@/lib/api";
import { updateWardrobeItemSchema } from "@/schemas/wardrobe";
import { revalidatePath } from "next/cache";
import type { ApiResponse, WardrobeItem } from "@/types";

// ─── Upload wardrobe item ────────────────────────────────────────────────────

export async function uploadWardrobeItem(
  formData: FormData
): Promise<ApiResponse<WardrobeItem>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const file = formData.get("file") as File | null;
  if (!file) return { data: null, error: "No file provided" };

  const validation = validateImageFile(file);
  if (!validation.valid) return { data: null, error: validation.reason };

  try {
    const { publicUrl } = await uploadImage(file, session.user.id, "WARDROBE");

    const item = await prisma.wardrobeItem.create({
      data: { userId: session.user.id, imageUrl: publicUrl },
    });

    revalidatePath("/closet");
    revalidatePath("/dashboard");
    return { data: item, error: null };
  } catch (e) {
    console.error("[uploadWardrobeItem]", e);
    return { data: null, error: "Upload failed. Please try again." };
  }
}

// ─── Update wardrobe item ────────────────────────────────────────────────────

export async function updateWardrobeItem(
  id:   string,
  data: unknown
): Promise<ApiResponse<WardrobeItem>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const parsed = updateWardrobeItemSchema.safeParse(data);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message };

  const existing = await prisma.wardrobeItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { data: null, error: "Item not found" };

  const updated = await prisma.wardrobeItem.update({
    where: { id },
    data:  parsed.data,
  });

  revalidatePath("/closet");
  revalidatePath(`/closet/${id}`);
  return { data: updated, error: null };
}

// ─── Delete wardrobe item ─────────────────────────────────────────────────────

export async function deleteWardrobeItem(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const existing = await prisma.wardrobeItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { data: null, error: "Item not found" };

  // Extract storage path from URL for cleanup
  try {
    const url     = new URL(existing.imageUrl);
    const segments = url.pathname.split("/");
    const bucketIdx = segments.findIndex((s) => s === "wardrobe-items");
    if (bucketIdx !== -1) {
      const storagePath = segments.slice(bucketIdx + 1).join("/");
      await deleteImage(storagePath, "WARDROBE");
    }
  } catch {
    console.warn("[deleteWardrobeItem] Could not extract storage path");
  }

  await prisma.wardrobeItem.delete({ where: { id } });

  revalidatePath("/closet");
  revalidatePath("/dashboard");
  return { data: { deleted: true }, error: null };
}

// ─── Increment worn count ────────────────────────────────────────────────────

export async function markItemWorn(id: string): Promise<ApiResponse<WardrobeItem>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: null, error: "Unauthorised" };

  const existing = await prisma.wardrobeItem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { data: null, error: "Item not found" };

  const updated = await prisma.wardrobeItem.update({
    where: { id },
    data:  { wornCount: { increment: 1 }, lastWorn: new Date() },
  });

  revalidatePath("/closet");
  revalidatePath("/analytics");
  return { data: updated, error: null };
}
