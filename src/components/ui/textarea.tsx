"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-[110px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-foreground shadow-inner transition-colors",
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
Textarea.displayName = "Textarea";
