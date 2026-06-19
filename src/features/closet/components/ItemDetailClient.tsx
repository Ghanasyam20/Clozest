"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, RefreshCw, Tag, Calendar,
  TrendingUp, Shirt, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemEditForm } from "./ItemEditForm";
import { ConfidenceMeter, ClassificationBadge } from "./ConfidenceMeter";
import { useClassify, type EnrichedClassification } from "../hooks/useClassify";
import { updateWardrobeItem } from "@/actions/wardrobe";
import { toast } from "@/hooks/useToast";
import { formatDate, capitalise } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { WardrobeItem } from "@/types";

// Extended type including AI fields from new schema
type WardrobeItemWithAI = WardrobeItem & {
  aiClassified?:   boolean;
  aiConfidence?:   number | null;
  aiClassifiedAt?: Date | null;
  aiModelVersion?: string | null;
};

interface ItemDetailClientProps {
  item: WardrobeItemWithAI;
}

export function ItemDetailClient({ item: initialItem }: ItemDetailClientProps) {
  const [item,               setItem]               = useState<WardrobeItemWithAI>(initialItem);
  const [showEditForm,       setShowEditForm]        = useState(false);
  const [lastClassification, setLastClassification] = useState<EnrichedClassification | null>(null);

  const { classify, classifying, classifyError, aiStatus } = useClassify();

  async function handleReclassify() {
    const result = await classify(item.imageUrl, item.id);
    if (result) {
      setLastClassification(result);
      // Auto-apply classification to local state
      setItem((prev) => ({
        ...prev,
        category:        result.category  || prev.category,
        color:           result.color     || prev.color,
        fabric:          result.fabric    || prev.fabric,
        pattern:         result.pattern   || prev.pattern,
        season:          result.season?.length ? result.season : prev.season,
        style:           result.style     || prev.style,
        aiClassified:    true,
        aiConfidence:    result.confidence,
        aiClassifiedAt:  new Date(),
        aiModelVersion:  result.modelVersion,
      }));
      toast({
        title:       "Re-classified ✨",
        description: `${result.confidenceLabel} confidence (${Math.round(result.confidence * 100)}%)`,
      });
    } else if (classifyError) {
      toast({
        variant:     "destructive",
        title:       "Classification failed",
        description: classifyError,
      });
    }
  }

  const container = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.06 } },
  };
  const itemAnim = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Back nav */}
      <motion.div variants={itemAnim}>
        <Link
          href="/closet"
          className="inline-flex items-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to closet
        </Link>
      </motion.div>

      {/* Main layout */}
      <motion.div variants={itemAnim} className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* ── Image panel ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 border border-border">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name ?? item.category ?? "Wardrobe item"}
                fill
                className="object-cover"
                sizes="280px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Shirt className="h-16 w-16 text-foreground-faint" />
              </div>
            )}
          </div>

          {/* AI Classification status */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground-muted font-medium uppercase tracking-wide">
                AI Classification
              </p>
              <ClassificationBadge
                aiClassified={item.aiClassified ?? false}
                aiConfidence={item.aiConfidence}
              />
            </div>

            {item.aiClassified && item.aiConfidence != null && (
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    item.aiConfidence >= 0.65 ? "bg-accent" :
                    item.aiConfidence >= 0.45 ? "bg-amber-400" : "bg-red-400"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(item.aiConfidence * 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}

            {item.aiClassifiedAt && (
              <p className="text-xs text-foreground-faint">
                Classified {formatDate(item.aiClassifiedAt)}
                {item.aiModelVersion && ` · ${item.aiModelVersion}`}
              </p>
            )}

            {!item.aiClassified && (
              <p className="text-xs text-foreground-faint">
                This item hasn&apos;t been AI-classified yet.
              </p>
            )}

            {/* Reclassify button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleReclassify}
              disabled={classifying}
              loading={classifying}
            >
              {classifying ? (
                "Classifying…"
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {item.aiClassified ? "Re-classify" : "Classify with AI"}
                </>
              )}
            </Button>

            {aiStatus === "starting" && !classifying && (
              <p className="text-[10px] text-foreground-faint text-center">
                AI service warming up — first run may take ~30s
              </p>
            )}
          </div>

          {/* New classification result */}
          {lastClassification && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <ConfidenceMeter classification={lastClassification} />
            </motion.div>
          )}

          {/* Wear stats */}
          <div className="glass rounded-xl p-4 space-y-2">
            <p className="text-xs text-foreground-muted font-medium uppercase tracking-wide mb-3">
              Wear Stats
            </p>
            <div className="flex items-center gap-2.5 text-sm">
              <TrendingUp className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-foreground">
                {item.wornCount === 0 ? "Never worn" : `Worn ${item.wornCount} time${item.wornCount !== 1 ? "s" : ""}`}
              </span>
            </div>
            {item.lastWorn && (
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-foreground-faint flex-shrink-0" />
                <span className="text-foreground-muted">Last worn {formatDate(item.lastWorn)}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <Calendar className="h-4 w-4 text-foreground-faint flex-shrink-0" />
              <span className="text-foreground-muted">Added {formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* ── Details panel ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-display-sm text-foreground leading-none">
              {item.name ?? capitalise(item.category ?? "Item")}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm((v) => !v)}
            >
              {showEditForm ? "Cancel" : "Edit details"}
            </Button>
          </div>

          {showEditForm ? (
            <ItemEditForm
              item={item}
              onSaved={(updated) => {
                setItem((prev) => ({ ...prev, ...updated }));
                setShowEditForm(false);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Metadata grid */}
              <div className="glass rounded-2xl p-5 grid grid-cols-2 gap-4">
                {[
                  { label: "Category", value: capitalise(item.category ?? "—") },
                  { label: "Colour",   value: item.color   ? capitalise(item.color)   : "—" },
                  { label: "Pattern",  value: item.pattern ? capitalise(item.pattern) : "—" },
                  { label: "Fabric",   value: item.fabric  ? capitalise(item.fabric)  : "—" },
                  { label: "Style",    value: item.style   ? capitalise(item.style)   : "—" },
                  { label: "Season",   value: item.season?.length ? item.season.map(capitalise).join(", ") : "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-foreground-faint uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {/* Low-confidence warning */}
              {item.aiClassified && item.aiConfidence != null && item.aiConfidence < 0.45 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Low AI confidence</p>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      The AI wasn&apos;t very confident about this item&apos;s details.
                      Click &quot;Edit details&quot; to review and correct them.
                    </p>
                  </div>
                </div>
              )}

              {/* Colour swatch */}
              {item.color && (
                <div className="flex items-center gap-3 glass rounded-xl p-4">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-xs text-foreground-faint uppercase tracking-wide">Colour</p>
                    <p className="text-sm text-foreground font-medium capitalize">{item.color}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
