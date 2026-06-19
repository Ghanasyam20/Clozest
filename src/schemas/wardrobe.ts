import { z } from "zod";

export const CATEGORIES = ["tops", "bottoms", "footwear", "accessories", "outerwear", "dresses"] as const;
export const SEASONS    = ["spring", "summer", "autumn", "winter"] as const;
export const PATTERNS   = ["solid", "stripes", "plaid", "floral", "geometric", "animal", "abstract", "other"] as const;

export const wardrobeItemSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  name:     z.string().max(100).optional(),
  category: z.enum(CATEGORIES).optional(),
  color:    z.string().max(50).optional(),
  fabric:   z.string().max(100).optional(),
  pattern:  z.enum(PATTERNS).optional(),
  season:   z.array(z.enum(SEASONS)).optional(),
  style:    z.string().max(100).optional(),
});

export const updateWardrobeItemSchema = wardrobeItemSchema.partial().omit({ imageUrl: true });

export type WardrobeItemInput       = z.infer<typeof wardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof updateWardrobeItemSchema>;
