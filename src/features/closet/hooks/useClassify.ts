"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ClassificationResult } from "@/types";

export interface EnrichedClassification extends ClassificationResult {
  isLowConfidence:  boolean;
  confidenceLabel:  "High" | "Medium" | "Low" | "Very Low";
  modelVersion:     string;
  persistedToItem:  boolean;
}

interface UseClassifyResult {
  classify:         (imageUrl: string, itemId?: string) => Promise<EnrichedClassification | null>;
  classification:   EnrichedClassification | null;
  classifying:      boolean;
  classifyError:    string | null;
  aiStatus:         "unknown" | "ready" | "starting" | "disabled";
  reset:            () => void;
}

export function useClassify(): UseClassifyResult {
  const [classification, setClassification] = useState<EnrichedClassification | null>(null);
  const [classifying,    setClassifying]    = useState(false);
  const [classifyError,  setClassifyError]  = useState<string | null>(null);
  const [aiStatus,       setAiStatus]       = useState<"unknown" | "ready" | "starting" | "disabled">("unknown");
  const warmupCalledRef = useRef(false);

  // Warm up the AI service on first mount
  useEffect(() => {
    if (warmupCalledRef.current) return;
    warmupCalledRef.current = true;

    fetch("/api/ai/warmup")
      .then((r) => r.json())
      .then((d) => setAiStatus(d?.data?.status ?? "unknown"))
      .catch(() => setAiStatus("unknown"));
  }, []);

  const classify = useCallback(async (
    imageUrl: string,
    itemId?: string
  ): Promise<EnrichedClassification | null> => {
    setClassifying(true);
    setClassifyError(null);

    try {
      const res = await fetch("/api/ai/classify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageUrl, itemId }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setClassifyError(json.error ?? "Classification failed");
        setAiStatus("starting");
        return null;
      }

      const enriched = json.data as EnrichedClassification;
      setClassification(enriched);
      setAiStatus("ready");
      return enriched;
    } catch (e) {
      const msg = (e as Error).message;
      setClassifyError(msg);
      return null;
    } finally {
      setClassifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setClassification(null);
    setClassifyError(null);
  }, []);

  return { classify, classification, classifying, classifyError, aiStatus, reset };
}
