import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://clozest.vercel.app";
  const now     = new Date();

  return [
    {
      url:            baseUrl,
      lastModified:   now,
      changeFrequency:"weekly",
      priority:       1,
    },
    {
      url:            `${baseUrl}/register`,
      lastModified:   now,
      changeFrequency:"monthly",
      priority:       0.8,
    },
    {
      url:            `${baseUrl}/login`,
      lastModified:   now,
      changeFrequency:"monthly",
      priority:       0.7,
    },
  ];
}
