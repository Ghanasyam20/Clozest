import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Clozest Design System ─────────────────────────────
        background:  "hsl(var(--background))",
        surface:     "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        border:      "hsl(var(--border))",
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          muted:      "hsl(var(--accent-muted))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted:   "hsl(var(--foreground-muted))",
          faint:   "hsl(var(--foreground-faint))",
        },
        // ── Shadcn compatibility ───────────────────────────────
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },

      fontFamily: {
        sans:    ["var(--font-sans)", ...fontFamily.sans],
        mono:    ["var(--font-mono)", ...fontFamily.mono],
        display: ["var(--font-cormorant)", ...fontFamily.serif],
      },

      fontSize: {
        "display-2xl": ["4.5rem",  { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-xl":  ["3.75rem", { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-lg":  ["3rem",    { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md":  ["2.25rem", { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
        "display-sm":  ["1.875rem",{ lineHeight: "1.25", letterSpacing: "-0.01em" }],
      },

      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-slow": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "pulse-accent": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0.4)" },
          "50%":      { boxShadow: "0 0 0 8px hsl(var(--accent) / 0)" },
        },
      },

      animation: {
        "accordion-down":   "accordion-down 0.2s ease-out",
        "accordion-up":     "accordion-up 0.2s ease-out",
        shimmer:            "shimmer 2s infinite linear",
        "fade-in":          "fade-in 0.4s ease-out forwards",
        "fade-in-slow":     "fade-in-slow 0.8s ease-out forwards",
        "slide-in-right":   "slide-in-right 0.4s ease-out forwards",
        float:              "float 3s ease-in-out infinite",
        "pulse-accent":     "pulse-accent 2s ease-in-out infinite",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },

      transitionTimingFunction: {
        "out-expo":  "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
