"use client";

import { useState, useEffect } from "react";
import type { WardrobeAnalytics } from "@/types";

interface UseHealthScoreResult {
  analytics: WardrobeAnalytics | null;
  loading:   boolean;
  error:     string | null;
  refresh:   () => void;
}

export function useHealthScore(): UseHealthScoreResult {
  const [analytics, setAnalytics] = useState<WardrobeAnalytics | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res  = await fetch("/api/analytics");
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
        if (!cancelled) {
          setAnalytics(json.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [tick]);

  return { analytics, loading, error, refresh: () => setTick((t) => t + 1) };
}
