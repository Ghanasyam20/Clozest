import type { Metadata } from "next";
import { ColorsStepClient } from "@/features/onboarding/components/ColorsStepClient";

export const metadata: Metadata = { title: "Your colour palette · Clozest" };

export default function OnboardingColorsPage() {
  return <ColorsStepClient />;
}
