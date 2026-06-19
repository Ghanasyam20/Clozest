import type { Metadata } from "next";
import { StyleStepClient } from "@/features/onboarding/components/StyleStepClient";

export const metadata: Metadata = { title: "Choose your style · Clozest" };

export default function OnboardingStylePage() {
  return <StyleStepClient />;
}
