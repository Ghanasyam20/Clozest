import { z } from "zod";

export const OCCASIONS = ["casual", "work", "formal", "date", "sport", "travel", "party"] as const;

export const weatherDataSchema = z.object({
  temperature: z.number(),
  condition:   z.string(),
  humidity:    z.number().optional(),
  windSpeed:   z.number().optional(),
  isRaining:   z.boolean().optional(),
});

export const generateOutfitSchema = z.object({
  occasion:     z.enum(OCCASIONS),
  weatherData:  weatherDataSchema.optional(),
  styleProfile: z
    .object({
      styleTypes:         z.array(z.string()),
      favoriteColors:     z.array(z.string()).optional(),
      fashionPreferences: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export const saveOutfitSchema = z.object({
  name:            z.string().max(100).optional(),
  notes:           z.string().max(500).optional(),
  occasion:        z.enum(OCCASIONS).optional(),
  weatherData:     weatherDataSchema.optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  itemIds:         z.array(z.string().uuid()).min(1, "At least one item required"),
  itemsHash:       z.string().optional(),
});

export type GenerateOutfitInput = z.infer<typeof generateOutfitSchema>;
export type SaveOutfitInput     = z.infer<typeof saveOutfitSchema>;
export type WeatherData         = z.infer<typeof weatherDataSchema>;
