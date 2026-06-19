"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Layers, Shirt, Wind, Watch, Footprints } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All", icon: Layers },
  { value: "tops", label: "Tops", icon: Shirt },
  { value: "bottoms", label: "Bottoms", icon: Wind },
  { value: "dresses", label: "Dresses", icon: Dress },
  { value: "outerwear", label: "Outerwear", icon: Shirt },
  { value: "footwear", label: "Footwear", icon: Footprints },
  { value: "accessories", label: "Accessories", icon: Watch },
] as const;

interface FilterBarProps {
  category: string;
  onCategory: (v: string) => void;
  search?: string;
  onSearch?: (s: string) => void;
  total?: number;
  filtered?: number;
}

export function FilterBar({ category, onCategory, total }: FilterBarProps) {
  return (
    <div className="space-y-4">
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
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.4,
                  }}
                />
              )}

              <span className="relative flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </span>
            </button>
          );
        })}

        <span className="ml-auto text-xs text-foreground-faint">
          {total ?? 0} {(total ?? 0) === 1 ? "item" : "items"}
        </span>
      </div>
    </div>
  );
}

// Lucide doesn't have a Dress icon
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
