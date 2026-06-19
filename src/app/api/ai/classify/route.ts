import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth, checkRateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const AI_MODEL_VERSION = "clip-vit-base-patch32-v1";
const CONFIDENCE_THRESHOLD = 0.45; // Below this we flag as low-confidence

const classifySchema = z.object({
  imageUrl:  z.string().url("Invalid image URL"),
  itemId:    z.string().uuid("Invalid item ID").optional(),
});

// ── Mock classification for dev/flag-off mode ─────────────────────────────────
const MOCK_CLASSIFICATIONS = [
  { category: "tops",       color: "white",  fabric: "cotton",  pattern: "solid",   season: ["spring","summer"],           style: "minimalist", confidence: 0.91 },
  { category: "bottoms",    color: "navy",   fabric: "denim",   pattern: "solid",   season: ["spring","summer","autumn"],  style: "casual",     confidence: 0.88 },
  { category: "outerwear",  color: "black",  fabric: "wool",    pattern: "solid",   season: ["autumn","winter"],           style: "formal",     confidence: 0.85 },
  { category: "footwear",   color: "white",  fabric: "leather", pattern: "solid",   season: ["spring","summer"],           style: "casual",     confidence: 0.93 },
  { category: "accessories",color: "brown",  fabric: "leather", pattern: "solid",   season: ["spring","summer","autumn","winter"], style: "minimalist", confidence: 0.79 },
];

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  // Rate limit: 30 classifications per minute per user
  const rl = checkRateLimit(`classify:${userId}`, 30, 60_000);
  if (!rl.allowed) return err("Too many requests — please slow down.", 429);

  const body   = await req.json();
  const parsed = classifySchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { imageUrl, itemId } = parsed.data;

  // Verify item belongs to this user if itemId provided
  if (itemId) {
    const item = await prisma.wardrobeItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) return err("Item not found in your wardrobe", 404);
  }

  const aiUrl    = process.env.AI_SERVICE_URL;
  const aiSecret = process.env.AI_SERVICE_SECRET;
  const aiEnabled = process.env.NEXT_PUBLIC_AI_CLASSIFICATION_ENABLED === "true";

  let result: {
    category: string; color: string; fabric: string;
    pattern: string; season: string[]; style: string; confidence: number;
  };

  if (!aiEnabled || !aiUrl) {
    // ── Dev mode: deterministic mock based on imageUrl hash ───────────────────
    const hashIndex = imageUrl.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % MOCK_CLASSIFICATIONS.length;
    result = MOCK_CLASSIFICATIONS[hashIndex];
  } else {
    // ── Production: call FastAPI with retry on cold start ─────────────────────
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const timeout = attempt === 1 ? 35_000 : 15_000; // 35s first try (cold start), 15s retry
        const res = await fetch(`${aiUrl}/classify`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Secret": aiSecret ?? "",
          },
          body:   JSON.stringify({ image_url: imageUrl }),
          signal: AbortSignal.timeout(timeout),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          lastError = new Error(`AI service ${res.status}: ${text.slice(0, 200)}`);
          if (res.status === 422) break; // Validation error — don't retry
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          break;
        }

        result = await res.json();
        lastError = null;
        break;
      } catch (e) {
        lastError = e as Error;
        if (attempt < 2) {
          console.warn(`[AI Classify] Attempt ${attempt} failed, retrying…`, lastError.message);
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    if (lastError || !result!) {
      console.error("[AI Classify] All attempts failed:", lastError?.message);
      // Return graceful fallback — client shows manual form
      return err(
        "AI classification is warming up. Your image is saved — please fill in details manually, or try classifying again in a moment.",
        503
      );
    }
  }

  // ── Persist classification results to DB if itemId provided ───────────────
  if (itemId) {
    await prisma.wardrobeItem.update({
      where: { id: itemId },
      data: {
        category:          result!.category || undefined,
        color:             result!.color    || undefined,
        fabric:            result!.fabric   || undefined,
        pattern:           result!.pattern  || undefined,
        season:            result!.season?.length > 0 ? result!.season : undefined,
        style:             result!.style    || undefined,
        aiClassified:      true,
        aiConfidence:      result!.confidence,
        aiClassifiedAt:    new Date(),
        aiModelVersion:    AI_MODEL_VERSION,
      },
    });
  }

  // ── Enrich response with confidence interpretation ────────────────────────
  const confidence = result!.confidence;
  const isLowConfidence = confidence < CONFIDENCE_THRESHOLD;

  return ok({
    ...result!,
    isLowConfidence,
    confidenceLabel: confidence >= 0.85 ? "High"   :
                     confidence >= 0.65 ? "Medium" :
                     confidence >= 0.45 ? "Low"    : "Very Low",
    modelVersion: AI_MODEL_VERSION,
    persistedToItem: !!itemId,
  });
}
