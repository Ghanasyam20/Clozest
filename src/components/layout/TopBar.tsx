"use client";

import type { Session } from "next-auth";
import { Bell } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  user: Session["user"];
}

export function TopBar({ user }: TopBarProps) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CZ";

  return (
    // z-30 here is intentionally well below MobileSidebar's backdrop
    // (z-[9998]) and drawer (z-[9999]), so when the mobile nav opens,
    // this header — including its own "Clozest" wordmark — is fully
    // covered rather than bleeding through or doubling up with the
    // drawer's own logo.
    <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
      {/* Mobile nav trigger */}
      <MobileSidebar />

      {/* Mobile logo — centred between hamburger and avatar */}
      <span className="font-display text-lg text-gradient-gold tracking-widest uppercase lg:hidden">
        Clozest
      </span>

      {/* Spacer for desktop (sidebar takes left side) */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4 text-foreground-muted" />
        </Button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">{user?.name}</p>
            <p className="text-xs text-foreground-faint mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
