"use client";

import * as React from "react";
import {
  FileText,
  Link2,
  Megaphone,
  Rocket,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  NAME_MAX,
  NAME_MIN,
  PACKAGE_OPTIONS,
  ZAP_DEFAULT_SATS,
  ZAP_MAX_SATS,
  ZAP_MIN_SATS,
} from "@/lib/constants";
import type { CampaignCreate } from "@/lib/types/api";
import { formatSats } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label, FieldHint } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Slider } from "@/components/ui/slider";
import { KeywordInput } from "@/components/campaigns/keyword-input";

export interface CampaignFormValues {
  name: string;
  product_description: string;
  product_url: string;
  keywords: string[];
  nwc_url: string;
  package_impacts: number;
  zap_amount_sats: number;
}

const EMPTY: CampaignFormValues = {
  name: "",
  product_description: "",
  product_url: "",
  keywords: [],
  nwc_url: "",
  package_impacts: PACKAGE_OPTIONS[1]!.impacts, // default: 500 / Growth
  zap_amount_sats: ZAP_DEFAULT_SATS,
};

type Errors = Partial<Record<keyof CampaignFormValues, string>>;

function validate(v: CampaignFormValues): Errors {
  const e: Errors = {};
  if (v.name.trim().length < NAME_MIN || v.name.trim().length > NAME_MAX)
    e.name = `Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
  if (
    v.product_description.trim().length < DESCRIPTION_MIN ||
    v.product_description.trim().length > DESCRIPTION_MAX
  )
    e.product_description = `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`;
  try {
    // eslint-disable-next-line no-new
    new URL(v.product_url);
  } catch {
    e.product_url = "Enter a valid URL (including https://).";
  }
  if (v.keywords.length < 1) e.keywords = "Add at least one keyword.";
  if (!v.nwc_url.trim()) e.nwc_url = "The NWC connection string is required.";
  else if (!/^nostr\+walletconnect:\/\//i.test(v.nwc_url.trim()))
    e.nwc_url = "Must start with nostr+walletconnect://";
  if (v.zap_amount_sats < ZAP_MIN_SATS || v.zap_amount_sats > ZAP_MAX_SATS)
    e.zap_amount_sats = `Zap amount must be between ${ZAP_MIN_SATS} and ${ZAP_MAX_SATS} sats.`;
  return e;
}

export function CampaignForm({
  defaultValues,
  onSubmit,
  submitting = false,
  serverFieldErrors,
  submitLabel = "Create campaign",
}: {
  defaultValues?: Partial<CampaignFormValues>;
  onSubmit: (values: CampaignCreate) => void | Promise<void>;
  submitting?: boolean;
  serverFieldErrors?: Record<string, string>;
  submitLabel?: string;
}) {
  const [values, setValues] = React.useState<CampaignFormValues>({
    ...EMPTY,
    ...defaultValues,
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState(false);

  // Merge server-side 422 errors as they arrive.
  React.useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const set = <K extends keyof CampaignFormValues>(
    key: K,
    value: CampaignFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const budget = values.package_impacts * values.zap_amount_sats;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validation = validate(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      // Focus the first invalid field for accessibility.
      const first = Object.keys(validation)[0];
      document.getElementById(first as string)?.focus();
      return;
    }
    void onSubmit({
      name: values.name.trim(),
      product_description: values.product_description.trim(),
      product_url: values.product_url.trim(),
      keywords: values.keywords,
      nwc_url: values.nwc_url.trim(),
      package_impacts: values.package_impacts,
      zap_amount_sats: values.zap_amount_sats,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left column — campaign details */}
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Megaphone className="size-4 text-aurora" />
              Campaign
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" required>
                Campaign name
              </Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                invalid={Boolean(errors.name)}
                placeholder="Wallet launch — Q3"
                maxLength={NAME_MAX}
              />
              <FieldHint error={Boolean(errors.name)}>
                {errors.name ?? `${values.name.trim().length}/${NAME_MAX} characters`}
              </FieldHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_description" required>
                Product description
              </Label>
              <Textarea
                id="product_description"
                value={values.product_description}
                onChange={(e) => set("product_description", e.target.value)}
                invalid={Boolean(errors.product_description)}
                placeholder="A self-custodial Bitcoin wallet for merchants with instant Lightning settlement…"
                maxLength={DESCRIPTION_MAX}
              />
              <FieldHint error={Boolean(errors.product_description)}>
                {errors.product_description ??
                  "The LLM uses this to judge relevance and craft natural comments."}
              </FieldHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_url" required>
                Product URL
              </Label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="product_url"
                  type="url"
                  inputMode="url"
                  value={values.product_url}
                  onChange={(e) => set("product_url", e.target.value)}
                  invalid={Boolean(errors.product_url)}
                  placeholder="https://example.com"
                  className="pl-9"
                />
              </div>
              <FieldHint error={Boolean(errors.product_url)}>{errors.product_url}</FieldHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" required>
                Keywords
              </Label>
              <KeywordInput
                id="keywords"
                value={values.keywords}
                onChange={(next) => set("keywords", next)}
                invalid={Boolean(errors.keywords)}
              />
              <FieldHint error={Boolean(errors.keywords)}>{errors.keywords}</FieldHint>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="size-4 text-lightning" />
              Wallet (NWC)
            </div>
            <div className="space-y-2">
              <Label htmlFor="nwc_url" required>
                Nostr Wallet Connect URL
              </Label>
              <PasswordInput
                id="nwc_url"
                value={values.nwc_url}
                onChange={(e) => set("nwc_url", e.target.value)}
                invalid={Boolean(errors.nwc_url)}
                placeholder="nostr+walletconnect://…"
                autoComplete="off"
              />
              <FieldHint error={Boolean(errors.nwc_url)}>
                {errors.nwc_url ??
                  "Stored encrypted, never returned by the API. Connectivity and funds are validated on submit."}
              </FieldHint>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column — package, zap & budget (sticky) */}
      <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Rocket className="size-4 text-nebula-soft" />
              Package
            </div>
            <div className="grid gap-2.5">
              {PACKAGE_OPTIONS.map((pkg) => {
                const active = values.package_impacts === pkg.impacts;
                return (
                  <button
                    key={pkg.impacts}
                    type="button"
                    onClick={() => set("package_impacts", pkg.impacts)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                      active
                        ? "border-aurora/50 bg-aurora/10 shadow-glow-aurora"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    <div>
                      <p className={cn("text-sm font-semibold", active ? "text-aurora" : "text-foreground")}>
                        {pkg.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{pkg.blurb}</p>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-lg font-semibold tabular",
                        active ? "text-aurora" : "text-muted-foreground"
                      )}
                    >
                      {pkg.impacts}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Zap className="size-4 text-lightning" />
                Zap amount
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-semibold text-lightning-soft tabular">
                  {formatSats(values.zap_amount_sats)}
                </span>
                <span className="text-xs text-muted-foreground">sats</span>
              </div>
            </div>

            <Slider
              value={[values.zap_amount_sats]}
              min={ZAP_MIN_SATS}
              max={ZAP_MAX_SATS}
              step={50}
              onValueChange={([v]) => set("zap_amount_sats", v ?? ZAP_MIN_SATS)}
              aria-label="Zap amount in sats"
            />

            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={ZAP_MIN_SATS}
                max={ZAP_MAX_SATS}
                step={50}
                value={values.zap_amount_sats}
                onChange={(e) => set("zap_amount_sats", Number(e.target.value))}
                invalid={Boolean(errors.zap_amount_sats)}
                className="font-mono"
                aria-label="Zap amount exact value"
              />
              <span className="shrink-0 text-xs text-muted-foreground">
                {ZAP_MIN_SATS}–{formatSats(ZAP_MAX_SATS)}
              </span>
            </div>
            <FieldHint error={Boolean(errors.zap_amount_sats)}>
              {errors.zap_amount_sats ?? "Fixed for the whole campaign once active."}
            </FieldHint>
          </CardContent>
        </Card>

        {/* Budget summary */}
        <Card variant="strong" className="ring-lightning border-lightning/20">
          <CardContent className="space-y-3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Estimated budget
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="bg-lightning-grad bg-clip-text font-mono text-3xl font-bold tabular text-transparent">
                {formatSats(budget)}
              </span>
              <span className="text-sm text-muted-foreground">sats</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {values.package_impacts} impacts × {formatSats(values.zap_amount_sats)} sats.
              A small network fee buffer is added when validating your wallet.
            </p>
            <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
              {submitLabel}
            </Button>
            {touched && Object.keys(errors).length > 0 && (
              <p className="text-center text-xs text-red-300">
                Please fix the highlighted fields above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
