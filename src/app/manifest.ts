import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Clozest",
    short_name:       "Clozest",
    description:      "Your AI-Powered Digital Wardrobe & Personal Stylist",
    start_url:        "/dashboard",
    display:          "standalone",
    background_color: "#0F0F10",
    theme_color:      "#0F0F10",
    orientation:      "portrait",
    icons: [
      {
        src:   "/icons/icon-192.png",
        sizes: "192x192",
        type:  "image/png",
      },
      {
        src:   "/icons/icon-512.png",
        sizes: "512x512",
        type:  "image/png",
      },
      {
        src:     "/icons/icon-512.png",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["lifestyle", "shopping", "fashion"],
  };
}
