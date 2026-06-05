"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/store/auth-store";

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hasHydrated, token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo className="size-12 animate-pulse-glow" />
      <Spinner className="size-5" />
    </div>
  );
}
