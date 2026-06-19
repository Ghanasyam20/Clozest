"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Edit2, Check, Trash2, Shirt as ShirtIcon,
  Calendar, Tag, TrendingUp, Sparkles, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { wearOutfit, deleteOutfit, updateOutfit } from "@/actions/outfits";
import { toast } from "@/hooks/useToast";
import { formatDate, formatRelative, capitalise } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { OutfitWithItems } from "@/types";

interface OutfitDetailClientProps {
  outfit: OutfitWithItems & {
    name?:           string | null;
    notes?:          string | null;
    wornAt?:         Date   | null;
    wornCount?:      number;
    confidenceScore?: number | null;
    occasion?:       string | null;
  };
}

const OCCASION_ICONS: Record<string, string> = {
  casual: "☕", work: "💼", date: "❤️",
  party: "🎉", sport: "🏋️", travel: "✈️", formal: "🎩",
};

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function OutfitDetailClient({ outfit: initial }: OutfitDetailClientProps) {
  const router = useRouter();

  const [outfit,        setOutfit]       = useState(initial);
  const [wearing,       setWearing]      = useState(false);
  const [deleting,      setDeleting]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingName,   setEditingName]  = useState(false);
  const [editingNotes,  setEditingNotes] = useState(false);
  const [name,          setName]         = useState(outfit.name ?? "");
  const [notes,         setNotes]        = useState(outfit.notes ?? "");
  const [savingMeta,    setSavingMeta]   = useState(false);

  const items = outfit.outfitItems.map((oi) => oi.wardrobeItem);

  async function handleWear() {
    setWearing(true);
    const result = await wearOutfit(outfit.id);
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      setOutfit((prev) => ({
        ...prev,
        wornCount: result.data?.wornCount ?? ((prev.wornCount ?? 0) + 1),
        wornAt:    new Date(),
      }));
      toast({
        title:       "Outfit marked as worn 🎉",
        description: `Worn count updated for ${items.length} items.`,
      });
    }
    setWearing(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    const result = await deleteOutfit(outfit.id);
    if (result.error) {
      toast({ variant: "destructive", title: "Delete failed", description: result.error });
      setDeleting(false);
    } else {
      toast({ title: "Outfit deleted" });
      router.push("/outfits");
    }
  }

  async function saveMeta() {
    setSavingMeta(true);
    const result = await updateOutfit(outfit.id, {
      name:  name.trim()  || undefined,
      notes: notes.trim() || undefined,
    });
    if (result.error) {
      toast({ variant: "destructive", title: "Save failed", description: result.error });
    } else {
      setOutfit((prev) => ({ ...prev, name: name.trim() || null, notes: notes.trim() || null }));
      toast({ title: "Saved ✓" });
    }
    setEditingName(false);
    setEditingNotes(false);
    setSavingMeta(false);
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Back nav */}
      <motion.div variants={item}>
        <Link href="/outfits" className="inline-flex items-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Saved outfits
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            {/* Outfit name */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Outfit name…"
                  maxLength={60}
                  className="input-base text-xl py-1 px-2 flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={saveMeta} loading={savingMeta}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-2 group mb-1"
              >
                <h1 className="font-display text-display-sm text-foreground leading-none">
                  {outfit.name || "Unnamed outfit"}
                </h1>
                <Edit2 className="h-4 w-4 text-foreground-faint opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {outfit.occasion && (
                <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <span>{OCCASION_ICONS[outfit.occasion] ?? "✨"}</span>
                  <span className="capitalize">{outfit.occasion}</span>
                </span>
              )}
              {outfit.confidenceScore != null && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border font-medium",
                  outfit.confidenceScore >= 0.8
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-accent/10 border-accent/30 text-accent"
                )}>
                  {Math.round(outfit.confidenceScore * 100)}% match
                </span>
              )}
              <span className="text-xs text-foreground-faint flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(outfit.generatedAt)}
              </span>
            </div>
          </div>

          {/* Wear + Delete */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleWear}
              disabled={wearing}
              loading={wearing}
              className="gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Wear today
            </Button>

            {deleteConfirm ? (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 text-white border-0"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-foreground-faint hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Wear stats */}
        {((outfit.wornCount ?? 0) > 0 || outfit.wornAt) && (
          <div className="flex items-center gap-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-foreground">
                Worn {outfit.wornCount ?? 0} time{(outfit.wornCount ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
            {outfit.wornAt && (
              <span className="text-xs text-foreground-faint">
                Last worn {formatRelative(outfit.wornAt)}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Items grid */}
      <motion.div variants={item}>
        <p className="text-xs text-foreground-muted uppercase tracking-wide font-medium mb-3">
          {items.length} piece{items.length !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((wardrobeItem, i) => (
            <motion.div
              key={wardrobeItem.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/closet/${wardrobeItem.id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border mb-2">
                  {wardrobeItem.imageUrl ? (
                    <Image
                      src={wardrobeItem.imageUrl}
                      alt={wardrobeItem.name ?? ""}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="180px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShirtIcon className="h-8 w-8 text-foreground-faint" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {wardrobeItem.name ?? capitalise(wardrobeItem.category ?? "Item")}
                </p>
                {wardrobeItem.color && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-border/50 flex-shrink-0"
                      style={{ backgroundColor: wardrobeItem.color }}
                    />
                    <span className="text-[10px] text-foreground-faint capitalize">{wardrobeItem.color}</span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notes section */}
      <motion.div variants={item} className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-foreground-muted uppercase tracking-wide font-medium">Notes</p>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              {outfit.notes ? "Edit" : "Add note"}
            </button>
          )}
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this outfit — when to wear it, what event it's for…"
              maxLength={500}
              rows={3}
              className="input-base w-full resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => {
                setNotes(outfit.notes ?? "");
                setEditingNotes(false);
              }}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveMeta} loading={savingMeta}>
                Save note
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted leading-relaxed">
            {outfit.notes || <span className="italic text-foreground-faint">No notes yet.</span>}
          </p>
        )}
      </motion.div>

      {/* Regenerate CTA */}
      <motion.div variants={item} className="flex justify-center pt-2">
        <Link href="/outfits/generate">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate a new outfit
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
