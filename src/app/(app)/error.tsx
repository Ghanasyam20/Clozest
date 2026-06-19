"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-foreground-muted max-w-sm leading-relaxed">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-foreground-faint mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { window.location.href = "/dashboard"; }}>
          Go to Dashboard
        </Button>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
