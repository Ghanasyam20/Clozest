import type { Metadata } from "next";
import { UploadStepClient } from "@/features/onboarding/components/UploadStepClient";

export const metadata: Metadata = { title: "Add your first item · Clozest" };

export default function OnboardingUploadPage() {
  return <UploadStepClient />;
}
