"use client";

import * as React from "react";
import {
  CheckCircle2,
  Pause,
  Play,
  Rocket,
  XCircle,
  Zap,
} from "lucide-react";
import type { CampaignNwcTestResult, CampaignOut } from "@/lib/types/api";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import { formatSats } from "@/lib/utils/format";
import {
  useActivateCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useTestNwc,
} from "@/lib/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label, FieldHint } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const NWC_PREFIX = /^nostr\+walletconnect:\/\//i;

/**
 * Shared dialog used by both "Activate" and "Resume" — both require a fresh NWC
 * URL and benefit from a pre-flight funds test (POST /test-nwc).
 */
function NwcActionDialog({
  open,
  onOpenChange,
  campaign,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignOut;
  mode: "activate" | "resume";
}) {
  const [nwcUrl, setNwcUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<CampaignNwcTestResult | null>(null);

  const activate = useActivateCampaign(campaign.id);
  const resume = useResumeCampaign(campaign.id);
  const testNwc = useTestNwc(campaign.id);
  const mutation = mode === "activate" ? activate : resume;

  const requiredSats = campaign.package_impacts * campaign.zap_amount_sats;

  React.useEffect(() => {
    if (!open) {
      setNwcUrl("");
      setError(null);
      setTestResult(null);
    }
  }, [open]);

  const validUrl = NWC_PREFIX.test(nwcUrl.trim());

  const handleTest = async () => {
    setError(null);
    setTestResult(null);
    try {
      const result = await testNwc.mutateAsync({ nwc_url: nwcUrl.trim() });
      setTestResult(result);
      if (result.ok) toast.success("Wallet connected — funds look sufficient.");
      else toast.warning("Wallet reachable, but funds are insufficient.");
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await mutation.mutateAsync({ nwc_url: nwcUrl.trim() });
      toast.success(
        mode === "activate"
          ? "Campaign activated — monitoring Nostr in real time."
          : "Campaign resumed."
      );
      onOpenChange(false);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    }
  };

  const title = mode === "activate" ? "Activate campaign" : "Resume campaign";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "activate"
              ? "We'll re-validate connectivity and funds, then start real-time monitoring. Your company can only have one active campaign at a time."
              : campaign.status === "paused_insufficient_funds"
                ? "Add funds to your wallet first. We'll only resume once the balance covers the campaign."
                : "We'll re-validate funds before going live again."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-lightning/20 bg-lightning/[0.06] p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Required funds</span>
              <span className="font-mono font-semibold text-lightning-soft tabular">
                {formatSats(requiredSats)} sats
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {campaign.package_impacts} impacts × {formatSats(campaign.zap_amount_sats)} sats + fee buffer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_nwc" required>
              NWC connection string
            </Label>
            <PasswordInput
              id="action_nwc"
              value={nwcUrl}
              onChange={(e) => {
                setNwcUrl(e.target.value);
                setError(null);
              }}
              placeholder="nostr+walletconnect://…"
              autoComplete="off"
            />
            <FieldHint error={Boolean(error)}>
              {error ?? "Re-enter the wallet string — it's never stored in plaintext."}
            </FieldHint>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${
                testResult.ok
                  ? "border-aurora/30 bg-aurora/5 text-aurora"
                  : "border-lightning/30 bg-lightning/5 text-lightning-soft"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <div className="font-mono text-xs tabular">
                <p>Available: {formatSats(testResult.available_sats)} sats</p>
                <p className="opacity-80">Required: {formatSats(testResult.required_sats)} sats</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={!validUrl}
            loading={testNwc.isPending}
          >
            <Zap className="size-4" />
            Test wallet
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!validUrl}
            loading={mutation.isPending}
          >
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CampaignActions({ campaign }: { campaign: CampaignOut }) {
  const [dialog, setDialog] = React.useState<null | "activate" | "resume">(null);
  const pause = usePauseCampaign(campaign.id);

  const handlePause = async () => {
    try {
      await pause.mutateAsync();
      toast.info("Campaign paused. Monitoring stopped.");
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const status = campaign.status;
  const isTerminal = status === "completed" || status === "expired";

  if (isTerminal) {
    return (
      <Button variant="subtle" disabled>
        {status === "completed" ? "Completed" : "Expired"}
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "draft" && (
          <Button onClick={() => setDialog("activate")}>
            <Rocket className="size-4" />
            Activate
          </Button>
        )}

        {status === "active" && (
          <Button variant="outline" onClick={handlePause} loading={pause.isPending}>
            <Pause className="size-4" />
            Pause
          </Button>
        )}

        {(status === "paused" || status === "paused_insufficient_funds") && (
          <Button variant="lightning" onClick={() => setDialog("resume")}>
            <Play className="size-4" />
            Resume
          </Button>
        )}
      </div>

      <NwcActionDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        campaign={campaign}
        mode={dialog === "resume" ? "resume" : "activate"}
      />
    </>
  );
}
