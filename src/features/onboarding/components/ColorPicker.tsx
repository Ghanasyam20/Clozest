"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";

export const COLOR_OPTIONS: { name: string; hex: string; group: string }[] = [
  // Neutrals
  { name: "Black",     hex: "#1C1C1E", group: "Neutrals" },
  { name: "Charcoal",  hex: "#36363A", group: "Neutrals" },
  { name: "Grey",      hex: "#8E8E93", group: "Neutrals" },
  { name: "Silver",    hex: "#C7C7CC", group: "Neutrals" },
  { name: "White",     hex: "#F2F2F7", group: "Neutrals" },
  // Warm
  { name: "Cream",     hex: "#FFFDD0", group: "Warm" },
  { name: "Camel",     hex: "#C19A6B", group: "Warm" },
  { name: "Tan",       hex: "#D2B48C", group: "Warm" },
  { name: "Rust",      hex: "#B7410E", group: "Warm" },
  { name: "Burgundy",  hex: "#800020", group: "Warm" },
  // Cool
  { name: "Navy",      hex: "#1B2A4A", group: "Cool" },
  { name: "Cobalt",    hex: "#0047AB", group: "Cool" },
  { name: "Sky",       hex: "#87CEEB", group: "Cool" },
  { name: "Sage",      hex: "#9DC183", group: "Cool" },
  { name: "Forest",    hex: "#228B22", group: "Cool" },
  // Earthy
  { name: "Olive",     hex: "#6B7645", group: "Earthy" },
  { name: "Khaki",     hex: "#C3B091", group: "Earthy" },
  { name: "Terracotta",hex: "#E2725B", group: "Earthy" },
  { name: "Brick",     hex: "#9C4A37", group: "Earthy" },
  { name: "Mustard",   hex: "#FFDB58", group: "Earthy" },
  // Pastels
  { name: "Blush",     hex: "#FFB6C1", group: "Pastels" },
  { name: "Lavender",  hex: "#E6E6FA", group: "Pastels" },
  { name: "Mint",      hex: "#98FF98", group: "Pastels" },
  { name: "Peach",     hex: "#FFCBA4", group: "Pastels" },
  { name: "Lilac",     hex: "#C8A2C8", group: "Pastels" },
];

const MAX_COLORS = 5;

interface ColorPickerProps {
  selected: string[];
  onChange: (colors: string[]) => void;
}

export function ColorPicker({ selected, onChange }: ColorPickerProps) {
  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((c) => c !== name));
    } else if (selected.length < MAX_COLORS) {
      onChange([...selected, name]);
    }
  }

  const groups = [...new Set(COLOR_OPTIONS.map((c) => c.group))];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-xs text-foreground-faint tracking-widest uppercase mb-3">{group}</p>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.filter((c) => c.group === group).map(({ name, hex }) => {
              const isSelected  = selected.includes(name);
              const isDisabled  = !isSelected && selected.length >= MAX_COLORS;

              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  disabled={isDisabled}
                  title={name}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 transition-all duration-200",
                    isDisabled && "opacity-30 pointer-events-none"
                  )}
                >
                  <div className="relative">
                    <motion.div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all duration-200",
                        isSelected
                          ? "border-accent scale-110 shadow-lg shadow-accent/20"
                          : "border-transparent hover:border-foreground-faint hover:scale-105"
                      )}
                      style={{ backgroundColor: hex }}
                      whileTap={{ scale: 0.92 }}
                    />
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0.5, duration: 0.3 }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-background flex items-center justify-center"
                        >
                          <Check className="h-2 w-2 text-accent-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={cn(
                    "text-[10px] transition-colors leading-none",
                    isSelected ? "text-accent font-medium" : "text-foreground-faint group-hover:text-foreground-muted"
                  )}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected chips */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 flex-wrap pt-2 border-t border-border"
          >
            <span className="text-xs text-foreground-faint">Selected:</span>
            {selected.map((name) => {
              const hex = COLOR_OPTIONS.find((c) => c.name === name)?.hex ?? "#888";
              return (
                <motion.div
                  key={name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs text-foreground-muted"
                >
                  <div
                    className="w-3 h-3 rounded-full border border-border/50"
                    style={{ backgroundColor: hex }}
                  />
                  {name}
                  <button
                    onClick={() => onChange(selected.filter((c) => c !== name))}
                    className="text-foreground-faint hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
            <span className="text-xs text-foreground-faint ml-auto">
              {selected.length}/{MAX_COLORS}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
