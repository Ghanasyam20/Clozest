"use client";

import { useRouter }        from "next/navigation";
import { motion }           from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StepIndicator }    from "./StepIndicator";
import { ColorPicker }      from "./ColorPicker";
import { useOnboarding }    from "../context/OnboardingContext";
import { Button }           from "@/components/ui/button";

const STEPS = ["Your Style", "Colours", "First Item"];

export function ColorsStepClient() {
  const router  = useRouter();
  const { state, setFavoriteColors } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <StepIndicator currentStep={2} totalSteps={3} labels={STEPS} />

      {/* Header */}
      <div className="text-center">
        <p className="text-accent text-xs tracking-[0.3em] uppercase font-medium mb-3">
          Step 2 of 3
        </p>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Your colour palette
        </h1>
        <p className="text-foreground-muted max-w-md mx-auto leading-relaxed">
          Which colours dominate your wardrobe? Pick up to five favourites.
          This helps the AI build harmonious outfit combinations.
        </p>
      </div>

      {/* Colour picker */}
      <ColorPicker
        selected={state.favoriteColors}
        onChange={setFavoriteColors}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          size="lg"
          onClick={() => router.push("/onboarding/upload")}
          className="group min-w-[180px]"
        >
          {state.favoriteColors.length === 0 ? "Skip colours" : "Continue"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
