"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Building2, Mail, Lock, AtSign } from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { useRegister } from "@/lib/hooks/use-auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";

const PASSWORD_MIN = 8;

export default function RegisterPage() {
  const register = useRegister();
  const [form, setForm] = React.useState({
    company_name: "",
    contact_email: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.password.length < PASSWORD_MIN) {
      setFieldErrors({ password: `Use at least ${PASSWORD_MIN} characters.` });
      return;
    }
    setFieldErrors({});

    try {
      await register.mutateAsync({
        company_name: form.company_name.trim(),
        contact_email: form.contact_email.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidation) {
        setFieldErrors(parsed.fieldErrors);
        setFormError(parsed.message);
      } else if (parsed.status === 409) {
        setFormError("That email is already registered. Try signing in instead.");
      } else {
        setFormError(parsed.message);
      }
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Spin up your company workspace and launch campaigns on Nostr."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-aurora hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="company_name" required>
            Company name
          </Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              invalid={Boolean(fieldErrors.company_name)}
              placeholder="Acme Bitcoin Co."
              className="pl-9"
              required
            />
          </div>
          <FieldHint error>{fieldErrors.company_name}</FieldHint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email" required>
            Company contact email
          </Label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              invalid={Boolean(fieldErrors.contact_email)}
              placeholder="team@company.com"
              className="pl-9"
              required
            />
          </div>
          <FieldHint error>{fieldErrors.contact_email}</FieldHint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>
            Your login email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              invalid={Boolean(fieldErrors.email)}
              placeholder="you@company.com"
              className="pl-9"
              required
            />
          </div>
          <FieldHint error>{fieldErrors.email}</FieldHint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              invalid={Boolean(fieldErrors.password)}
              placeholder="At least 8 characters"
              className="pl-9"
              required
            />
          </div>
          <FieldHint error={Boolean(fieldErrors.password)}>
            {fieldErrors.password ?? `Minimum ${PASSWORD_MIN} characters.`}
          </FieldHint>
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            {formError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
