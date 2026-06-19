import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?:  React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "input-base w-full transition-colors",
              icon && "pl-10",
              error && "border-destructive focus:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
