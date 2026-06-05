"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  MessageSquare,
  Plus,
  Rocket,
  ScanSearch,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { statusMeta } from "@/lib/constants";
import { formatSats, percent } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/auth-store";
import { useMyCompany } from "@/lib/hooks/use-company";
import { useCampaigns } from "@/lib/hooks/use-campaigns";
import { useAggregateMetrics } from "@/lib/hooks/use-aggregate-metrics";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/campaigns/metric-card";
import { StatusBadge } from "@/components/campaigns/status-badge";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const company = useMyCompany();
  const { data: campaigns, isPending, isError, error, refetch } = useCampaigns();
  const { totals, isLoading: metricsLoading } = useAggregateMetrics(campaigns);

  const activeCampaign = campaigns?.find((c) => c.status === "active");
  const activeCount = campaigns?.filter((c) => c.status === "active").length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          company.data?.name
            ? `The Observatory · ${company.data.name}`
            : "The Observatory"
        }
        description={`Welcome back${user?.email ? `, ${user.email}` : ""}. Here's how your Nostr campaigns are performing.`}
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              New campaign
            </Link>
          </Button>
        }
      />

      {/* Top-line metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sats sent"
          value={formatSats(totals.totalSatsSent)}
          unit="sats"
          icon={Zap}
          accent="lightning"
          loading={metricsLoading && !campaigns}
          hint="Across all campaigns"
        />
        <MetricCard
          label="Impacts consumed"
          value={formatSats(totals.impactsConsumed)}
          unit={`/ ${formatSats(totals.impactsContracted)}`}
          icon={Target}
          accent="aurora"
          loading={metricsLoading && !campaigns}
          hint={`${percent(totals.impactsConsumed, totals.impactsContracted)}% of contracted`}
        />
        <MetricCard
          label="Successful zaps"
          value={formatSats(totals.zapsSent)}
          icon={Activity}
          accent="lightning"
          loading={metricsLoading && !campaigns}
          hint={`${formatSats(totals.interactions)} total interactions`}
        />
        <MetricCard
          label="Comments published"
          value={formatSats(totals.commentsPublished)}
          icon={MessageSquare}
          accent="nebula"
          loading={metricsLoading && !campaigns}
          hint="AI-generated, contextual"
        />
      </div>

      {/* Secondary funnel stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FunnelStat
          icon={ScanSearch}
          label="Posts analyzed"
          value={totals.postsAnalyzed}
          loading={metricsLoading && !campaigns}
        />
        <FunnelStat
          icon={Users}
          label="Users discarded (anti-abuse)"
          value={totals.usersDiscarded}
          loading={metricsLoading && !campaigns}
        />
        <FunnelStat
          icon={Rocket}
          label="Active campaigns"
          value={activeCount}
          loading={isPending}
        />
      </div>

      {/* Active campaign spotlight */}
      {activeCampaign && (
        <Card className="ring-aurora border-aurora/20 animate-fade-in">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={activeCampaign.status} />
                <span className="text-xs text-muted-foreground">{statusMeta(activeCampaign.status).description}</span>
              </div>
              <h3 className="truncate text-lg font-semibold text-foreground">
                {activeCampaign.name}
              </h3>
              <div className="max-w-md">
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground tabular">
                  <span>Impacts</span>
                  <span>
                    {formatSats(totals.impactsConsumed)} / {formatSats(activeCampaign.package_impacts)}
                  </span>
                </div>
                <Progress
                  value={percent(
                    Math.min(totals.impactsConsumed, activeCampaign.package_impacts),
                    activeCampaign.package_impacts
                  )}
                />
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href={`/campaigns/${activeCampaign.id}`}>
                Open campaign
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent campaigns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent campaigns</h2>
          {campaigns && campaigns.length > 0 && (
            <Link
              href="/campaigns"
              className="flex items-center gap-1 text-sm text-aurora hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {isError ? (
          <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
        ) : isPending ? (
          <div className="glass space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
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
        ) : (
          <CampaignsTable campaigns={campaigns.slice(0, 5)} />
        )}
      </section>
    </div>
  );
}

function FunnelStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  loading?: boolean;
}) {
  return (
    <div className="glass flex items-center gap-4 p-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <p className="font-mono text-xl font-semibold text-foreground tabular">
            {formatSats(value)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
