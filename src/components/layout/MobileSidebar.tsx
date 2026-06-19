"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  BarChart3,
  User,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/closet", label: "My Closet", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-surface-2 text-foreground-muted transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border flex flex-col py-6 px-4 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-10 px-3">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <span className="font-display text-xl text-gradient-gold tracking-widest uppercase">
                    Clozest
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-faint hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
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
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-foreground-faint hover:text-destructive hover:bg-surface-2 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
