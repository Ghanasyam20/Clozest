"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { StyleAesthetic } from "../context/OnboardingContext";

const AESTHETICS: {
  id:          StyleAesthetic;
  label:       string;
  description: string;
  emoji:       string;
}[] = [
  { id: "minimalist",    label: "Minimalist",    description: "Clean, intentional, timeless",   emoji: "◻️" },
  { id: "streetwear",    label: "Streetwear",    description: "Urban, bold, expressive",         emoji: "🧢" },
  { id: "korean",        label: "Korean",        description: "Soft, layered, youthful",         emoji: "🌸" },
  { id: "old-money",     label: "Old Money",     description: "Quiet luxury, refined classics",  emoji: "🏛️" },
  { id: "formal",        label: "Formal",        description: "Sharp, polished, professional",   emoji: "👔" },
  { id: "vintage",       label: "Vintage",       description: "Retro, nostalgic, eclectic",      emoji: "📷" },
  { id: "bohemian",      label: "Bohemian",      description: "Free-spirited, earthy, layered",  emoji: "🌿" },
  { id: "athleisure",    label: "Athleisure",    description: "Sporty, comfortable, functional", emoji: "⚡" },
  { id: "preppy",        label: "Preppy",        description: "Classic, collegiate, crisp",      emoji: "🎾" },
  { id: "dark-academia", label: "Dark Academia", description: "Literary, moody, intellectual",   emoji: "📚" },
];

interface StyleSelectorProps {
  selected:  StyleAesthetic[];
  onChange:  (types: StyleAesthetic[]) => void;
}

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};
const tileVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function StyleSelector({ selected, onChange }: StyleSelectorProps) {
  function toggle(id: StyleAesthetic) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {AESTHETICS.map(({ id, label, description, emoji }) => {
          const isSelected = selected.includes(id);
          return (
            <motion.button
              key={id}
              variants={tileVariant}
              onClick={() => toggle(id)}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected
                  ? "bg-accent/10 border-accent/60 shadow-[0_0_0_1px_hsl(var(--accent)/0.3)]"
                  : "bg-surface border-border hover:border-accent/30 hover:bg-surface-2"
              )}
            >
              {/* Check badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-accent-foreground" />
                </motion.div>
              )}

              {/* Emoji */}
              <span className="text-2xl leading-none">{emoji}</span>

              {/* Labels */}
              <div>
                <p className={cn(
                  "text-sm font-semibold leading-snug",
                  isSelected ? "text-accent" : "text-foreground"
                )}>
                  {label}
                </p>
                <p className="text-[11px] text-foreground-faint mt-0.5 leading-snug">
                  {description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selection summary */}
      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-center text-accent"
        >
          {selected.length === 1
            ? "1 style selected"
            : `${selected.length} styles selected`}
          {" — "}
          <span className="text-foreground-muted">you can always change this later</span>
        </motion.p>
      )}
    </div>
  );
}
