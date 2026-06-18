"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

/** Keeps already-authenticated users out of the login/register screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (hasHydrated && token) {
      router.replace(role === "platform_admin" ? "/admin" : "/dashboard");
    }
  }, [hasHydrated, token, role, router]);

  return <>{children}</>;
}
