"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Edit2, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { capitalise, formatDate } from "@/utils/formatters";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import type { WardrobeItem } from "@/types";

const CATEGORY_DOTS: Record<string, string> = {
  tops:        "bg-sky-400",
  bottoms:     "bg-violet-400",
  footwear:    "bg-amber-400",
  accessories: "bg-rose-400",
  outerwear:   "bg-teal-400",
  dresses:     "bg-pink-400",
};

interface ClothingListProps {
  items:      WardrobeItem[];
  loading:    boolean;
  onDelete:   (id: string) => Promise<void>;
  onUpload:   () => void;
  hasFilters: boolean;
}

export function ClothingList({
  items, loading, onDelete, onUpload, hasFilters,
}: ClothingListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" label="Loading your wardrobe…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Shirt className="h-10 w-10" />}
        title={hasFilters ? "No items match this filter" : "Your closet is empty"}
        description={
          hasFilters
            ? "Try removing filters to see more items."
            : "Start by uploading your first clothing item."
        }
        action={!hasFilters ? (
          <Button onClick={onUpload} size="lg">Upload first item</Button>
        ) : undefined}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[3rem_1fr_1fr_1fr_1fr_5rem] gap-4 px-4 py-3 bg-surface border-b border-border text-xs font-medium text-foreground-faint uppercase tracking-wider">
        <span />
        <span>Item</span>
        <span>Category</span>
        <span>Color / Pattern</span>
        <span>Season</span>
        <span className="text-right">Actions</span>
      </div>

      <AnimatePresence>
        {items.map((item, i) => (
          <ListRow key={item.id} item={item} index={i} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ListRow({
  item,
  index,
  onDelete,
}: {
  item: WardrobeItem;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const dot = item.category ? CATEGORY_DOTS[item.category] : "bg-foreground-faint";

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
    setDeleteConfirm(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="group grid grid-cols-[3rem_1fr_1fr_1fr_1fr_5rem] gap-4 items-center px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-2/50 transition-colors"
      onMouseLeave={() => setDeleteConfirm(false)}
    >
      {/* Thumbnail */}
      <Link href={`/closet/${item.id}`}>
        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-surface-2 border border-border flex-shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name ?? "Item"}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn("w-2 h-2 rounded-full", dot)} />
            </div>
          )}
        </div>
      </Link>

      {/* Name */}
      <Link href={`/closet/${item.id}`} className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
          {item.name ?? capitalise(item.category ?? "Unnamed item")}
        </p>
        <p className="text-xs text-foreground-faint mt-0.5">
          Added {formatDate(item.createdAt)}
        </p>
      </Link>

      {/* Category */}
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
        <span className="text-sm text-foreground-muted capitalize">
          {item.category ?? "—"}
        </span>
      </div>

      {/* Color / Pattern */}
      <div className="space-y-0.5">
        <p className="text-sm text-foreground-muted capitalize">{item.color ?? "—"}</p>
        {item.pattern && (
          <p className="text-xs text-foreground-faint capitalize">{item.pattern}</p>
        )}
      </div>

      {/* Season */}
      <div className="flex flex-wrap gap-1">
        {item.season?.length > 0
          ? item.season.map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-foreground-faint capitalize">
                {s}
              </span>
            ))
          : <span className="text-sm text-foreground-faint">—</span>
        }
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/closet/${item.id}`}
          className="w-7 h-7 rounded-md bg-surface-2 border border-border flex items-center justify-center text-foreground-faint hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="h-3 w-3" />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            "w-7 h-7 rounded-md border flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
            deleteConfirm
              ? "bg-destructive border-destructive text-white opacity-100"
              : "bg-surface-2 border-border text-foreground-faint hover:text-destructive"
          )}
          title={deleteConfirm ? "Confirm delete" : "Delete"}
        >
          {deleting
            ? <div className="w-3 h-3 border border-t-transparent border-current rounded-full animate-spin" />
            : <Trash2 className="h-3 w-3" />
          }
        </button>
      </div>
    </motion.div>
  );
}
