"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Tag, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { capitalise, formatRelative } from "@/utils/formatters";
import type { WardrobeItem } from "@/types";

interface NextWearSuggestionProps {
  items:      WardrobeItem[];   // sorted by priority (unworn oldest first)
  totalItems: number;
}

export function NextWearSuggestion({ items, totalItems }: NextWearSuggestionProps) {
  if (totalItems === 0 || items.length === 0) return null;

  // Show top 3 under-utilised items
  const suggestions = items.slice(0, 3);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
            Style these next
          </h2>
        </div>
        <Link href="/outfits/generate" className="text-xs text-accent hover:underline flex items-center gap-1">
          Generate outfit <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-4">
        {suggestions.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0"
          >
            <Link href={`/closet/${item.id}`} className="group block">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border mb-2">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name ?? ""}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="140px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-foreground-faint" />
                  </div>
                )}
                {/* Priority badge */}
                <div className={cn(
                  "absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-medium border",
                  item.wornCount === 0
                    ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                    : "bg-surface/70 border-border text-foreground-faint"
                )}>
                  {item.wornCount === 0 ? "Unworn" : `${item.wornCount}× worn`}
                </div>
              </div>

              <p className="text-xs font-medium text-foreground truncate">
                {item.name ?? capitalise(item.category ?? "Item")}
              </p>

              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-foreground-faint flex-shrink-0" />
                <p className="text-[10px] text-foreground-faint truncate">
                  {item.lastWorn
                    ? `Last worn ${formatRelative(item.lastWorn)}`
                    : `Added ${formatRelative(item.createdAt)}`}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-foreground-faint mt-4 text-center">
        Items sorted by lowest utilisation — help every piece earn its place.
      </p>
    </div>
  );
}
