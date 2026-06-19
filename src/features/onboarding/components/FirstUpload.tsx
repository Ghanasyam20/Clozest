"use client";

import { useState, useCallback } from "react";
import { useDropzone }            from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Image                      from "next/image";
import { Upload, CheckCircle2, Loader2, X, ImageIcon } from "lucide-react";
import { uploadWardrobeItem }     from "@/actions/wardrobe";
import { toast }                  from "@/hooks/useToast";
import { formatBytes }            from "@/utils/formatters";
import { cn }                     from "@/utils/cn";

interface FirstUploadProps {
  onUploaded: (itemId: string) => void;
  onSkip:     () => void;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

export function FirstUpload({ onUploaded, onSkip }: FirstUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file,    setFile]    = useState<File | null>(null);
  const [status,  setStatus]  = useState<UploadStatus>("idle");
  const [errorMsg, setError]  = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: File[]) => {
    if (rejected.length > 0) {
      setError("File rejected — must be JPG, PNG, or WebP under 10 MB.");
      return;
    }
    const f = accepted[0];
    if (!f) return;

    setFile(f);
    setError(null);
    setStatus("idle");

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize:  10 * 1024 * 1024,
    maxFiles: 1,
  });

  function clearFile() {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadWardrobeItem(formData);

    if (result.error || !result.data) {
      setStatus("error");
      setError(result.error ?? "Upload failed");
      toast({ variant: "destructive", title: "Upload failed", description: result.error ?? undefined });
      return;
    }

    setStatus("done");
    toast({ title: "First item added ✨", description: "Your AI stylist just got smarter." });
    setTimeout(() => onUploaded(result.data!.id), 800);
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* ── Preview state ─────────────────────────────────────────────── */}
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-56 aspect-[3/4]"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-xl">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="224px"
              />
              {/* Overlay for done state */}
              {status === "done" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-accent" />
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Clear button */}
            {status === "idle" && (
              <button
                onClick={clearFile}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-foreground-faint hover:text-foreground transition-colors shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* File info */}
            {file && status !== "done" && (
              <p className="text-center text-xs text-foreground-muted mt-3">
                {file.name} · {formatBytes(file.size)}
              </p>
            )}
          </motion.div>
        ) : (
          /* ── Dropzone ─────────────────────────────────────────────────── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
              isDragActive
                ? "border-accent bg-accent/5 scale-[1.01]"
                : "border-border hover:border-accent/50 hover:bg-surface-2"
            )}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { y: -4 } : { y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-5">
                <ImageIcon className="h-7 w-7 text-foreground-faint" />
              </div>
              {isDragActive ? (
                <p className="text-accent font-medium">Drop it here</p>
              ) : (
                <>
                  <p className="text-foreground font-medium mb-1">
                    Drop a clothing photo here
                  </p>
                  <p className="text-sm text-foreground-muted">
                    or <span className="text-accent">browse files</span>
                  </p>
                  <p className="text-xs text-foreground-faint mt-3">
                    JPG, PNG, WebP · max 10 MB
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {errorMsg && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive text-center"
        >
          {errorMsg}
        </motion.p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {preview && status === "idle" && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleUpload}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            Upload &amp; continue
          </motion.button>
        )}

        {status === "uploading" && (
          <div className="flex items-center justify-center gap-2 text-foreground-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading…</span>
          </div>
        )}

        {status !== "uploading" && status !== "done" && (
          <button
            onClick={onSkip}
            className="btn-ghost text-sm w-full sm:w-auto text-center"
          >
            {preview ? "Skip for now" : "Skip this step →"}
          </button>
        )}
      </div>
    </div>
  );
}
