"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, LayoutGrid, List, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FilterBar } from "./FilterBar";
import { ClothingGrid } from "./ClothingGrid";
import { ClothingList } from "./ClothingList";
import { UploadModal } from "./UploadModal";
import { BulkClassifyButton } from "./BulkClassifyButton";
import { useWardrobe } from "../hooks/useWardrobe";
import { deleteWardrobeItem } from "@/actions/wardrobe";
import { toast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

type ViewMode = "grid" | "list";

export function ClosetClient() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMode,   setViewMode]   = useState<ViewMode>("grid");
  const [aiStatus,   setAiStatus]   = useState<"unknown" | "ready" | "starting">("unknown");

  const {
    items, filtered, loading, error,
    category, setCategory,
    search, setSearch,
    refresh, total,
  } = useWardrobe();

  // Warm up AI service silently when closet loads
  useEffect(() => {
    fetch("/api/ai/warmup")
      .then((r) => r.json())
      .then((d) => setAiStatus(d?.data?.status === "ready" ? "ready" : "starting"))
      .catch(() => setAiStatus("starting"));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteWardrobeItem(id);
    if (result.error) {
      toast({ variant: "destructive", title: "Delete failed", description: result.error });
    } else {
      toast({ title: "Item removed", description: "Deleted from your wardrobe." });
      refresh();
    }
  }, [refresh]);

  const hasFilters = category !== "all" || search.trim().length > 0;

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-display-md text-foreground leading-none">
              My Closet
            </h1>
            <p className="text-foreground-muted mt-2 text-sm">
              {total > 0
                ? `${total} piece${total !== 1 ? "s" : ""} in your wardrobe`
                : "Your digital wardrobe starts here"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-end">
            {/* AI status pill */}
            {total > 0 && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border",
                aiStatus === "ready"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-border bg-surface-2 text-foreground-faint"
              )}>
                {aiStatus === "ready"
                  ? <Wifi className="h-3 w-3" />
                  : <WifiOff className="h-3 w-3" />
                }
                {aiStatus === "ready" ? "AI ready" : "AI warming up…"}
              </div>
            )}

            {/* Bulk classify */}
            {total > 0 && (
              <BulkClassifyButton items={items} onDone={refresh} />
            )}

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-lg border border-border">
              {(["grid", "list"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === mode
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-foreground-faint hover:text-foreground"
                  )}
                  title={mode === "grid" ? "Grid view" : "List view"}
                >
                  {mode === "grid"
                    ? <LayoutGrid className="h-4 w-4" />
                    : <List className="h-4 w-4" />
                  }
                </button>
              ))}
            </div>

            <Button onClick={() => setUploadOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </div>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={refresh} className="ml-auto underline text-xs">Retry</button>
          </div>
        )}

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <FilterBar
          category={category}
          onCategory={setCategory}
          search={search}
          onSearch={setSearch}
          total={total}
          filtered={filtered.length}
        />

        {/* ── Items ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {viewMode === "grid" ? (
              <ClothingGrid
                items={filtered}
                loading={loading}
                onDelete={handleDelete}
                onUpload={() => setUploadOpen(true)}
                hasFilters={hasFilters}
              />
            ) : (
              <ClothingList
                items={filtered}
                loading={loading}
                onDelete={handleDelete}
                onUpload={() => setUploadOpen(true)}
                hasFilters={hasFilters}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Upload Modal ───────────────────────────────────────────────── */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSaved={refresh}
      />
    </>
  );
}
