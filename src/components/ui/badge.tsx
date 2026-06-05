import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      tone: {
        aurora: "border-aurora/30 bg-aurora/10 text-aurora",
        lightning: "border-lightning/30 bg-lightning/10 text-lightning-soft",
        nebula: "border-nebula/30 bg-nebula/10 text-nebula-soft",
        cosmic: "border-cosmic/30 bg-cosmic/10 text-cosmic-soft",
        muted: "border-white/10 bg-white/5 text-muted-foreground",
        destructive: "border-destructive/40 bg-destructive/15 text-red-200",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "aurora" && "bg-aurora animate-pulse-glow",
            tone === "lightning" && "bg-lightning",
            tone === "nebula" && "bg-nebula",
            tone === "cosmic" && "bg-cosmic",
            tone === "destructive" && "bg-red-400",
            (!tone || tone === "muted") && "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
