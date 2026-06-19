"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Layers, Shirt, Wind, Watch, Footprints } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All", icon: Layers },
  { value: "tops", label: "Tops", icon: Shirt },
  { value: "bottoms", label: "Bottoms", icon: Wind },
  { value: "dresses", label: "Dresses", icon: Dress },
  { value: "outerwear", label: "Outerwear", icon: Shirt },
  { value: "footwear", label: "Footwear", icon: Footprints },
  { value: "accessories", label: "Accessories", icon: Watch },
] as const;

const SEASONS = [
  { value: "", label: "All seasons" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
] as const;

interface FilterBarProps {
  category: string;
  season: string;
  totalItems: number;
  onCategory: (v: string) => void;
  onSeason: (v: string) => void;
}

export function FilterBar({
  category,
  season,
  totalItems,
  onCategory,
  onSeason,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const active = category === cat.value;
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value)}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                active
                  ? "text-accent-foreground"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-2",
              )}
            >
              {active && (
                <motion.div
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </span>
            </button>
          );
        })}

        {/* Item count */}
        <span className="ml-auto text-xs text-foreground-faint">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Season filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground-faint mr-1">Season:</span>
        {SEASONS.map((s) => (
          <button
            key={s.value}
            onClick={() => onSeason(s.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
              season === s.value
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border text-foreground-faint hover:text-foreground-muted hover:border-border/80",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Lucide doesn't have a Dress icon — create a minimal SVG stand-in
function Dress(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 3h6l1 7H8L9 3z" />
      <path d="M8 10l-4 11h16L16 10" />
    </svg>
  );
}
