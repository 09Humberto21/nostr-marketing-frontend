"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToastStore, type Toast, type ToastVariant } from "@/lib/store/toast-store";

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; ring: string; iconColor: string }
> = {
  success: { icon: CheckCircle2, ring: "border-aurora/40 shadow-glow-aurora", iconColor: "text-aurora" },
  error: { icon: X, ring: "border-destructive/50", iconColor: "text-red-300" },
  warning: { icon: AlertTriangle, ring: "border-lightning/40 shadow-glow-lightning", iconColor: "text-lightning-soft" },
  info: { icon: Info, ring: "border-cosmic/40", iconColor: "text-cosmic-soft" },
  default: { icon: Zap, ring: "border-white/10", iconColor: "text-foreground" },
};

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  React.useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-galaxy-850/90 p-4 shadow-glass backdrop-blur-xl animate-fade-in",
        config.ring
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconColor)} aria-hidden />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        )}
        {toast.description && (
          <p className="break-words text-sm text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
