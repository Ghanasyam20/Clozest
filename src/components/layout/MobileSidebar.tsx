"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] lg:hidden"
              style={{ backgroundColor: "rgba(15, 15, 16, 0.97)", backdropFilter: "blur(8px)" }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer — explicit height:100vh via inline style rather than
                relying on `inset-y-0` + flex to resolve it, since flex-1
                children (the <nav>) need a definite height on the parent
                to distribute into. This removes any ambiguity that was
                collapsing the nav to 0px. */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 z-[9999] w-[260px] max-w-[80vw] bg-surface border-r border-border lg:hidden"
              style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                paddingTop: "1.5rem",
                paddingBottom: "1.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-10 px-3 flex-shrink-0">
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

              {/* Nav items — explicit flex:1 1 auto + minHeight:0 via
                  inline style, the most defensive way to force a flex
                  child to actually claim remaining space regardless of
                  any competing class or ambiguous parent height. */}
              <nav
                style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}
                className="space-y-1"
              >
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
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-foreground-faint hover:text-destructive hover:bg-surface-2 transition-all duration-200 flex-shrink-0"
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
