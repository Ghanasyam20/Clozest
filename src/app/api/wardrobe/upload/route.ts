import { NextRequest } from "next/server";
import { ok, err, requireAuth, validateImageFile } from "@/lib/api";
import { uploadImage } from "@/services/storage";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return err("Invalid form data", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) return err("No file provided", 400);

  const validation = validateImageFile(file);
  if (!validation.valid) return err(validation.reason, 400);

  try {
    const { publicUrl } = await uploadImage(file, userId, "WARDROBE");

    const item = await prisma.wardrobeItem.create({
      data: { userId, imageUrl: publicUrl },
    });

    return ok(item, 201);
  } catch (e) {
    console.error("[upload]", e);
    return err("Upload failed. Please try again.", 500);
  }
}

// Max request size — enforced at Next.js layer via next.config.ts
export const config = {
  api: { bodyParser: false },
};
