import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";

/**
 * GET /api/ai/warmup
 * Pings the FastAPI service to wake it from Render free-tier cold start.
 * Called client-side on first wardrobe/closet page load so classification
 * is ready by the time the user uploads an image.
 */
export async function GET(_req: NextRequest) {
  const aiUrl = process.env.AI_SERVICE_URL;
  if (!aiUrl) return ok({ status: "disabled" });

  try {
    const res = await fetch(`${aiUrl}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = res.ok ? await res.json() : null;
    return ok({ status: res.ok ? "ready" : "starting", detail: data });
  } catch {
    return ok({ status: "starting" }); // not an error — just waking up
  }
}
