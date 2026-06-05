"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useMyCompany, useUpdateCompany } from "@/lib/hooks/use-company";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const company = useMyCompany();
  const update = useUpdateCompany();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [dirty, setDirty] = React.useState(false);

  // Seed the form once the company loads.
  React.useEffect(() => {
    if (company.data && !dirty) {
      setName(company.data.name);
      setContactEmail(company.data.contact_email);
    }
  }, [company.data, dirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await update.mutateAsync({ name: name.trim(), contact_email: contactEmail.trim() });
      setDirty(false);
      toast.success("Company updated.");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidation) setFieldErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your company profile." />

      <Card className="max-w-xl">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-aurora" />
            Company profile
          </div>

          {company.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name">Company name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDirty(true);
                  }}
                  invalid={Boolean(fieldErrors.name)}
                />
                <FieldHint error>{fieldErrors.name}</FieldHint>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setDirty(true);
                  }}
                  invalid={Boolean(fieldErrors.contact_email)}
                />
                <FieldHint error>{fieldErrors.contact_email}</FieldHint>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-xs text-muted-foreground">
                Signed in as <span className="font-mono text-foreground">{user?.email}</span>
                {user?.role && <span className="ml-1">· role: {user.role}</span>}
              </div>

              <Button type="submit" loading={update.isPending} disabled={!dirty}>
                Save changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
