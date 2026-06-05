"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Radio, Rocket, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Wordmark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Treat sub-paths as active too. */
  match?: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Observatory", icon: LayoutDashboard },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: Rocket,
    match: (p) => p.startsWith("/campaigns"),
  },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-black/30 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="px-2">
        <Wordmark />
      </div>

      <div className="mt-8 px-1">
        <Button asChild size="sm" className="w-full">
          <Link href="/campaigns/new">
            <Plus className="size-4" />
            New campaign
          </Link>
        </Button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active = item.match
            ? item.match(pathname)
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-aurora shadow-glow-aurora" />
              )}
              <Icon
                className={cn(
                  "size-[18px] transition-colors",
                  active
                    ? "text-aurora drop-shadow-[0_0_6px_rgba(34,232,160,0.6)]"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio className="size-3.5 text-aurora animate-pulse-glow" />
          <span>Real-time Nostr monitoring</span>
        </div>
      </div>
    </aside>
  );
}
