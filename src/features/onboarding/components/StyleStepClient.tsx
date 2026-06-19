"use client";

import { useRouter }        from "next/navigation";
import { motion }           from "framer-motion";
import { ArrowRight }       from "lucide-react";
import { StepIndicator }    from "./StepIndicator";
import { StyleSelector }    from "./StyleSelector";
import { useOnboarding }    from "../context/OnboardingContext";
import { Button }           from "@/components/ui/button";
import { toast }            from "@/hooks/useToast";

const STEPS = ["Your Style", "Colours", "First Item"];

export function StyleStepClient() {
  const router  = useRouter();
  const { state, setStyleTypes } = useOnboarding();

  function handleContinue() {
    if (state.styleTypes.length === 0) {
      toast({
        variant:     "destructive",
        title:       "Select at least one style",
        description: "This helps us personalise your outfit recommendations.",
      });
      return;
    }
    router.push("/onboarding/colors");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <StepIndicator currentStep={1} totalSteps={3} labels={STEPS} />

      {/* Header */}
      <div className="text-center">
        <p className="text-accent text-xs tracking-[0.3em] uppercase font-medium mb-3">
          Step 1 of 3
        </p>
        <h1 className="font-display text-display-md text-foreground mb-3">
          What&apos;s your style?
        </h1>
        <p className="text-foreground-muted max-w-md mx-auto leading-relaxed">
          Select the aesthetics that resonate with you. You can pick multiple —
          this shapes every outfit recommendation Clozest makes for you.
        </p>
      </div>

      {/* Selector */}
      <StyleSelector
        selected={state.styleTypes}
        onChange={setStyleTypes}
      />

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={state.styleTypes.length === 0}
          className="group min-w-[180px]"
        >
          Continue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
