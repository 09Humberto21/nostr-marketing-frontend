import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

type Accent = "aurora" | "lightning" | "nebula" | "cosmic";

const accentMap: Record<Accent, { icon: string; ring: string; glow: string }> = {
  aurora: {
    icon: "bg-aurora/10 text-aurora",
    ring: "group-hover:border-aurora/30",
    glow: "group-hover:shadow-glow-aurora",
  },
  lightning: {
    icon: "bg-lightning/10 text-lightning-soft",
    ring: "group-hover:border-lightning/30",
    glow: "group-hover:shadow-glow-lightning",
  },
  nebula: {
    icon: "bg-nebula/10 text-nebula-soft",
    ring: "group-hover:border-nebula/30",
    glow: "group-hover:shadow-glow-nebula",
  },
  cosmic: {
    icon: "bg-cosmic/10 text-cosmic-soft",
    ring: "group-hover:border-cosmic/30",
    glow: "",
  },
};

export function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  accent = "aurora",
  loading = false,
  mono = true,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  accent?: Accent;
  loading?: boolean;
  mono?: boolean;
}) {
  const a = accentMap[accent];
  return (
    <div
      className={cn(
        "group glass relative overflow-hidden p-5 transition-all duration-300",
        a.ring,
        a.glow
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className={cn("flex size-9 items-center justify-center rounded-xl", a.icon)}>
          <Icon className="size-[18px]" aria-hidden />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <span
              className={cn(
                "text-3xl font-semibold tracking-tight text-foreground tabular",
                mono && "font-mono"
              )}
            >
              {value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </>
        )}
      </div>

      {hint && !loading && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
