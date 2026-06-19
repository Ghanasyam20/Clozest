"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestedOutfitCardProps {
  totalItems:    number;
  totalOutfits:  number;
}

export function SuggestedOutfitCard({ totalItems, totalOutfits }: SuggestedOutfitCardProps) {
  const hasEnoughItems = totalItems >= 2;

  return (
    <div className="relative glass rounded-2xl p-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(38 46% 60%) 0%, transparent 70%)" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
            AI Stylist
          </h2>
        </div>

        {hasEnoughItems ? (
          <>
            <h3 className="font-display text-xl text-foreground mb-2">
              Ready to build an outfit?
            </h3>
            <p className="text-sm text-foreground-muted mb-6 leading-relaxed">
              Tell our AI your occasion and let it pick the perfect combination from your{" "}
              <span className="text-foreground font-medium">{totalItems} pieces</span>.
            </p>

            <div className="flex items-center gap-3">
              <Link href="/outfits/generate">
                <Button size="sm" className="group">
                  Generate outfit
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              {totalOutfits > 0 && (
                <Link href="/outfits">
                  <Button variant="ghost" size="sm">
                    {totalOutfits} saved
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-xl text-foreground mb-2">
              Add more pieces first
            </h3>
            <p className="text-sm text-foreground-muted mb-6 leading-relaxed">
              Add at least 2 items to your wardrobe and the AI stylist will start building
              outfits for you automatically.
            </p>
            <Link href="/closet">
              <Button size="sm" className="group">
                Go to My Closet
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
