"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload, X, Sparkles, Check, AlertCircle, ChevronDown, Wifi,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { cn } from "@/utils/cn";
import { formatBytes } from "@/utils/formatters";
import { uploadWardrobeItem } from "@/actions/wardrobe";
import { useClassify } from "../hooks/useClassify";
import { toast } from "@/hooks/useToast";
import type { ClassificationResult } from "@/types";

const CATEGORIES    = ["tops", "bottoms", "dresses", "outerwear", "footwear", "accessories"] as const;
const SEASONS       = ["spring", "summer", "autumn", "winter"] as const;
const PATTERNS      = ["solid", "stripes", "plaid", "floral", "geometric", "animal", "abstract"] as const;
const MAX_SIZE      = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Step = "drop" | "preview" | "classify" | "details" | "saving" | "done";

interface UploadModalProps {
  open:     boolean;
  onClose:  () => void;
  onSaved:  () => void;
}

export function UploadModal({ open, onClose, onSaved }: UploadModalProps) {
  const [step,        setStep]        = useState<Step>("drop");
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [itemId,      setItemId]      = useState<string | null>(null);
  const [fileError,   setFileError]   = useState<string | null>(null);

  // Form fields
  const [name,     setName]     = useState("");
  const [category, setCategory] = useState("");
  const [color,    setColor]    = useState("");
  const [fabric,   setFabric]   = useState("");
  const [pattern,  setPattern]  = useState("");
  const [seasons,  setSeasons]  = useState<string[]>([]);
  const [style,    setStyle]    = useState("");

  const { classify, classification, classifying, classifyError } = useClassify();
  const abortRef = useRef<AbortController | null>(null);

  // ── Reset state ──────────────────────────────────────────────────────────────
  function reset() {
    setStep("drop");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setUploadedUrl(null);
    setItemId(null);
    setFileError(null);
    setName(""); setCategory(""); setColor("");
    setFabric(""); setPattern(""); setSeasons([]); setStyle("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  // ── Dropzone ─────────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => {
    setFileError(null);
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      setFileError(
        err.message.includes("size") ? `File too large (max ${formatBytes(MAX_SIZE)})` : "Invalid file type. Please use JPG, PNG, or WebP."
      );
      return;
    }
    if (accepted.length === 0) return;
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("preview");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "image/jpeg": [], "image/png": [], "image/webp": [], "image/avif": [] },
    maxSize:  MAX_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  // ── Upload + classify pipeline ───────────────────────────────────────────────
  async function handleUploadAndClassify() {
    if (!file) return;
    setStep("classify");

    // Step 1: upload to Supabase via Server Action
    const formData = new FormData();
    formData.append("file", file);

    const uploadResult = await uploadWardrobeItem(formData);
    if (uploadResult.error || !uploadResult.data) {
      toast({ variant: "destructive", title: "Upload failed", description: uploadResult.error ?? "Unknown error" });
      setStep("preview");
      return;
    }

    setUploadedUrl(uploadResult.data.imageUrl);
    setItemId(uploadResult.data.id);

    // Step 2: AI classify — pass itemId so results are persisted to DB
    const result: ClassificationResult | null = await classify(uploadResult.data.imageUrl, uploadResult.data.id);
    if (result) {
      applyClassification(result);
    }

    setStep("details");
  }

  function applyClassification(r: ClassificationResult) {
    if (r.category) setCategory(r.category);
    if (r.color)    setColor(r.color);
    if (r.fabric)   setFabric(r.fabric);
    if (r.pattern)  setPattern(r.pattern);
    if (r.season)   setSeasons(r.season);
    if (r.style)    setStyle(r.style);
  }

  // ── Save item details ─────────────────────────────────────────────────────────
  async function handleSave() {
    if (!itemId) return;
    setStep("saving");

    const res = await fetch(`/api/wardrobe/${itemId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:    name || undefined,
        category: category || undefined,
        color:   color   || undefined,
        fabric:  fabric  || undefined,
        pattern: pattern || undefined,
        season:  seasons.length > 0 ? seasons : undefined,
        style:   style   || undefined,
      }),
    });
    const json = await res.json();

    if (json.error) {
      toast({ variant: "destructive", title: "Could not save details", description: json.error });
      setStep("details");
      return;
    }

    setStep("done");
    toast({ title: "Item added ✨", description: "Your wardrobe has been updated." });
    setTimeout(() => {
      reset();
      onClose();
      onSaved();
    }, 1200);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.96,    y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* ── Step: Drop ───────────────────────────────────────────── */}
              {step === "drop" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="font-display text-2xl text-foreground">Add to wardrobe</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                      Upload a photo and our AI will classify it automatically.
                    </p>
                  </div>

                  <div
                    {...getRootProps()}
                    className={cn(
                      "relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300",
                      isDragActive
                        ? "border-accent bg-accent/5 scale-[1.02]"
                        : "border-border hover:border-accent/50 hover:bg-surface-2/50"
                    )}
                  >
                    <input {...getInputProps()} />

                    <div className={cn(
                      "flex flex-col items-center gap-4 transition-transform duration-300",
                      isDragActive && "scale-105"
                    )}>
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                        isDragActive ? "bg-accent/20 text-accent" : "bg-surface-2 text-foreground-faint"
                      )}>
                        <Upload className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {isDragActive ? "Drop it here" : "Drop your photo here"}
                        </p>
                        <p className="text-sm text-foreground-muted mt-1">
                          or <span className="text-accent">browse files</span>
                        </p>
                      </div>
                      <p className="text-xs text-foreground-faint">
                        JPG, PNG, WebP, AVIF — max 10MB
                      </p>
                    </div>
                  </div>

                  {fileError && (
                    <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {fileError}
                    </div>
                  )}

                  <p className="mt-6 text-xs text-foreground-faint text-center">
                    For best results, photograph items flat on a neutral background.
                  </p>
                </div>
              )}

              {/* ── Step: Preview ─────────────────────────────────────────── */}
              {step === "preview" && preview && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="font-display text-2xl text-foreground">Looks good?</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                      {file?.name} — {formatBytes(file?.size ?? 0)}
                    </p>
                  </div>

                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 mb-6">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={reset}>
                      Choose different
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handleUploadAndClassify}>
                      <Sparkles className="h-4 w-4" />
                      Upload & Classify
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step: Classifying ─────────────────────────────────────── */}
              {step === "classify" && (
                <div className="p-8">
                  <div className="flex flex-col items-center gap-6 py-8">
                    {/* Animated AI indicator */}
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
                      <div className="absolute inset-2 rounded-full bg-accent/20 animate-pulse" />
                      <div className="absolute inset-4 rounded-full bg-accent/30 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-accent animate-float" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground font-medium text-lg">
                        {classifying ? "Analysing your item…" : "Uploading…"}
                      </p>
                      <p className="text-sm text-foreground-muted mt-1">
                        {classifying
                          ? "Our AI is identifying the category, colour, and fabric."
                          : "Securely storing your image."}
                      </p>
                    </div>

                    {/* Steps list */}
                    <div className="w-full space-y-3 text-sm">
                      {[
                        { label: "Uploading image",       done: !!uploadedUrl },
                        { label: "AI classification",      done: false, active: classifying },
                        { label: "Saving to wardrobe",    done: false },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all",
                            s.done   ? "bg-accent border-accent"          :
                            s.active ? "border-accent animate-pulse-accent" :
                                       "border-border"
                          )}>
                            {s.done && <Check className="h-3 w-3 text-accent-foreground" />}
                          </div>
                          <span className={cn(
                            "transition-colors",
                            s.done   ? "text-foreground" :
                            s.active ? "text-accent"     :
                                       "text-foreground-faint"
                          )}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step: Details ─────────────────────────────────────────── */}
              {step === "details" && (
                <div className="p-8 max-h-[85vh] overflow-y-auto">
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-2xl text-foreground">Item details</h2>
                      {!classifyError && (
                        <span className="flex items-center gap-1 text-xs text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                          <Sparkles className="h-3 w-3" />
                          AI filled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted">
                      {classifyError
                        ? "AI classification unavailable — please fill in details manually."
                        : "Review and adjust the AI-generated details below."}
                    </p>
                  </div>

                  {/* Confidence meter — only shown when AI succeeded */}
                  {!classifyError && classification && (
                    <div className="mb-5">
                      <ConfidenceMeter classification={classification as import("../hooks/useClassify").EnrichedClassification} />
                    </div>
                  )}

                  {/* Preview thumbnail */}
                  {preview && (
                    <div className="flex gap-4 mb-6 p-3 rounded-xl bg-surface-2 border border-border">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                        <Image src={preview} alt="Item" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          label="Item name (optional)"
                          type="text"
                          placeholder="e.g. Black linen blazer"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => setCategory(category === c ? "" : c)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize",
                              category === c
                                ? "bg-accent/10 border-accent/50 text-accent"
                                : "border-border text-foreground-muted hover:border-border/80"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color + Pattern row */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Colour"
                        type="text"
                        placeholder="e.g. navy blue"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                          Pattern
                        </label>
                        <select
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          className="input-base w-full appearance-none pr-8"
                        >
                          <option value="">Select…</option>
                          {PATTERNS.map((p) => (
                            <option key={p} value={p} className="bg-surface capitalize">{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Fabric */}
                    <Input
                      label="Fabric (optional)"
                      type="text"
                      placeholder="e.g. cotton, denim, wool"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                    />

                    {/* Seasons */}
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Suitable seasons
                      </label>
                      <div className="flex gap-2">
                        {SEASONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSeasons((prev) =>
                              prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                            )}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize flex-1",
                              seasons.includes(s)
                                ? "bg-accent/10 border-accent/50 text-accent"
                                : "border-border text-foreground-muted hover:border-border/80"
                            )}
                          >
                            {s.slice(0, 2).toUpperCase()}
                            <span className="hidden sm:inline">{s.slice(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { reset(); onClose(); onSaved(); }}
                    >
                      Skip details
                    </Button>
                    <Button className="flex-1" onClick={handleSave}>
                      Save to wardrobe
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step: Saving ──────────────────────────────────────────── */}
              {step === "saving" && (
                <div className="p-8 flex flex-col items-center gap-4 py-16">
                  <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                  <p className="text-foreground-muted">Saving to your wardrobe…</p>
                </div>
              )}

              {/* ── Step: Done ────────────────────────────────────────────── */}
              {step === "done" && (
                <div className="p-8 flex flex-col items-center gap-4 py-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center"
                  >
                    <Check className="h-7 w-7 text-accent" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-foreground font-semibold text-lg">Added to wardrobe!</p>
                    <p className="text-sm text-foreground-muted mt-1">Your item has been saved.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
