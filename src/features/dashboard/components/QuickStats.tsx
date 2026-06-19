"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Sparkles, AlertTriangle, Tag } from "lucide-react";

interface QuickStatsProps {
  totalItems:   number;
  totalOutfits: number;
  unusedCount:  number;
  categoryCount: number;
}

export function QuickStats({ totalItems, totalOutfits, unusedCount, categoryCount }: QuickStatsProps) {
  const stats = [
    {
      icon:  Shirt,
      label: "Items",
      value: totalItems,
      sub:   `across ${categoryCount} categories`,
      href:  "/closet",
      color: "text-sky-400",
      bg:    "bg-sky-400/10",
    },
    {
      icon:  Sparkles,
      label: "Outfits saved",
      value: totalOutfits,
      sub:   totalOutfits === 0 ? "Generate your first" : "and counting",
      href:  "/outfits",
      color: "text-accent",
      bg:    "bg-accent/10",
    },
    {
      icon:  AlertTriangle,
      label: "Unworn items",
      value: unusedCount,
      sub:   unusedCount > 0 ? "waiting to be styled" : "Great utilisation!",
      href:  "/analytics",
      color: unusedCount > 0 ? "text-amber-400" : "text-green-400",
      bg:    unusedCount > 0 ? "bg-amber-400/10" : "bg-green-400/10",
    },
    {
      icon:  Tag,
      label: "Categories",
      value: categoryCount,
      sub:   `of 6 covered`,
      href:  "/closet",
      color: "text-violet-400",
      bg:    "bg-violet-400/10",
    },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase mb-5">
        Quick Stats
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ icon: Icon, label, value, sub, href, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors group"
            >
              <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs font-medium text-foreground-muted mt-0.5">{label}</p>
                <p className="text-[11px] text-foreground-faint mt-0.5 line-clamp-1">{sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
