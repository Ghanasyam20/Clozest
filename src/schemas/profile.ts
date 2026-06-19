import { z } from "zod";

export const STYLE_AESTHETICS = [
  "minimalist",
  "streetwear",
  "korean",
  "old-money",
  "formal",
  "vintage",
  "bohemian",
  "athleisure",
  "preppy",
  "dark-academia",
] as const;

export const updateProfileSchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const styleProfileSchema = z.object({
  styleTypes:         z.array(z.enum(STYLE_AESTHETICS)).min(1, "Select at least one style"),
  favoriteColors:     z.array(z.string()).max(10).optional(),
  fashionPreferences: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ])).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type StyleProfileInput  = z.infer<typeof styleProfileSchema>;