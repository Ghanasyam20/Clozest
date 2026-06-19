"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface HealthScoreWidgetProps {
  score:         number;
  variety:       number;
  utilisation:   number;
  outfitPotential: number;
  totalItems:    number;
}

function ScoreDonut({ score }: { score: number }) {
  const radius      = 52;
  const circ        = 2 * Math.PI * radius;
  const dashOffset  = circ - (score / 100) * circ;

  const color =
    score >= 75 ? "#C8A46B" :
    score >= 50 ? "#A3C4BC" :
    score >= 25 ? "#E8A87C" : "#E07070";

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="10"
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx="60" cy="60" r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      {/* Score label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-foreground-muted">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-foreground-muted">{label}</span>
        <span className="text-foreground font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        />
      </div>
    </div>
  );
}

const GRADE_LABEL: Record<string, string> = {
  A: "Excellent", B: "Good", C: "Fair", D: "Needs Work", F: "Just Starting",
};

export function HealthScoreWidget({
  score, variety, utilisation, outfitPotential, totalItems,
}: HealthScoreWidgetProps) {
  const grade =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 35 ? "D" : "F";

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
            Closet Health
          </h2>
          <p className="text-foreground font-semibold mt-0.5">
            Grade {grade} &mdash;{" "}
            <span className="text-foreground-muted font-normal text-sm">
              {GRADE_LABEL[grade]}
            </span>
          </p>
        </div>
        <Link
          href="/analytics"
          className="flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <ScoreDonut score={score} />
        <div className="flex-1 space-y-3 min-w-0">
          <ScoreBar label="Utilisation"     value={utilisation}     color="#C8A46B" />
          <ScoreBar label="Variety"         value={variety}         color="#A3C4BC" />
          <ScoreBar label="Outfit Potential" value={outfitPotential} color="#C8A4C4" />
        </div>
      </div>

      {totalItems === 0 && (
        <p className="text-xs text-foreground-faint text-center">
          Add items to your closet to see your health score.
        </p>
      )}
    </div>
  );
}
