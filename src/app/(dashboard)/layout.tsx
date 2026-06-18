"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Authenticated shell + client-side route guard. Because the JWT lives in
 * localStorage (not a cookie), guarding happens here rather than in middleware.
 * We wait for `hasHydrated` so a refresh doesn't flash the login screen, and for
 * the profile (`user`) so role-based routing is correct before any company- or
 * admin-scoped page fires its requests.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const isAdmin = user?.role === "platform_admin";
  const onAdminRoute = pathname.startsWith("/admin");
  // Admins live under /admin; company users own everything else.
  const misrouted = Boolean(user) && isAdmin !== onAdminRoute;

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) return; // wait for /auth/me to resolve the role
    if (isAdmin && !onAdminRoute) router.replace("/admin");
    else if (!isAdmin && onAdminRoute) router.replace("/dashboard");
  }, [hasHydrated, token, user, isAdmin, onAdminRoute, router]);

  // Wait for hydration, auth, and the profile; also hold the frame while a
  // role redirect is in flight so the wrong section never flashes.
  if (!hasHydrated || !token || !user || misrouted) {
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
