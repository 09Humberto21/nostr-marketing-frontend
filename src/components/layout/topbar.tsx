"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLogout } from "@/lib/hooks/use-auth";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Observatory" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/settings", label: "Settings" },
];

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-galaxy-900/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Logo className="size-8" />
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 lg:hidden">
          {MOBILE_NAV.map((item) => {
            const active =
              item.href === "/campaigns"
                ? pathname.startsWith("/campaigns")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-white/10 text-aurora"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 sm:flex">
            <div className="flex size-7 items-center justify-center rounded-lg bg-aurora/10 text-aurora">
              <Building2 className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="max-w-[160px] truncate text-xs font-semibold text-foreground">
                {company?.name ?? "Your company"}
              </p>
              <p className="max-w-[160px] truncate text-[11px] text-muted-foreground">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  );
}
