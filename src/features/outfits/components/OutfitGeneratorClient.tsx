"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, Save, Tag, Check, ArrowLeft, ArrowRight,
  Briefcase, Coffee, PartyPopper, Dumbbell, Plane, Heart,
  Cloud, Sun, Thermometer, Edit2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveOutfit } from "@/actions/outfits";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "@/hooks/useToast";
import { capitalise } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { StyleProfile, WardrobeItem } from "@/types";

const OCCASIONS = [
  { id: "casual",  label: "Casual",  icon: Coffee,      desc: "Everyday relaxed look" },
  { id: "work",    label: "Work",    icon: Briefcase,   desc: "Office-ready & polished" },
  { id: "date",    label: "Date",    icon: Heart,       desc: "Romantic & refined" },
  { id: "party",   label: "Party",   icon: PartyPopper, desc: "Stand out & celebrate" },
  { id: "sport",   label: "Sport",   icon: Dumbbell,    desc: "Active & comfortable" },
  { id: "travel",  label: "Travel",  icon: Plane,       desc: "Practical & versatile" },
] as const;

type Occasion = (typeof OCCASIONS)[number]["id"];
type Step = "occasion" | "preferences" | "result";

interface GeneratedOutfit {
  items:           WardrobeItem[];
  confidenceScore: number;
  reasoning:       string;
  itemsHash:       string;
}

interface OutfitGeneratorClientProps {
  wardrobeCount: number;
  styleProfile:  StyleProfile | null;
}

