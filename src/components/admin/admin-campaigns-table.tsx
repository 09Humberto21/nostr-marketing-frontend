"use client";

import * as React from "react";
import { Building2, Pause, Zap } from "lucide-react";
import type { AdminCampaignOut } from "@/lib/types/api";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import { formatDate, formatSats } from "@/lib/utils/format";
import { usePauseAdminCampaign } from "@/lib/hooks/use-admin";
import { StatusBadge } from "@/components/campaigns/status-badge";
import { Button } from "@/components/ui/button";

export function AdminCampaignsTable({ campaigns }: { campaigns: AdminCampaignOut[] }) {
  const pause = usePauseAdminCampaign();
  const [pausingId, setPausingId] = React.useState<number | null>(null);

  const handlePause = (id: number) => {
    setPausingId(id);
    pause.mutate(id, {
      onSuccess: () => toast.info("Campaign paused."),
      onError: (err) => toast.error(parseApiError(err).message),
      onSettled: () => setPausingId(null),
    });
  };

  return (
    <div className="glass overflow-hidden">
      <div className="hidden grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
        <span>Campaign</span>
        <span>Status</span>
        <span className="text-right">Package</span>
        <span className="text-right">Zap</span>
        <span className="text-right">Created</span>
        <span className="w-16 text-right">Action</span>
      </div>

      <ul className="divide-y divide-white/5">
        {campaigns.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{c.name}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <span className="font-mono">#{c.id}</span>
                <span className="text-muted-foreground/50">·</span>
                <Building2 className="size-3" />
                <span>company {c.company_id}</span>
              </p>
            </div>

            <div className="flex md:block">
              <StatusBadge status={c.status} />
            </div>

            <div className="flex items-center justify-between md:justify-end">
              <span className="text-xs text-muted-foreground md:hidden">Package</span>
              <span className="font-mono text-sm text-foreground tabular">{c.package_impacts}</span>
            </div>

            <div className="flex items-center justify-between md:justify-end">
              <span className="text-xs text-muted-foreground md:hidden">Zap</span>
              <span className="flex items-center gap-1 font-mono text-sm text-lightning-soft tabular">
                <Zap className="size-3" />
                {formatSats(c.zap_amount_sats)}
              </span>
            </div>

            <div className="flex items-center justify-between md:justify-end">
              <span className="text-xs text-muted-foreground md:hidden">Created</span>
              <span className="text-xs text-muted-foreground" title={c.created_at}>
                {formatDate(c.created_at)}
              </span>
            </div>

            <div className="flex justify-end">
              {c.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePause(c.id)}
                  loading={pausingId === c.id}
                >
                  <Pause className="size-3.5" />
                  Pause
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground/50">—</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
