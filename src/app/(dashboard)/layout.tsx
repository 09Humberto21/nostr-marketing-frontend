"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Authenticated shell + client-side route guard. Because the JWT lives in
 * localStorage (not a cookie), guarding happens here rather than in middleware.
 * We wait for `hasHydrated` so a refresh doesn't flash the login screen.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (hasHydrated && !token) router.replace("/login");
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Logo className="size-12 animate-pulse-glow" />
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
