import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://clozest.vercel.app";

  return {
    rules: [
      {
        userAgent:  "*",
        allow:      ["/", "/register", "/login"],
        disallow:   ["/dashboard", "/closet", "/outfits", "/analytics", "/profile", "/settings", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
