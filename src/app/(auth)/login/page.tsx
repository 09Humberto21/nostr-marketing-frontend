"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { useLogin } from "@/lib/hooks/use-auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const login = useLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    try {
      await login.mutateAsync({ email: email.trim(), password });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 401) {
        setFormError("Invalid email or password.");
      } else if (parsed.isValidation) {
        setFieldErrors(parsed.fieldErrors);
        setFormError(parsed.message);
      } else {
        setFormError(parsed.message);
      }
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your campaign control panel."
      footer={
        <>
          New to Satoshi Galaxy?{" "}
          <Link href="/register" className="font-medium text-aurora hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {sessionExpired && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-lightning/30 bg-lightning/5 px-3 py-2.5 text-sm text-lightning-soft">
          <AlertCircle className="size-4 shrink-0" />
          Your session expired. Please sign in again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={Boolean(fieldErrors.email)}
              placeholder="you@company.com"
              className="pl-9"
              required
            />
          </div>
          <FieldHint error>{fieldErrors.email}</FieldHint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={Boolean(fieldErrors.password)}
              placeholder="••••••••"
              className="pl-9"
              required
            />
          </div>
          <FieldHint error>{fieldErrors.password}</FieldHint>
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            {formError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
