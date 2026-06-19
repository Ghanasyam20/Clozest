import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth, checkRateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  itemIds:    z.array(z.string().uuid()).min(1).max(20, "Max 20 items per batch"),
  skipExisting: z.boolean().default(true), // skip already-classified items
});

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  // Rate limit: 5 bulk requests per 10 minutes
  const rl = checkRateLimit(`bulk-classify:${userId}`, 5, 600_000);
  if (!rl.allowed) return err("Rate limit reached. Please wait before bulk classifying again.", 429);

  const body   = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { itemIds, skipExisting } = parsed.data;

  // Fetch items belonging to this user
  const items = await prisma.wardrobeItem.findMany({
    where: {
      id:     { in: itemIds },
      userId,
      ...(skipExisting && { aiClassified: false }),
    },
    select: { id: true, imageUrl: true, aiClassified: true },
  });

  if (items.length === 0) {
    return ok({ processed: 0, skipped: itemIds.length, results: [] });
  }

  const aiUrl    = process.env.AI_SERVICE_URL;
  const aiSecret = process.env.AI_SERVICE_SECRET;
  const aiEnabled = process.env.NEXT_PUBLIC_AI_CLASSIFICATION_ENABLED === "true";
  const AI_MODEL_VERSION = "clip-vit-base-patch32-v1";

  const results: { itemId: string; success: boolean; error?: string }[] = [];

  // Process sequentially to avoid overwhelming Render free tier
  for (const item of items) {
    try {
      let classification: Record<string, unknown>;

      if (!aiEnabled || !aiUrl) {
        // Mock for dev
        classification = {
          category: "tops", color: "black", fabric: "cotton",
          pattern: "solid", season: ["spring", "summer"], style: "casual", confidence: 0.85,
        };
      } else {
        const res = await fetch(`${aiUrl}/classify`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Secret": aiSecret ?? "",
          },
          body:   JSON.stringify({ image_url: item.imageUrl }),
          signal: AbortSignal.timeout(40_000),
        });

        if (!res.ok) throw new Error(`AI service returned ${res.status}`);
        classification = await res.json();
      }

      await prisma.wardrobeItem.update({
        where: { id: item.id },
        data: {
          category:        (classification.category as string) || undefined,
          color:           (classification.color    as string) || undefined,
          fabric:          (classification.fabric   as string) || undefined,
          pattern:         (classification.pattern  as string) || undefined,
          season:          Array.isArray(classification.season) && classification.season.length > 0
                             ? classification.season as string[]
                             : undefined,
          style:           (classification.style    as string) || undefined,
          aiClassified:    true,
          aiConfidence:    (classification.confidence as number) ?? null,
          aiClassifiedAt:  new Date(),
          aiModelVersion:  AI_MODEL_VERSION,
        },
      });

      results.push({ itemId: item.id, success: true });

      // Throttle between items — be kind to free tier
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      results.push({ itemId: item.id, success: false, error: (e as Error).message });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed    = results.filter((r) => !r.success).length;
  const skipped   = itemIds.length - items.length;

  return ok({ processed: succeeded, failed, skipped, results });
}
