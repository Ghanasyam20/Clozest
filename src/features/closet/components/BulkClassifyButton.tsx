"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import type { WardrobeItem } from "@/types";

interface BulkClassifyButtonProps {
  items:     WardrobeItem[];
  onDone:    () => void;
}

interface BulkResult {
  processed: number;
  failed:    number;
  skipped:   number;
}

export function BulkClassifyButton({ items, onDone }: BulkClassifyButtonProps) {
  const [open,      setOpen]      = useState(false);
  const [running,   setRunning]   = useState(false);
  const [result,    setResult]    = useState<BulkResult | null>(null);
  const [progress,  setProgress]  = useState(0);

  // Items that haven't been AI-classified yet
  const unclassified = items.filter((i) => !(i as WardrobeItem & { aiClassified?: boolean }).aiClassified);

  if (unclassified.length === 0) return null;

  async function runBulkClassify() {
    setRunning(true);
    setProgress(0);
    setResult(null);

    // Process in batches of 10
    const batchSize = 10;
    const batches: string[][] = [];
    for (let i = 0; i < unclassified.length; i += batchSize) {
      batches.push(unclassified.slice(i, i + batchSize).map((item) => item.id));
    }

    let totalProcessed = 0;
    let totalFailed    = 0;
    let totalSkipped   = 0;

    for (let b = 0; b < batches.length; b++) {
      try {
        const res = await fetch("/api/ai/bulk-classify", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ itemIds: batches[b], skipExisting: true }),
        });
        const json = await res.json();
        if (json.data) {
          totalProcessed += json.data.processed ?? 0;
          totalFailed    += json.data.failed    ?? 0;
          totalSkipped   += json.data.skipped   ?? 0;
        }
      } catch {
        totalFailed += batches[b].length;
      }

      setProgress(Math.round(((b + 1) / batches.length) * 100));
    }

    const bulkResult = { processed: totalProcessed, failed: totalFailed, skipped: totalSkipped };
    setResult(bulkResult);
    setRunning(false);

    if (totalProcessed > 0) {
      toast({
        title:       `${totalProcessed} item${totalProcessed !== 1 ? "s" : ""} classified ✨`,
        description: totalFailed > 0 ? `${totalFailed} failed — try again later.` : undefined,
      });
      onDone();
    } else if (totalFailed > 0) {
      toast({
        variant:     "destructive",
        title:       "Classification failed",
        description: "The AI service may be starting up. Try again in a minute.",
      });
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-accent/30 text-accent hover:bg-accent/10"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI classify ({unclassified.length})
      </Button>

      {/* Confirmation modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => !running && setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6"
            >
              {/* Close */}
              {!running && (
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-foreground-faint hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Content */}
              {!result ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-accent/10">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-foreground">Bulk AI Classify</h2>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        {unclassified.length} unclassified item{unclassified.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-foreground-muted mb-6 leading-relaxed">
                    Run AI classification on {unclassified.length} item{unclassified.length !== 1 ? "s" : ""} that haven&apos;t been tagged yet.
                    The AI will automatically detect category, colour, pattern, fabric, and season.
                    {unclassified.length > 10 && (
                      <span className="block mt-2 text-foreground-faint">
                        Items will be processed in batches — this may take a few minutes.
                      </span>
                    )}
                  </p>

                  {running && (
                    <div className="mb-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-foreground-muted">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Classifying…
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                      disabled={running}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={runBulkClassify}
                      disabled={running}
                      loading={running}
                    >
                      {running ? "Classifying…" : "Run classification"}
                    </Button>
                  </div>
                </>
              ) : (
                /* Result state */
                <div className="text-center py-4">
                  {result.processed > 0 ? (
                    <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  )}
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {result.processed > 0 ? "Classification complete" : "Classification failed"}
                  </h3>
                  <div className="text-sm text-foreground-muted space-y-1 mb-6">
                    {result.processed > 0 && <p>{result.processed} item{result.processed !== 1 ? "s" : ""} classified</p>}
                    {result.failed    > 0 && <p className="text-destructive">{result.failed} failed</p>}
                    {result.skipped   > 0 && <p>{result.skipped} already classified (skipped)</p>}
                  </div>
                  <Button onClick={() => { setOpen(false); setResult(null); }}>
                    Done
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
