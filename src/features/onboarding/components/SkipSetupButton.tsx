"use client";

import { useState } from "react";
import { completeOnboarding } from "@/actions/profile";

export function SkipSetupButton() {
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    // Mark onboarding as done so middleware won't redirect back
    await completeOnboarding();
    // Hard navigate to force session/middleware refresh
    window.location.href = "/dashboard";
  }

  return (
    <button
      onClick={handleSkip}
      disabled={loading}
      className="text-xs text-foreground-faint hover:text-foreground-muted transition-colors disabled:opacity-50"
    >
      {loading ? "Skipping…" : "Skip setup"}
    </button>
  );
}
