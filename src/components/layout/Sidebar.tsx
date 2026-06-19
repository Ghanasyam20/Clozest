"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  BarChart3,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/closet", label: "My Closet", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] xl:w-[240px] border-r border-border bg-surface h-full py-6 px-4 flex-shrink-0">
      {/* Logo */}
      <Link href="/dashboard" className="px-3 mb-10">
        <span className="font-display text-xl text-gradient-gold tracking-widest uppercase">
          Clozest
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-2",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={async () => {
          await signOut({ redirect: false });
          window.location.href = "/";
        }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-faint hover:text-destructive hover:bg-surface-2 transition-all duration-200 mt-4"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
