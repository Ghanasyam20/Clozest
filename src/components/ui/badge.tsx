import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "border-border bg-surface-2 text-foreground-muted",
        accent:      "border-accent/30 bg-accent/10 text-accent",
        success:     "border-green-500/30 bg-green-500/10 text-green-400",
        warning:     "border-amber-500/30 bg-amber-500/10 text-amber-400",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline:     "border-border bg-transparent text-foreground-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
