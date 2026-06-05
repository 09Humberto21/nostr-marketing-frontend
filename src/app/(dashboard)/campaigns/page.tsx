"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/errors";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { PageHeader } from "@/components/layout/page-header";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "draft", label: "Draft" },
  { key: "completed", label: "Completed" },
  { key: "expired", label: "Expired" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function CampaignsPage() {
  const { data: campaigns, isPending, isError, error, refetch } = useCampaigns();
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    campaigns?.forEach((c) => {
      map[c.status] = (map[c.status] ?? 0) + 1;
    });
    return map;
  }, [campaigns]);

  const filtered = React.useMemo(() => {
    if (!campaigns) return [];
    if (filter === "all") return campaigns;
    if (filter === "paused")
      return campaigns.filter(
        (c) => c.status === "paused" || c.status === "paused_insufficient_funds"
      );
    return campaigns.filter((c) => c.status === filter);
  }, [campaigns, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, monitor and control your automated Nostr promotion campaigns."
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              New campaign
            </Link>
          </Button>
        }
      />

      {/* Filter chips */}
      {campaigns && campaigns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? campaigns.length
                : f.key === "paused"
                  ? (counts.paused ?? 0) + (counts.paused_insufficient_funds ?? 0)
                  : (counts[f.key] ?? 0);
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                  active
                    ? "border-aurora/40 bg-aurora/10 text-aurora"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                )}
              >
                {f.label}
                <span className="ml-1.5 text-xs opacity-70 tabular">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {isError ? (
        <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="glass space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No campaigns yet"
          description="Launch your first campaign to start discovering and zapping relevant Nostr users."
          action={
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="size-4" />
                Create campaign
              </Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Rocket} title={`No ${filter} campaigns`} description="Try a different filter." />
      ) : (
        <CampaignsTable campaigns={filtered} />
      )}
    </div>
  );
}
