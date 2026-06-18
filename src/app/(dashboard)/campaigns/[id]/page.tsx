"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Hash,
  MessageSquare,
  Pencil,
  ScanSearch,
  Sparkles,
  Target,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { statusMeta } from "@/lib/constants";
import {
  daysUntil,
  formatDateTime,
  formatSats,
  percent,
} from "@/lib/utils/format";
import { useCampaign } from "@/lib/hooks/use-campaigns";
import { useCampaignMetrics } from "@/lib/hooks/use-metrics";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/campaigns/status-badge";
import { CampaignActions } from "@/components/campaigns/campaign-actions";
import { MetricCard } from "@/components/campaigns/metric-card";
import { InteractionsTable } from "@/components/campaigns/interactions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/empty-state";
import { FullSpinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const campaignQuery = useCampaign(id);
  const campaign = campaignQuery.data;
  const isLive = campaign?.status === "active";

  // Poll live campaigns so impacts/zaps update in near real time.
  const metricsQuery = useCampaignMetrics(id, {
    refetchInterval: isLive ? 15_000 : undefined,
  });

  if (Number.isNaN(id)) {
    return <ErrorState title="Invalid campaign" description="The campaign id is not valid." />;
  }

  if (campaignQuery.isPending) {
    return <FullSpinner label="Loading campaign…" />;
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <ErrorState
        title="Couldn't load this campaign"
        description={parseApiError(campaignQuery.error).message}
        onRetry={() => campaignQuery.refetch()}
      />
    );
  }

  const metrics = metricsQuery.data;
  const metricsLoading = metricsQuery.isPending;
  const impactPct = percent(
    metrics ? Math.min(metrics.impacts_consumed, campaign.package_impacts) : 0,
    campaign.package_impacts
  );
  const daysLeft = daysUntil(campaign.ends_at);

  return (
    <div className="space-y-8">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to campaigns
      </Link>

      <PageHeader
        title={campaign.name}
        description={statusMeta(campaign.status).description}
        actions={
          <>
            {campaign.status === "draft" && (
              <Button asChild variant="outline">
                <Link href={`/campaigns/${campaign.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            )}
            <CampaignActions campaign={campaign} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={campaign.status} />
        <span className="font-mono text-xs text-muted-foreground">#{campaign.id}</span>
        {daysLeft != null && (campaign.status === "active" || campaign.status === "paused") && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" />
            {daysLeft} days remaining
          </span>
        )}
      </div>

      {/* Insufficient-funds warning */}
      {campaign.status === "paused_insufficient_funds" && (
        <Card className="border-lightning/30 ring-lightning animate-fade-in">
          <CardContent className="flex items-start gap-3 p-5">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-lightning" />
            <div className="text-sm">
              <p className="font-semibold text-lightning-soft">Campaign auto-paused — insufficient funds</p>
              <p className="mt-0.5 text-muted-foreground">
                A zap failed because the wallet ran low. Add funds, then use <strong>Resume</strong> to
                re-validate and continue. We&apos;ll only resume once the balance covers the campaign.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact progress */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Impact progress
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-foreground tabular">
                  {formatSats(metrics?.impacts_consumed ?? 0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {formatSats(campaign.package_impacts)} impacts
                </span>
              </div>
            </div>
            <span className="font-mono text-sm text-aurora tabular">{impactPct}%</span>
          </div>
          <Progress value={impactPct} />
          <p className="text-xs text-muted-foreground tabular">
            {formatSats(metrics?.impacts_remaining ?? campaign.package_impacts)} impacts remaining
          </p>
        </CardContent>
      </Card>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sats sent"
          value={formatSats(metrics?.total_sats_sent ?? 0)}
          unit="sats"
          icon={Zap}
          accent="lightning"
          loading={metricsLoading}
        />
        <MetricCard
          label="Successful zaps"
          value={formatSats(metrics?.zaps_sent ?? 0)}
          icon={Sparkles}
          accent="lightning"
          loading={metricsLoading}
        />
        <MetricCard
          label="Comments published"
          value={formatSats(metrics?.comments_published ?? 0)}
          icon={MessageSquare}
          accent="nebula"
          loading={metricsLoading}
        />
        <MetricCard
          label="Interactions"
          value={formatSats(metrics?.interactions ?? 0)}
          icon={Target}
          accent="aurora"
          loading={metricsLoading}
        />
      </div>

      {/* Funnel stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FunnelStat icon={ScanSearch} label="Posts analyzed" value={metrics?.posts_analyzed} loading={metricsLoading} />
        <FunnelStat icon={Sparkles} label="Posts relevant (LLM)" value={metrics?.posts_relevant} loading={metricsLoading} />
        <FunnelStat icon={Users} label="Users discarded" value={metrics?.users_discarded} loading={metricsLoading} />
      </div>

      {/* Campaign details */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {campaign.product_description}
            </p>
            <a
              href={campaign.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-sm text-cosmic-soft hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" />
              {campaign.product_url}
            </a>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Keywords ({campaign.keywords.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {campaign.keywords.map((k) => (
                  <Badge key={k} tone="aurora">
                    <Hash className="size-3 opacity-70" />
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 p-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Configuration</h3>
            <InfoRow label="Package" value={`${formatSats(campaign.package_impacts)} impacts`} />
            <InfoRow label="Zap amount" value={`${formatSats(campaign.zap_amount_sats)} sats`} tone="lightning" />
            <InfoRow
              label="Total budget"
              value={`${formatSats(campaign.package_impacts * campaign.zap_amount_sats)} sats`}
            />
            <div className="my-2 border-t border-white/5" />
            <InfoRow label="Created" value={formatDateTime(campaign.created_at)} />
            <InfoRow label="Started" value={formatDateTime(campaign.started_at)} />
            <InfoRow label="Ends" value={formatDateTime(campaign.ends_at)} />
            {campaign.completed_at && (
              <InfoRow label="Completed" value={formatDateTime(campaign.completed_at)} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Interactions</h2>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs text-aurora">
              <span className="size-1.5 animate-pulse-glow rounded-full bg-aurora" />
              Live
            </span>
          )}
        </div>
        <InteractionsTable campaignId={id} />
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "lightning";
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono tabular ${tone === "lightning" ? "text-lightning-soft" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function FunnelStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number | undefined;
  loading?: boolean;
}) {
  return (
    <div className="glass flex items-center gap-4 p-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <p className="font-mono text-xl font-semibold text-foreground tabular">
            {formatSats(value ?? 0)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
