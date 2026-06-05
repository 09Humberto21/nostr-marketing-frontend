import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin text-aurora", className)} aria-hidden />;
}

export function FullSpinner({ label }: { label?: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="size-7 animate-spin text-aurora" aria-hidden />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
