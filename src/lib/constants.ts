import type { CampaignStatus, InteractionStatus } from "@/lib/types/api";

/* Business rules mirrored from the PRD / backend validation. */
export const ZAP_MIN_SATS = 100;
export const ZAP_MAX_SATS = 5000;
export const ZAP_DEFAULT_SATS = 500;

export const KEYWORD_MIN = 1;
export const KEYWORD_MAX = 20;

export const NAME_MIN = 3;
export const NAME_MAX = 120;

export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 2000;

export interface PackageOption {
  impacts: number;
  label: string;
  blurb: string;
}

export const PACKAGE_OPTIONS: PackageOption[] = [
  { impacts: 100, label: "Starter", blurb: "100 verified impacts" },
  { impacts: 500, label: "Growth", blurb: "500 verified impacts" },
  { impacts: 1000, label: "Scale", blurb: "1,000 verified impacts" },
];

/* Visual + textual metadata for each campaign status. */
type StatusTone = "aurora" | "lightning" | "nebula" | "cosmic" | "muted" | "destructive";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  description: string;
}

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, StatusMeta> = {
  draft: {
    label: "Draft",
    tone: "muted",
    description: "Configured but not launched yet.",
  },
  active: {
    label: "Active",
    tone: "aurora",
    description: "Live and monitoring Nostr in real time.",
  },
  paused: {
    label: "Paused",
    tone: "cosmic",
    description: "Temporarily stopped by the company.",
  },
  paused_insufficient_funds: {
    label: "Out of funds",
    tone: "lightning",
    description: "Auto-paused — the wallet ran low on sats.",
  },
  completed: {
    label: "Completed",
    tone: "nebula",
    description: "All contracted impacts were consumed.",
  },
  expired: {
    label: "Expired",
    tone: "muted",
    description: "Reached its 30-day limit before completing.",
  },
};

export function statusMeta(status: string): StatusMeta {
  return (
    CAMPAIGN_STATUS_META[status as CampaignStatus] ?? {
      label: status,
      tone: "muted",
      description: "",
    }
  );
}

export const INTERACTION_STATUS_META: Record<
  InteractionStatus,
  { label: string; tone: StatusTone }
> = {
  success: { label: "Success", tone: "aurora" },
  zap_failed: { label: "Zap failed", tone: "destructive" },
  comment_failed: { label: "Comment failed", tone: "lightning" },
  pending_comment_retry: { label: "Retrying comment", tone: "cosmic" },
};

export function interactionStatusMeta(status: string) {
  return (
    INTERACTION_STATUS_META[status as InteractionStatus] ?? {
      label: status,
      tone: "muted" as StatusTone,
    }
  );
}
