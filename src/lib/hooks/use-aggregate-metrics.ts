"use client";

import { useQueries } from "@tanstack/react-query";
import { getCampaignMetrics } from "@/lib/api/campaigns";
import { queryKeys } from "@/lib/api/query-keys";
import type { CampaignMetrics, CampaignOut } from "@/lib/types/api";

export interface AggregatedMetrics {
  totalSatsSent: number;
  impactsConsumed: number;
  impactsContracted: number;
  zapsSent: number;
  commentsPublished: number;
  postsAnalyzed: number;
  usersDiscarded: number;
  interactions: number;
}

const EMPTY: AggregatedMetrics = {
  totalSatsSent: 0,
  impactsConsumed: 0,
  impactsContracted: 0,
  zapsSent: 0,
  commentsPublished: 0,
  postsAnalyzed: 0,
  usersDiscarded: 0,
  interactions: 0,
};

/**
 * Fans out one GET /metrics request per campaign and folds the results into a
 * single top-line summary for the dashboard. Returns partial totals while some
 * queries are still loading.
 */
export function useAggregateMetrics(campaigns: CampaignOut[] | undefined) {
  const list = campaigns ?? [];

  const results = useQueries({
    queries: list.map((c) => ({
      queryKey: queryKeys.campaignMetrics(c.id),
      queryFn: () => getCampaignMetrics(c.id),
      staleTime: 30 * 1000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.length > 0 && results.every((r) => r.isError);

  const totals = results.reduce<AggregatedMetrics>((acc, r, index) => {
    const m = r.data as CampaignMetrics | undefined;
    const campaign = list[index];
    if (campaign) acc.impactsContracted += campaign.package_impacts;
    if (!m) return acc;
    acc.totalSatsSent += m.total_sats_sent;
    acc.impactsConsumed += m.impacts_consumed;
    acc.zapsSent += m.zaps_sent;
    acc.commentsPublished += m.comments_published;
    acc.postsAnalyzed += m.posts_analyzed;
    acc.usersDiscarded += m.users_discarded;
    acc.interactions += m.interactions;
    return acc;
  }, { ...EMPTY });

  return { totals, isLoading, isError };
}
