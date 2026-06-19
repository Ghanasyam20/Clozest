"use client";

import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import type { EnrichedClassification } from "../hooks/useClassify";

interface ConfidenceMeterProps {
  classification: EnrichedClassification;
  className?:     string;
  compact?:       boolean;
}

const LABEL_CONFIG = {
  "High":     { color: "text-green-400",  bg: "bg-green-400",  border: "border-green-400/30", icon: CheckCircle2 },
  "Medium":   { color: "text-accent",     bg: "bg-accent",     border: "border-accent/30",    icon: Sparkles },
  "Low":      { color: "text-amber-400",  bg: "bg-amber-400",  border: "border-amber-400/30", icon: AlertTriangle },
  "Very Low": { color: "text-red-400",    bg: "bg-red-400",    border: "border-red-400/30",   icon: AlertTriangle },
};

export function ConfidenceMeter({ classification, className, compact = false }: ConfidenceMeterProps) {
  const { confidence, confidenceLabel, isLowConfidence } = classification;
  const config = LABEL_CONFIG[confidenceLabel];
  const Icon   = config.icon;
  const pct    = Math.round(confidence * 100);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Icon className={cn("h-3 w-3 flex-shrink-0", config.color)} />
        <span className={cn("text-xs font-medium", config.color)}>
          {confidenceLabel} confidence ({pct}%)
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", config.color)} />
          <span className="text-xs text-foreground-muted font-medium">
            AI Confidence
          </span>
        </div>
        <span className={cn("text-xs font-semibold", config.color)}>
          {pct}% · {confidenceLabel}
        </span>
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", config.bg)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>

      {/* Warning for low confidence */}
      {isLowConfidence && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-start gap-2 px-3 py-2 rounded-lg border text-xs",
            config.border,
            "bg-amber-400/5"
          )}
        >
          <Info className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-foreground-muted leading-relaxed">
            The AI is less certain about this item. Please review the details below and correct anything that looks off.
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Inline classification badge ─────────────────────────────────────────────

interface ClassificationBadgeProps {
  aiClassified:  boolean;
  aiConfidence?: number | null;
  className?:    string;
}

export function ClassificationBadge({ aiClassified, aiConfidence, className }: ClassificationBadgeProps) {
  if (!aiClassified) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
        "border border-border text-foreground-faint bg-transparent",
        className
      )}>
        Manual
      </div>
    );
  }

  const pct   = aiConfidence != null ? Math.round(aiConfidence * 100) : null;
  const isLow = aiConfidence != null && aiConfidence < 0.45;

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
      isLow
        ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
        : "bg-accent/10 border-accent/30 text-accent",
      className
    )}>
      <Sparkles className="h-2.5 w-2.5" />
      AI{pct != null ? ` ${pct}%` : ""}
    </div>
  );
}
