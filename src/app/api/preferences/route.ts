import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const preferenceSchema = z.object({
  key:   z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
});

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const prefs = await prisma.userPreference.findMany({
    where: { userId },
  });

  return ok(prefs);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body   = await req.json();
  const parsed = preferenceSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const pref = await prisma.userPreference.upsert({
    where:  { userId_key: { userId, key: parsed.data.key } },
    update: { value: parsed.data.value },
    create: { userId, key: parsed.data.key, value: parsed.data.value },
  });

  return ok(pref);
}
