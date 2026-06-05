"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils/cn";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
  }
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-lightning">*</span>}
  </LabelPrimitive.Root>
));
Label.displayName = "Label";

/** Small helper/error text shown under a field. */
export function FieldHint({
  children,
  error,
  className,
}: {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      className={cn(
        "text-xs",
        error ? "text-red-300" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}
