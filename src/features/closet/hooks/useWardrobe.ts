"use client";

import { useState, useEffect, useCallback } from "react";
import type { WardrobeItem } from "@/types";
import { CATEGORIES } from "@/schemas/wardrobe";

type Category = (typeof CATEGORIES)[number] | "all";

interface UseWardrobeOptions {
  initialCategory?: Category;
}

interface UseWardrobeResult {
  items:       WardrobeItem[];
  filtered:    WardrobeItem[];
  loading:     boolean;
  error:       string | null;
  category:    Category;
  setCategory: (c: Category) => void;
  search:      string;
  setSearch:   (s: string) => void;
  refresh:     () => void;
  total:       number;
}

export function useWardrobe({ initialCategory = "all" }: UseWardrobeOptions = {}): UseWardrobeResult {
  const [items,    setItems]    = useState<WardrobeItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [search,   setSearch]   = useState("");
  const [tick,     setTick]     = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "200" });
        if (category !== "all") params.set("category", category);

        const res  = await fetch(`/api/wardrobe?${params}`);
        const json = await res.json();

        if (!res.ok || json.error) throw new Error(json.error ?? "Failed to load wardrobe");
        if (!cancelled) setItems(json.data.items ?? []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();
    return () => { cancelled = true; };
  }, [category, tick]);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q) ||
      item.pattern?.toLowerCase().includes(q) ||
      item.fabric?.toLowerCase().includes(q)
    );
  });

  return {
    items, filtered, loading, error,
    category, setCategory,
    search, setSearch,
    refresh, total: items.length,
  };
}
