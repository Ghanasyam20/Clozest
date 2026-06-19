import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-6",
        className
      )}
    >
      {icon && (
        <div className="mb-6 p-5 rounded-2xl bg-surface-2 text-foreground-faint animate-float">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-foreground-muted max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
