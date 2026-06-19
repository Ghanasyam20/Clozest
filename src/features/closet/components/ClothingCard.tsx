"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { capitalise } from "@/utils/formatters";
import { ClassificationBadge } from "./ConfidenceMeter";
import type { WardrobeItem } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  tops:        "bg-sky-500/20 text-sky-300 border-sky-500/30",
  bottoms:     "bg-violet-500/20 text-violet-300 border-violet-500/30",
  footwear:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  accessories: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  outerwear:   "bg-teal-500/20 text-teal-300 border-teal-500/30",
  dresses:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

interface ClothingCardProps {
  item:      WardrobeItem;
  onDelete?: (id: string) => void;
  index?:    number;
}

export function ClothingCard({ item, onDelete, index = 0 }: ClothingCardProps) {
  const router = useRouter();
  const [hovered,       setHovered]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const categoryStyle = item.category
    ? CATEGORY_COLORS[item.category] ?? "bg-surface-2 text-foreground-muted border-border"
    : "bg-surface-2 text-foreground-muted border-border";

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      await onDelete?.(item.id);
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  // Edit button navigates to the same destination as the card itself.
  // It used to be a nested <Link>, which is invalid inside the outer
  // <Link> (an <a> cannot contain another <a>). A plain <button> with
  // router.push + stopPropagation gives the same behaviour without
  // the invalid markup.
  function handleEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/closet/${item.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDeleteConfirm(false); }}
    >
      <Link href={`/closet/${item.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 border border-border">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name ?? item.category ?? "Clothing item"}
              fill
              className={cn(
                "object-cover transition-transform duration-700",
                hovered && "scale-105"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground-faint">
              <Tag className="h-10 w-10" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent"
              />
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 flex flex-col gap-2"
              >
                <button
                  onClick={handleEdit}
                  className="w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors backdrop-blur-sm"
                  title="Edit item"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-all backdrop-blur-sm",
                    deleteConfirm
                      ? "bg-destructive border-destructive text-white"
                      : "bg-surface/90 border-border text-foreground-muted hover:text-destructive"
                  )}
                  title={deleteConfirm ? "Click again to confirm delete" : "Delete item"}
                >
                  {deleting ? (
                    <div className="h-3 w-3 border border-t-transparent border-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Worn count badge */}
          {item.wornCount > 0 && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-surface/80 border border-border text-xs text-foreground-muted backdrop-blur-sm">
              Worn {item.wornCount}×
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="mt-3 px-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">
              {item.name ?? capitalise(item.category ?? "Unnamed item")}
            </p>
            {item.color && (
              <div
                className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0 mt-0.5"
                style={{ backgroundColor: item.color }}
                title={item.color}
              />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {item.category && (
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wide",
                categoryStyle
              )}>
                {capitalise(item.category)}
              </span>
            )}
            {item.season?.[0] && (
              <span className="text-[10px] text-foreground-faint capitalize">
                {item.season[0]}
              </span>
            )}
            <ClassificationBadge
              aiClassified={(item as WardrobeItem & { aiClassified?: boolean }).aiClassified ?? false}
              aiConfidence={(item as WardrobeItem & { aiConfidence?: number | null }).aiConfidence}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
