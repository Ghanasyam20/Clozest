"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { updateWardrobeItem, deleteWardrobeItem } from "@/actions/wardrobe";
import { toast } from "@/hooks/useToast";
import { formatDate } from "@/utils/formatters";
import type { WardrobeItem } from "@/types";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "footwear", "accessories"] as const;
const SEASONS    = ["spring", "summer", "autumn", "winter"] as const;
const PATTERNS   = ["solid", "stripes", "plaid", "floral", "geometric", "animal", "abstract"] as const;

interface ItemEditFormProps {
  item:     WardrobeItem;
  onSaved?: (updated: Partial<WardrobeItem>) => void;
}

export function ItemEditForm({ item, onSaved }: ItemEditFormProps) {
  const router = useRouter();
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [deleteConf, setDeleteConf] = useState(false);
  const [saved,      setSaved]      = useState(false);

  const [name,     setName]     = useState(item.name     ?? "");
  const [category, setCategory] = useState(item.category ?? "");
  const [color,    setColor]    = useState(item.color    ?? "");
  const [fabric,   setFabric]   = useState(item.fabric   ?? "");
  const [pattern,  setPattern]  = useState(item.pattern  ?? "");
  const [style,    setStyle]    = useState(item.style    ?? "");
  const [seasons,  setSeasons]  = useState<string[]>(item.season ?? []);

  async function handleSave() {
    setSaving(true);
    const result = await updateWardrobeItem(item.id, {
      name:     name     || undefined,
      category: category || undefined,
      color:    color    || undefined,
      fabric:   fabric   || undefined,
      pattern:  pattern  || undefined,
      style:    style    || undefined,
      season:   seasons.length > 0 ? seasons : undefined,
    });

    setSaving(false);
    if (result.error) {
      toast({ variant: "destructive", title: "Save failed", description: result.error });
    } else {
      setSaved(true);
      toast({ title: "Changes saved" });
      if (onSaved && result.data) {
        onSaved(result.data);
      }
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleDelete() {
    if (!deleteConf) { setDeleteConf(true); return; }
    setDeleting(true);
    const result = await deleteWardrobeItem(item.id);
    if (result.error) {
      toast({ variant: "destructive", title: "Delete failed", description: result.error });
      setDeleting(false);
    } else {
      toast({ title: "Item removed from wardrobe" });
      router.push("/closet");
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/closet")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-display text-display-sm text-foreground">
            {item.name ?? "Edit item"}
          </h1>
          <p className="text-sm text-foreground-muted">
            Added {formatDate(item.createdAt)} · Worn {item.wornCount} times
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Image panel */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 border border-border">
            <Image
              src={item.imageUrl}
              alt={item.name ?? "Item"}
              fill
              className="object-cover"
              sizes="320px"
            />
          </div>

          {/* Quick stats */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Worn</span>
              <span className="text-foreground font-medium">{item.wornCount}×</span>
            </div>
            {item.lastWorn && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Last worn</span>
                <span className="text-foreground font-medium">{formatDate(item.lastWorn)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Added</span>
              <span className="text-foreground font-medium">{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-5">
          <Input
            label="Item name"
            type="text"
            placeholder="e.g. Navy linen blazer"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? "" : c)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm border transition-all capitalize font-medium",
                    category === c
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-faint"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Color + Fabric */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Colour"
              type="text"
              placeholder="e.g. midnight blue"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <Input
              label="Fabric"
              type="text"
              placeholder="e.g. 100% cotton"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Pattern</label>
            <div className="flex flex-wrap gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(pattern === p ? "" : p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize",
                    pattern === p
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "border-border text-foreground-muted hover:border-foreground-faint"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">Seasons</label>
            <div className="flex gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeasons((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                  )}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm border transition-all capitalize font-medium",
                    seasons.includes(s)
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "border-border text-foreground-muted hover:border-foreground-faint"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <Input
            label="Style tag (optional)"
            type="text"
            placeholder="e.g. minimalist, streetwear"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className={cn(
                "flex-1 gap-2 transition-all",
                deleteConf && "border-destructive text-destructive hover:bg-destructive/10"
              )}
              onClick={handleDelete}
              loading={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleteConf ? "Confirm delete" : "Delete item"}
            </Button>

            <Button
              className={cn(
                "flex-1 gap-2 transition-all",
                saved && "bg-green-600 hover:brightness-100"
              )}
              onClick={handleSave}
              loading={saving}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
