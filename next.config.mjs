const nextConfig = {
  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "*.supabase.co",
        pathname:  "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname:  "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname:  "lh3.googleusercontent.com",
      },
    ],
    formats:  ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── Server Actions ─────────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // ── Compiler ───────────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Security headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control",    value: "on" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.supabase.co https://api.open-meteo.com https://geocoding-api.open-meteo.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source:      "/home",
        destination: "/",
        permanent:   true,
      },
      {
        source:      "/wardrobe",
        destination: "/closet",
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;
