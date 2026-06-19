import type { ClassificationResult, OutfitGenerationResult, WardrobeItem, WeatherData } from "@/types";

const AI_BASE   = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET ?? "";

async function aiRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_BASE}${path}`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Secret": AI_SECRET,
    },
    body:   JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`AI service error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function classifyClothing(imageUrl: string): Promise<ClassificationResult> {
  return aiRequest<ClassificationResult>("/classify", { image_url: imageUrl });
}

export async function generateOutfit(params: {
  occasion:     string;
  weatherData?: WeatherData;
  styleProfile?: { styleTypes: string[]; favoriteColors?: string[] };
  wardrobeItems: WardrobeItem[];
}): Promise<OutfitGenerationResult> {
  return aiRequest<OutfitGenerationResult>("/generate-outfit", {
    occasion:       params.occasion,
    weather_data:   params.weatherData,
    style_profile:  params.styleProfile,
    wardrobe_items: params.wardrobeItems,
  });
}
