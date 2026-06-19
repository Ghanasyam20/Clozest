"use client";

import { useState } from "react";
import { motion }              from "framer-motion";
import { ArrowLeft }           from "lucide-react";
import { StepIndicator }       from "./StepIndicator";
import { FirstUpload }         from "./FirstUpload";
import { useOnboarding }       from "../context/OnboardingContext";
import { saveStyleProfile, completeOnboarding } from "@/actions/profile";
import { Button }              from "@/components/ui/button";
import { toast }               from "@/hooks/useToast";
import { LoadingSpinner }      from "@/components/shared/LoadingSpinner";

const STEPS = ["Your Style", "Colours", "First Item"];

export function UploadStepClient() {
  const { state, reset }          = useOnboarding();
  const [finishing, setFinishing] = useState(false);

  // NOTE: Removed the useEffect guard that was redirecting back to /style
  // when context was empty. This was blocking the "Skip setup" button in the
  // header layout. Users can arrive here via Skip or direct link — that's fine.

  async function finishOnboarding() {
    setFinishing(true);

    // Save style profile only if user selected styles during onboarding
    // If they skipped, styleTypes will be empty — save an empty profile
    if (state.styleTypes.length > 0) {
      const profileResult = await saveStyleProfile({
        styleTypes:     state.styleTypes,
        favoriteColors: state.favoriteColors,
      });

      if (profileResult.error) {
        toast({
          variant:     "destructive",
          title:       "Could not save preferences",
          description: profileResult.error,
        });
        setFinishing(false);
        return;
      }
    }

    // Mark onboarding complete in DB
    const onboardResult = await completeOnboarding();

    if (onboardResult.error) {
      toast({
        variant:     "destructive",
        title:       "Could not complete setup",
        description: onboardResult.error,
      });
      setFinishing(false);
      return;
    }

    reset();

    // Hard navigate — forces middleware to re-read the updated session from DB
    window.location.href = "/dashboard";
  }

  async function handleUploaded(_itemId: string) {
    await finishOnboarding();
  }

  async function handleSkip() {
    await finishOnboarding();
  }

  if (finishing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-foreground-muted text-sm animate-pulse">
          Setting up your wardrobe…
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <StepIndicator currentStep={3} totalSteps={3} labels={STEPS} />

      <div className="text-center">
        <p className="text-accent text-xs tracking-[0.3em] uppercase font-medium mb-3">
          Step 3 of 3 — Almost done
        </p>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Add your first piece
        </h1>
        <p className="text-foreground-muted max-w-md mx-auto leading-relaxed">
          Photograph any item in your wardrobe and upload it here.
          Our AI will classify it automatically — or skip and add items later.
        </p>
      </div>

      {/* Summary of what's been chosen */}
      {state.styleTypes.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 py-2">
          {state.styleTypes.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs text-accent capitalize"
            >
              {s.replace("-", " ")}
            </span>
          ))}
          {state.styleTypes.length > 3 && (
            <span className="text-xs text-foreground-faint">
              +{state.styleTypes.length - 3} more
            </span>
          )}
          {state.favoriteColors.length > 0 && (
            <span className="text-xs text-foreground-faint">
              · {state.favoriteColors.length} colour{state.favoriteColors.length !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>
      )}

      <FirstUpload onUploaded={handleUploaded} onSkip={handleSkip} />

      <div className="flex justify-start pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 text-foreground-faint"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      </div>
    </motion.div>
  );
}
