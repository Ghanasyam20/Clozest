import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingProvider } from "@/features/onboarding/context/OnboardingContext";
import { SkipSetupButton } from "@/features/onboarding/components/SkipSetupButton";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <OnboardingProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 flex-shrink-0">
          <Link href="/">
            <span className="font-display text-xl text-gradient-gold tracking-widest uppercase select-none">
              Clozest
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-xs text-foreground-faint tracking-wide hidden sm:block">
              Setting up your wardrobe…
            </p>
            <SkipSetupButton />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl">{children}</div>
        </main>
      </div>
    </OnboardingProvider>
  );
}
