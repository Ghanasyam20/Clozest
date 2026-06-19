import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?:      "sm" | "md" | "lg";
  className?: string;
  label?:     string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full border-transparent border-t-accent animate-spin",
          sizes[size]
        )}
        style={{ borderStyle: "solid" }}
        aria-label={label ?? "Loading"}
        role="status"
      />
      {label && (
        <p className="text-sm text-foreground-muted animate-pulse">{label}</p>
      )}
    </div>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
