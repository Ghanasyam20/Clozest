"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trash2, Tag, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { deleteOutfit } from "@/actions/outfits";
import { toast } from "@/hooks/useToast";
import { formatRelative, capitalise } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { OutfitWithItems } from "@/types";

type ExtendedOutfit = OutfitWithItems & {
  name?:      string | null;
  wornCount?: number;
  wornAt?:    Date | null;
  occasion?:  string | null;
};

interface SavedOutfitsClientProps {
  outfits: ExtendedOutfit[];
}

const OCCASION_ICONS: Record<string, string> = {
  casual: "☕", work: "💼", date: "❤️",
  party: "🎉", sport: "🏋️", travel: "✈️", formal: "🎩",
};

export function SavedOutfitsClient({ outfits: initial }: SavedOutfitsClientProps) {
  const [outfits,  setOutfits]  = useState<ExtendedOutfit[]>(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteOutfit(id);
    if (result.error) {
      toast({ variant: "destructive", title: "Delete failed", description: result.error });
    } else {
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      toast({ title: "Outfit removed" });
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-foreground leading-none">Outfits</h1>
          <p className="text-foreground-muted mt-2 text-sm">
            {outfits.length > 0
              ? `${outfits.length} saved look${outfits.length !== 1 ? "s" : ""}`
              : "Your saved outfits will appear here"}
          </p>
        </div>
        <Link href="/outfits/generate">
          <Button size="sm" className="gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            Generate new
          </Button>
        </Link>
      </div>

      {outfits.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-10 w-10" />}
          title="No saved outfits yet"
          description="Generate your first AI-styled outfit from your wardrobe."
          action={
            <Link href="/outfits/generate">
              <Button size="lg">Generate outfit</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {outfits.map((outfit, i) => {
              const items = outfit.outfitItems.map((oi) => oi.wardrobeItem);
              const preview = items.slice(0, 4);
              const isDeleting = deleting === outfit.id;

              return (
                <motion.div
                  key={outfit.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="glass rounded-2xl overflow-hidden group"
                >
                  {/* 2×2 image grid */}
                  <Link href={`/outfits/${outfit.id}`}>
                    <div className="relative grid grid-cols-2 gap-px aspect-square bg-border overflow-hidden">
                      {preview.map((itm) => (
                        <div key={itm.id} className="relative overflow-hidden bg-surface">
                          {itm.imageUrl ? (
                            <Image
                              src={itm.imageUrl}
                              alt={itm.name ?? ""}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="160px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Tag className="h-5 w-5 text-foreground-faint" />
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Fill empty slots */}
                      {Array.from({ length: Math.max(0, 4 - preview.length) }).map((_, j) => (
                        <div key={`empty-${j}`} className="bg-surface-2" />
                      ))}

                      {/* Confidence badge */}
                      {outfit.confidenceScore != null && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/75 backdrop-blur-sm border border-border text-[10px] text-foreground-muted">
                          {Math.round((outfit.confidenceScore ?? 0) * 100)}%
                        </div>
                      )}

                      {/* View arrow on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/30 backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-surface/80 border border-border flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Footer */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/outfits/${outfit.id}`}>
                          <p className="text-sm font-semibold text-foreground hover:text-accent transition-colors truncate">
                            {outfit.name || (outfit.occasion
                              ? `${OCCASION_ICONS[outfit.occasion] ?? ""} ${capitalise(outfit.occasion)} look`
                              : "Outfit")}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-foreground-faint">
                            {items.length} piece{items.length !== 1 ? "s" : ""}
                          </span>
                          {(outfit.wornCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-accent">
                              <TrendingUp className="h-3 w-3" />
                              {outfit.wornCount}× worn
                            </span>
                          )}
                          <span className="text-xs text-foreground-faint">
                            {formatRelative(outfit.generatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        disabled={isDeleting}
                        className={cn(
                          "p-1.5 rounded-lg text-foreground-faint hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0",
                          isDeleting && "opacity-50 pointer-events-none"
                        )}
                        title="Delete outfit"
                      >
                        {isDeleting
                          ? <div className="h-4 w-4 border border-t-transparent border-current rounded-full animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
