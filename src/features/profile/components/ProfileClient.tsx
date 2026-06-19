"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Edit2, Check, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile, saveStyleProfile } from "@/actions/profile";
import { toast } from "@/hooks/useToast";
import { formatDate } from "@/utils/formatters";
import { capitalise } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { User as UserType, StyleProfile } from "@/types";

const STYLE_AESTHETICS = [
  "minimalist", "streetwear", "korean", "old-money",
  "formal", "vintage", "bohemian", "athleisure", "preppy", "dark-academia",
] as const;

const COLORS = [
  { name: "Black",  hex: "#1a1a1a" }, { name: "White",  hex: "#f5f5f5" },
  { name: "Camel",  hex: "#C19A6B" }, { name: "Navy",   hex: "#1B2A4A" },
  { name: "Grey",   hex: "#9E9E9E" }, { name: "Olive",  hex: "#6B7645" },
  { name: "Rust",   hex: "#B7410E" }, { name: "Cream",  hex: "#FFFDD0" },
  { name: "Forest", hex: "#228B22" }, { name: "Blush",  hex: "#FFB6C1" },
  { name: "Cobalt", hex: "#0047AB" }, { name: "Sage",   hex: "#9DC183" },
];

interface ProfileClientProps {
  user:         UserType & { createdAt: Date };
  styleProfile: StyleProfile | null;
}

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function ProfileClient({ user, styleProfile }: ProfileClientProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingStyle,   setEditingStyle]   = useState(false);
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingStyle,    setSavingStyle]    = useState(false);

  // Profile fields
  const [name, setName] = useState(user.name ?? "");

  // Style fields
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    (styleProfile?.styleTypes as string[]) ?? []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    (styleProfile?.favoriteColors as string[]) ?? []
  );

  async function handleSaveProfile() {
    setSavingProfile(true);
    const result = await updateProfile({ name });
    if (result.error) {
      toast({ variant: "destructive", title: "Save failed", description: result.error });
    } else {
      toast({ title: "Profile updated ✓" });
      setEditingProfile(false);
    }
    setSavingProfile(false);
  }

  async function handleSaveStyle() {
    if (selectedStyles.length === 0) {
      toast({ variant: "destructive", title: "Select at least one style" });
      return;
    }
    setSavingStyle(true);
    const result = await saveStyleProfile({
      styleTypes:     selectedStyles,
      favoriteColors: selectedColors,
    });
    if (result.error) {
      toast({ variant: "destructive", title: "Save failed", description: result.error });
    } else {
      toast({ title: "Style DNA updated ✓" });
      setEditingStyle(false);
    }
    setSavingStyle(false);
  }

  function toggleStyle(s: string) {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleColor(name: string) {
    setSelectedColors((prev) =>
      prev.includes(name)
        ? prev.filter((x) => x !== name)
        : prev.length < 5 ? [...prev, name] : prev
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CZ";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={item}>
        <h1 className="font-display text-display-md text-foreground leading-none">Profile</h1>
        <p className="text-foreground-muted mt-2 text-sm">Manage your account and style preferences.</p>
      </motion.div>

      {/* ── Basic Profile ────────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
            Account
          </h2>
          {!editingProfile ? (
            <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)}>
                Cancel
              </Button>
              <Button size="sm" loading={savingProfile} onClick={handleSaveProfile}>
                <Check className="h-3.5 w-3.5 mr-1.5" /> Save
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent text-xl font-bold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 space-y-4">
            {editingProfile ? (
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-4 w-4" />}
              />
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 text-foreground-faint" />
                  <span className="text-foreground font-medium">{user.name ?? "No name set"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-foreground-faint" />
                  <span className="text-foreground-muted">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-foreground-faint" />
                  <span className="text-foreground-muted">
                    Member since {formatDate((user as { createdAt: Date }).createdAt)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Style DNA ────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-medium text-foreground-muted tracking-wide uppercase">
              Style DNA
            </h2>
          </div>
          {!editingStyle ? (
            <Button variant="ghost" size="sm" onClick={() => setEditingStyle(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingStyle(false)}>
                Cancel
              </Button>
              <Button size="sm" loading={savingStyle} onClick={handleSaveStyle}>
                <Check className="h-3.5 w-3.5 mr-1.5" /> Save
              </Button>
            </div>
          )}
        </div>

        {/* Aesthetics */}
        <div className="mb-6">
          <p className="text-xs text-foreground-muted mb-3 uppercase tracking-wide">
            Your aesthetics
          </p>
          <div className="flex flex-wrap gap-2">
            {editingStyle
              ? STYLE_AESTHETICS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm border transition-all capitalize",
                      selectedStyles.includes(s)
                        ? "bg-accent/10 border-accent/50 text-accent"
                        : "border-border text-foreground-muted hover:border-accent/30"
                    )}
                  >
                    {s.replace("-", " ")}
                  </button>
                ))
              : selectedStyles.length > 0
              ? selectedStyles.map((s) => (
                  <span
                    key={s}
                    className="px-4 py-1.5 rounded-xl text-sm border border-accent/30 bg-accent/10 text-accent capitalize"
                  >
                    {s.replace("-", " ")}
                  </span>
                ))
              : (
                <p className="text-sm text-foreground-faint italic">
                  No styles set — click Edit to add your aesthetics.
                </p>
              )
            }
          </div>
        </div>

        {/* Favourite colours */}
        <div>
          <p className="text-xs text-foreground-muted mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Favourite colours {editingStyle && <span className="text-foreground-faint">(up to 5)</span>}
          </p>
          {editingStyle ? (
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggleColor(c.name)}
                  title={c.name}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    selectedColors.includes(c.name)
                      ? "border-accent scale-110 shadow-lg shadow-accent/20"
                      : "border-transparent hover:border-border"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          ) : selectedColors.length > 0 ? (
            <div className="flex items-center gap-3 flex-wrap">
              {selectedColors.map((colorName) => {
                const hex = COLORS.find((c) => c.name === colorName)?.hex ?? colorName;
                return (
                  <div key={colorName} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-sm text-foreground-muted">{colorName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-foreground-faint italic">No colours set.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
