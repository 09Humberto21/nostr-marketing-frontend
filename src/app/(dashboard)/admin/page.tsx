"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ListChecks,
  Radio,
  Rocket,
  TriangleAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { formatRelative } from "@/lib/utils/format";
import { useAdminMonitoring } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/campaigns/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Tone = "aurora" | "lightning" | "cosmic" | "muted" | "destructive";

function workerTone(state: string): Tone {
  const s = state.toLowerCase();
  if (s.includes("run") || s.includes("active") || s.includes("ok")) return "aurora";
  if (s.includes("error") || s.includes("fail") || s.includes("crash")) return "destructive";
  if (s.includes("stop") || s.includes("idle") || s.includes("paused")) return "muted";
  return "cosmic";
}

export default function AdminMonitoringPage() {
  const { data, isPending, isError, error, refetch } = useAdminMonitoring();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform monitoring"
        description="Background worker health and live subscription state. Auto-refreshes every 15s."
        actions={
          <span className="flex items-center gap-1.5 text-xs text-aurora">
            <span className="size-1.5 animate-pulse-glow rounded-full bg-aurora" />
            Live
          </span>
        }
      />

      {isError ? (
        <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {data.stale && (
            <Card className="border-lightning/30 ring-lightning animate-fade-in">
              <CardContent className="flex items-start gap-3 p-5">
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-lightning" />
                <div className="text-sm">
                  <p className="font-semibold text-lightning-soft">Worker heartbeat is stale</p>
                  <p className="mt-0.5 text-muted-foreground">
                    The background worker hasn&apos;t reported recently. New Nostr posts may not be
                    processed until it recovers.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Worker state */}
            <div className="glass flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Worker state
                </p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                  <Activity className="size-[18px]" aria-hidden />
                </div>
              </div>
              <Badge tone={workerTone(data.worker_state)} dot className="w-fit">
                {data.worker_state}
              </Badge>
            </div>

            {/* Subscription */}
            <div className="glass flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Relay subscription
                </p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                  {data.subscribed ? (
                    <Wifi className="size-[18px] text-aurora" aria-hidden />
                  ) : (
                    <WifiOff className="size-[18px] text-red-300" aria-hidden />
                  )}
                </div>
              </div>
              <Badge tone={data.subscribed ? "aurora" : "destructive"} className="w-fit">
                {data.subscribed ? "Subscribed" : "Not subscribed"}
              </Badge>
            </div>

            {/* Active campaigns */}
            <MetricCard
              label="Active campaigns"
              value={data.active_campaigns}
              icon={Rocket}
              accent="aurora"
            />

            {/* Last heartbeat */}
            <div className="glass flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last heartbeat
                </p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                  <Radio className="size-[18px]" aria-hidden />
                </div>
              </div>
              <p
                className="text-lg font-semibold text-foreground"
                title={data.last_heartbeat_at ?? undefined}
              >
                {formatRelative(data.last_heartbeat_at)}
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminLink
              href="/admin/campaigns"
              icon={Rocket}
              title="All campaigns"
              description="Browse every company's campaigns, filter, and pause when needed."
            />
            <AdminLink
              href="/admin/interactions"
              icon={ListChecks}
              title="All interactions"
              description="Inspect zap/comment interactions platform-wide and triage errors."
            />
          </div>
        </>
      )}
    </div>
  );
}

function AdminLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Rocket;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group glass flex items-center gap-4 p-5 transition-all hover:border-white/20"
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-white/5 text-aurora">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground group-hover:text-aurora">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