// ── Animated step container ───────────────────────────────────────────────────
const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:   (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export function OutfitGeneratorClient({
  wardrobeCount, styleProfile,
}: OutfitGeneratorClientProps) {
  const { weather } = useWeather();

  const [step,        setStep]       = useState<Step>("occasion");
  const [direction,   setDirection]  = useState(1);
  const [occasion,    setOccasion]   = useState<Occasion | null>(null);
  const [useWeatherFlag, setUseWeatherFlag] = useState(true);

  // Style overrides (editable on preferences step)
  const defaultStyles  = (styleProfile?.styleTypes  as string[] | undefined) ?? [];
  const defaultColors  = (styleProfile?.favoriteColors as string[] | undefined) ?? [];
  const [styleOverride, setStyleOverride] = useState<string[]>(defaultStyles);

  // Result state
  const [outfit,      setOutfit]    = useState<GeneratedOutfit | null>(null);
  const [generating,  setGenerating] = useState(false);
  const [genError,    setGenError]  = useState<string | null>(null);

  // Save state
  const [saving,      setSaving]    = useState(false);
  const [savedId,     setSavedId]   = useState<string | null>(null);
  const [outfitName,  setOutfitName] = useState("");
  const [editingName, setEditingName] = useState(false);

  function goTo(target: Step, dir = 1) {
    setDirection(dir);
    setStep(target);
  }

  async function handleGenerate() {
    if (!occasion) return;
    setGenerating(true);
    setGenError(null);
    setOutfit(null);
    setSavedId(null);

    try {
      const res = await fetch("/api/ai/generate-outfit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          weatherData: useWeatherFlag && weather ? weather : undefined,
          styleProfile: {
            styleTypes:     styleOverride,
            favoriteColors: defaultColors,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Generation failed");

      const d = json.data;
      setOutfit({
        items:           d.items ?? [],
        confidenceScore: d.confidenceScore ?? d.confidence_score ?? 0,
        reasoning:       d.reasoning ?? "",
        itemsHash:       d.itemsHash ?? "",
      });
      goTo("result", 1);
    } catch (e) {
      const msg = (e as Error).message;
      setGenError(msg);
      toast({ variant: "destructive", title: "Generation failed", description: msg });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!outfit || !occasion) return;
    setSaving(true);

    const result = await saveOutfit({
      name:            outfitName.trim() || undefined,
      occasion,
      weatherData:     useWeatherFlag && weather ? weather : undefined,
      confidenceScore: outfit.confidenceScore,
      itemIds:         outfit.items.map((i) => i.id),
      itemsHash:       outfit.itemsHash,
    });

    if (result.error) {
      toast({ variant: "destructive", title: "Save failed", description: result.error });
    } else {
      toast({ title: "Outfit saved ✨" });
      setSavedId(result.data?.id ?? null);
    }
    setSaving(false);
  }

  if (wardrobeCount < 2) {
    return (
      <div className="max-w-lg animate-fade-in space-y-6">
        <Link href="/outfits" className="flex items-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <div className="text-5xl">👔</div>
          <h2 className="font-display text-2xl text-foreground">Not enough items</h2>
          <p className="text-foreground-muted text-sm">Add at least 2 items to generate outfits.</p>
          <Link href="/closet"><Button>Go to My Closet</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <Link href="/outfits" className="flex items-center gap-2 text-foreground-muted text-sm mb-3 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Saved outfits
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-display-md text-foreground leading-none">
            Generate Outfit
          </h1>
          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {(["occasion", "preferences", "result"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === s ? "w-6 bg-accent" : "w-3 bg-border"
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-foreground-muted mt-2 text-sm">
          {wardrobeCount} items · {step === "occasion" ? "Choose an occasion" : step === "preferences" ? "Refine preferences" : "Your outfit"}
          {weather && step !== "result" && ` · ${weather.temperature}°C`}
        </p>
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── STEP 1: Occasion ─────────────────────────────────────────── */}
          {step === "occasion" && (
            <motion.div
              key="occasion"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-6">
                <p className="text-xs text-foreground-muted tracking-wide uppercase font-medium mb-4">
                  What&apos;s the occasion?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OCCASIONS.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setOccasion(id)}
                      className={cn(
                        "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        occasion === id
                          ? "bg-accent/10 border-accent/60"
                          : "border-border hover:border-accent/30 hover:bg-surface-2"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        occasion === id ? "bg-accent/20" : "bg-surface-2"
                      )}>
                        <Icon className={cn("h-4 w-4", occasion === id ? "text-accent" : "text-foreground-muted")} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold", occasion === id ? "text-accent" : "text-foreground")}>
                          {label}
                        </p>
                        <p className="text-[10px] text-foreground-faint mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather card */}
              {weather && (
                <div className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {weather.isRaining ? "🌧️" : weather.temperature >= 25 ? "☀️" : weather.temperature >= 15 ? "⛅" : "❄️"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {weather.temperature}°C · {weather.condition}
                      </p>
                      <p className="text-xs text-foreground-faint">
                        {useWeatherFlag ? "Outfit will be weather-appropriate" : "Weather ignored"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseWeatherFlag((v) => !v)}
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-all",
                      useWeatherFlag
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-foreground-faint"
                    )}
                  >
                    {useWeatherFlag ? "On" : "Off"}
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => goTo("preferences", 1)}
                  disabled={!occasion}
                  className="group min-w-[160px]"
                >
                  Next
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Preferences ──────────────────────────────────────── */}
          {step === "preferences" && (
            <motion.div
              key="preferences"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="glass rounded-2xl p-6 space-y-5">
                {/* Occasion summary */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="p-2 rounded-lg bg-accent/10">
                    {occasion && (() => {
                      const occ = OCCASIONS.find((o) => o.id === occasion);
                      const Icon = occ?.icon ?? Coffee;
                      return <Icon className="h-4 w-4 text-accent" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-foreground-faint uppercase tracking-wide">Occasion</p>
                    <p className="text-sm font-medium text-foreground capitalize">{occasion}</p>
                  </div>
                  <button
                    onClick={() => goTo("occasion", -1)}
                    className="text-xs text-accent hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Style preferences */}
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-wide font-medium mb-3">
                    Style preferences
                    {defaultStyles.length > 0 && (
                      <span className="ml-2 text-foreground-faint normal-case">(from your Style DNA)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["minimalist", "streetwear", "korean", "old-money", "formal", "vintage", "bohemian", "athleisure", "casual"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyleOverride((prev) =>
                          prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                        )}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs border transition-all capitalize",
                          styleOverride.includes(s)
                            ? "bg-accent/10 border-accent/40 text-accent"
                            : "border-border text-foreground-muted hover:border-accent/30"
                        )}
                      >
                        {s.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                  {defaultStyles.length > 0 && styleOverride.join(",") !== defaultStyles.join(",") && (
                    <button
                      onClick={() => setStyleOverride(defaultStyles)}
                      className="text-xs text-foreground-faint hover:text-foreground mt-2 underline"
                    >
                      Reset to my Style DNA
                    </button>
                  )}
                </div>

                {/* Weather override */}
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-wide font-medium mb-2">
                    Weather consideration
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUseWeatherFlag(true)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs text-center transition-all",
                        useWeatherFlag
                          ? "bg-accent/10 border-accent/40 text-accent"
                          : "border-border text-foreground-muted hover:border-accent/30"
                      )}
                    >
                      Use current weather
                    </button>
                    <button
                      onClick={() => setUseWeatherFlag(false)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs text-center transition-all",
                        !useWeatherFlag
                          ? "bg-accent/10 border-accent/40 text-accent"
                          : "border-border text-foreground-muted hover:border-accent/30"
                      )}
                    >
                      Ignore weather
                    </button>
                  </div>
                </div>
              </div>

              {genError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {genError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" size="lg" onClick={() => goTo("occasion", -1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={generating}
                  loading={generating}
                  className="flex-1 group"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Styling your look…" : "Generate outfit"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Result ───────────────────────────────────────────── */}
          {step === "result" && outfit && (
            <motion.div
              key="result"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              {/* Result header */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Editable outfit name */}
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={outfitName}
                            onChange={(e) => setOutfitName(e.target.value)}
                            placeholder="Name this outfit…"
                            maxLength={60}
                            className="input-base text-sm py-1 px-2 h-7 w-44"
                            autoFocus
                            onBlur={() => setEditingName(false)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                          />
                          <button onClick={() => setEditingName(false)} className="text-foreground-faint hover:text-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingName(true)}
                          className="flex items-center gap-1.5 group"
                        >
                          <span className="font-display text-xl text-foreground">
                            {outfitName || "Your outfit"}
                          </span>
                          <Edit2 className="h-3.5 w-3.5 text-foreground-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted">
                      {outfit.items.length} pieces · {Math.round(outfit.confidenceScore * 100)}% match ·{" "}
                      <span className="capitalize">{occasion}</span>
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0",
                    outfit.confidenceScore >= 0.8
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : outfit.confidenceScore >= 0.6
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  )}>
                    {outfit.confidenceScore >= 0.8 ? "Great" : outfit.confidenceScore >= 0.6 ? "Good" : "Decent"} match
                  </span>
                </div>

                {/* Item flat-lay grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {outfit.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link href={`/closet/${item.id}`} className="group block">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border mb-2">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name ?? ""}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="200px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Tag className="h-7 w-7 text-foreground-faint" />
                            </div>
                          )}
                          {/* Category overlay */}
                          {item.category && (
                            <div className="absolute bottom-2 left-2">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-background/70 backdrop-blur-sm text-foreground-muted capitalize border border-border/50">
                                {item.category}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">
                          {item.name ?? capitalise(item.category ?? "Item")}
                        </p>
                        {item.color && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full border border-border/50"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[10px] text-foreground-faint capitalize">{item.color}</span>
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* AI reasoning */}
                {outfit.reasoning && (
                  <p className="text-xs text-foreground-faint italic mt-4 pt-3 border-t border-border">
                    {outfit.reasoning}
                  </p>
                )}
              </div>

              {/* Action row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="sm:flex-1 gap-2"
                  onClick={() => {
                    setOutfit(null);
                    setSavedId(null);
                    goTo("preferences", -1);
                  }}
                >
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </Button>

                {savedId ? (
                  <Link href={`/outfits/${savedId}`} className="sm:flex-1">
                    <Button className="w-full gap-2">
                      <Check className="h-4 w-4" /> View saved outfit
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="sm:flex-1 gap-2"
                    onClick={handleSave}
                    disabled={saving}
                    loading={saving}
                  >
                    <Save className="h-4 w-4" /> Save outfit
                  </Button>
                )}
              </div>

              {savedId && (
                <button
                  onClick={() => {
                    setOutfit(null);
                    setSavedId(null);
                    setOutfitName("");
                    goTo("occasion", -1);
                  }}
                  className="w-full text-xs text-foreground-faint hover:text-foreground transition-colors text-center"
                >
                  ← Generate another
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
