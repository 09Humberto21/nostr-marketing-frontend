import { cn } from "@/lib/utils/cn";

type ProgressTone = "aurora" | "lightning" | "nebula";

const toneMap: Record<ProgressTone, string> = {
  aurora: "bg-aurora-grad",
  lightning: "bg-lightning-grad",
  nebula: "bg-nebula",
};

export function Progress({
  value,
  tone = "aurora",
  className,
}: {
  /** 0–100 */
  value: number;
  tone?: ProgressTone;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneMap[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
