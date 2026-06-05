"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-foreground shadow-inner transition-colors",
          "placeholder:text-muted-foreground/70",
          "focus-visible:border-aurora/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid &&
            "border-destructive/60 focus-visible:border-destructive/60 focus-visible:ring-destructive/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
