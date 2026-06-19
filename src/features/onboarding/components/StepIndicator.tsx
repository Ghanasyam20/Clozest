"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface StepIndicatorProps {
  currentStep: number;   // 1-based
  totalSteps:  number;
  labels?:     string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full mb-10">
      {/* Progress bar */}
      <div className="relative h-1 bg-border rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step dots + labels */}
      {labels && (
        <div className="flex justify-between">
          {labels.map((label, i) => {
            const step      = i + 1;
            const completed = step < currentStep;
            const active    = step === currentStep;

            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <motion.div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors",
                    completed ? "bg-accent border-accent text-accent-foreground" :
                    active    ? "border-accent text-accent bg-accent/10" :
                                "border-border text-foreground-faint bg-transparent"
                  )}
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {completed
                    ? <Check className="h-3 w-3" />
                    : <span>{step}</span>
                  }
                </motion.div>
                <span className={cn(
                  "text-[10px] tracking-wide hidden sm:block",
                  active    ? "text-accent font-medium" :
                  completed ? "text-foreground-muted" :
                              "text-foreground-faint"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
