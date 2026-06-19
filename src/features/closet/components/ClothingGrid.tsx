"use client";

import { AnimatePresence } from "framer-motion";
import { Shirt } from "lucide-react";
import { ClothingCard } from "./ClothingCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { WardrobeItem } from "@/types";

interface ClothingGridProps {
  items:      WardrobeItem[];
  loading:    boolean;
  onDelete:   (id: string) => Promise<void>;
  onUpload:   () => void;
  hasFilters: boolean;
}

export function ClothingGrid({
  items, loading, onDelete, onUpload, hasFilters,
}: ClothingGridProps) {
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
            ? "Try removing the category or season filter to see more items."
            : "Start building your digital wardrobe by uploading your first clothing item."
        }
        action={
          !hasFilters ? (
            <Button onClick={onUpload} size="lg">
              Upload first item
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <ClothingCard
            key={item.id}
            item={item}
            onDelete={onDelete}
            index={i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
