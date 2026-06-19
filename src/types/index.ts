import type { WardrobeItem, Outfit, OutfitItem, StyleProfile, User } from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type { WardrobeItem, Outfit, StyleProfile, User };

// Classification status derived from WardrobeItem
export type ClassificationStatus = "classified" | "unclassified" | "low_confidence";

// ─── Extended types ───────────────────────────────────────────────────────────

export type OutfitWithItems = Outfit & {
  outfitItems: (OutfitItem & {
    wardrobeItem: WardrobeItem;
  })[];
  // Phase 5 fields
  name?:       string | null;
  notes?:      string | null;
  wornCount?:  number;
  wornAt?:     Date | null;
  itemsHash?:  string | null;
};

export type WardrobeItemWithOutfits = WardrobeItem & {
  outfitItems: OutfitItem[];
};

// ─── API response envelope ────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface WardrobeAnalytics {
  totalItems:       number;
  byCategory:       Record<string, number>;
  byColor:          Record<string, number>;
  unusedItems:      WardrobeItem[];
  mostWornItems:    WardrobeItem[];
  healthScore:      number;
  outfitPotential:  number;
  variety:          number;
  utilisation:      number;
  // Phase 6 additions
  totalOutfits:     number;
  wornOutfits:      number;
  averageWornCount: number;
  styleAlignment:   number;       // 0-100: worn colours vs stated preferences
  gapAnalysis:      GapAnalysis;
  wornByDay:        WornByDay[];  // last 30 days wear activity
  healthHistory:    HealthSnapshot[];
}

export interface GapAnalysis {
  missingCategories:   string[];   // categories with 0 items
  underrepresented:    string[];   // categories with < 2 items
  overrepresented:     string[];   // categories with > 30% of total
  recommendations:     string[];   // human-readable suggestions
}

export interface WornByDay {
  date:     string;  // ISO date
  outfits:  number;
  items:    number;
}

export interface HealthSnapshot {
  date:        string;
  healthScore: number;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;   // celsius
  condition:   string;
  humidity?:   number;
  windSpeed?:  number;
  isRaining?:  boolean;
  location?:   string;
}

// ─── AI service ───────────────────────────────────────────────────────────────

export interface ClassificationResult {
  category: string;
  color:    string;
  fabric:   string;
  pattern:  string;
  season:   string[];
  style:    string;
  confidence: number;
}

export interface OutfitGenerationResult {
  items:          WardrobeItem[];
  confidenceScore: number;
  reasoning:      string;
}

// ─── Session extension ────────────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    id:        string;
    onboarded: boolean;
  }
  interface Session {
    user: User & {
      id:        string;
      onboarded: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:        string;
    onboarded: boolean;
  }
}
