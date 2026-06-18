import { cn } from "@/lib/utils/cn";

/** Nostr Campaign mark — an orbiting lightning spark. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex size-9 items-center justify-center", className)}>
      <svg viewBox="0 0 40 40" fill="none" className="size-full">
        <defs>
          <linearGradient id="logo-aurora" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#22E8A0" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" stroke="url(#logo-aurora)" strokeOpacity="0.35" strokeWidth="1.5" />
        <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#8B5CF6" strokeOpacity="0.4" strokeWidth="1.25" transform="rotate(-30 20 20)" />
        <path
          d="M22 9 L13 22 H19 L18 31 L27 18 H21 L22 9 Z"
          fill="#F7931A"
          stroke="#FFB23E"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo />
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-foreground">Nostr Campaign</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Satoshi Galaxy</p>
      </div>
    </div>
  );
}
