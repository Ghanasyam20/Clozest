"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HealthScoreWidget }   from "./HealthScoreWidget";
import { WeatherWidget }       from "./WeatherWidget";
import { QuickStats }          from "./QuickStats";
import { RecentItemsRow }      from "./RecentItemsRow";
import { SuggestedOutfitCard } from "./SuggestedOutfitCard";
import { NextWearSuggestion }  from "./NextWearSuggestion";
import { UploadModal }         from "@/features/closet/components/UploadModal";
import { useWardrobe }         from "@/features/closet/hooks/useWardrobe";
import type { WardrobeItem, StyleProfile } from "@/types";

interface DashboardClientProps {
  firstName:        string;
  userId:           string;
  totalItems:       number;
  recentItems:      WardrobeItem[];
  underutilisedItems: WardrobeItem[];
  totalOutfits:     number;
  styleProfile:     StyleProfile | null;
  healthScore:      number;
  unusedCount:      number;
  categoryCount:    number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function DashboardClient({
  firstName, totalItems, recentItems, underutilisedItems,
  totalOutfits, healthScore, unusedCount, categoryCount,
}: DashboardClientProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { refresh } = useWardrobe();

  const variety         = Math.min(100, (categoryCount / 6) * 100);
  const utilisedCount   = totalItems - unusedCount;
  const utilisation     = totalItems > 0 ? Math.min(100, (utilisedCount / totalItems) * 100) : 0;
  const outfitPotential = Math.min(100, (totalOutfits / Math.max(1, totalItems / 3)) * 100);

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 sm:space-y-6 max-w-[1400px]"
      >
        <motion.div variants={itemVariant}>
          {/* text-display-md was sized for desktop; it now steps down
              on phones so the greeting doesn't wrap awkwardly or crowd
              the edges of a 375px viewport. */}
          <h1 className="font-display text-2xl sm:text-display-md text-foreground leading-tight sm:leading-none">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-foreground-muted mt-1.5 sm:mt-2 text-sm">
            {totalItems === 0
              ? "Welcome to Clozest — let's start building your digital wardrobe."
              : `You have ${totalItems} piece${totalItems !== 1 ? "s" : ""} in your wardrobe.`}
          </p>
        </motion.div>

        <motion.div variants={itemVariant} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <div className="xl:col-span-2">
            <HealthScoreWidget
              score={healthScore}
              variety={variety}
              utilisation={utilisation}
              outfitPotential={outfitPotential}
              totalItems={totalItems}
            />
          </div>
          <WeatherWidget />
        </motion.div>

        <motion.div variants={itemVariant} className="grid md:grid-cols-2 gap-4 sm:gap-5">
          <QuickStats
            totalItems={totalItems}
            totalOutfits={totalOutfits}
            unusedCount={unusedCount}
            categoryCount={categoryCount}
          />
          <SuggestedOutfitCard
            totalItems={totalItems}
            totalOutfits={totalOutfits}
          />
        </motion.div>

        {/* Next wear suggestions — only when wardrobe has items */}
        {totalItems > 0 && underutilisedItems.length > 0 && (
          <motion.div variants={itemVariant}>
            <NextWearSuggestion
              items={underutilisedItems}
              totalItems={totalItems}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariant}>
          <RecentItemsRow
            items={recentItems}
            onUpload={() => setUploadOpen(true)}
          />
        </motion.div>
      </motion.div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSaved={refresh}
      />
    </>
  );
}
