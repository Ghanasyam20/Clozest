import { NextRequest } from "next/server";
import { prisma }      from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { styleProfileSchema }   from "@/schemas/profile";

/** GET /api/profile/style — fetch current style profile */
export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const profile = await prisma.styleProfile.findUnique({
    where: { userId },
  });

  return ok(profile);
}

/** POST /api/profile/style — upsert style profile */
export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body   = await req.json();
  const parsed = styleProfileSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const profile = await prisma.styleProfile.upsert({
    where:  { userId },
    update: {
      styleTypes:         parsed.data.styleTypes,
      favoriteColors:     parsed.data.favoriteColors     ?? [],
      fashionPreferences: parsed.data.fashionPreferences ?? {},
    },
    create: {
      userId,
      styleTypes:         parsed.data.styleTypes,
      favoriteColors:     parsed.data.favoriteColors     ?? [],
      fashionPreferences: parsed.data.fashionPreferences ?? {},
    },
  });

  return ok(profile, 201);
}
