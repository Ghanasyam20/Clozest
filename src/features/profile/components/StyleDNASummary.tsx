"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Palette, Sparkles, Edit2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { COLOR_OPTIONS } from "@/features/onboarding/components/ColorPicker";
import type { StyleProfile } from "@/types";

interface StyleDNASummaryProps {
  profile:  StyleProfile | null;
  compact?: boolean;
}

export function StyleDNASummary({ profile, compact = false }: StyleDNASummaryProps) {
  if (!profile) {
    return (
      <div className={cn("glass rounded-2xl p-6 flex items-center justify-between", compact && "p-4")}>
        <div>
          <p className="text-sm font-medium text-foreground">Style DNA not set up</p>
          <p className="text-xs text-foreground-muted mt-0.5">Complete your style questionnaire.</p>
        </div>
        <Link
          href="/onboarding/style"
          className="flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          <Edit2 className="h-3 w-3" /> Set up
        </Link>
      </div>
    );
  }

  const styles = (profile.styleTypes as string[]) ?? [];
  const colors = (profile.favoriteColors as string[]) ?? [];

  return (
    <div className={cn("glass rounded-2xl p-6 space-y-5", compact && "p-4 space-y-3")}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
              Style DNA
            </h3>
          </div>
          <Link href="/profile" className="text-xs text-accent hover:underline">
            Edit
          </Link>
        </div>
      )}

      {/* Aesthetics */}
      {styles.length > 0 && (
        <div>
          {!compact && (
            <p className="text-xs text-foreground-faint uppercase tracking-wide mb-2">Aesthetics</p>
          )}
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs text-accent capitalize"
              >
                {s.replace("-", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Colours */}
      {colors.length > 0 && (
        <div>
          {!compact && (
            <p className="text-xs text-foreground-faint uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Palette className="h-3 w-3" /> Favourite colours
            </p>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            {colors.map((name) => {
              const hex = COLOR_OPTIONS.find((c) => c.name === name)?.hex ?? "#888";
              return (
                <div key={name} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-border/60 flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  {!compact && (
                    <span className="text-xs text-foreground-muted">{name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {styles.length === 0 && colors.length === 0 && (
        <p className="text-sm text-foreground-faint">No preferences set.</p>
      )}
    </div>
  );
}
