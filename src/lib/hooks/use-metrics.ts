"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCampaignInteractions,
  getCampaignMetrics,
} from "@/lib/api/campaigns";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";

export function useCampaignMetrics(
  id: number,
  options?: { refetchInterval?: number }
) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.campaignMetrics(id),
    queryFn: () => getCampaignMetrics(id),
    enabled: Boolean(token) && Number.isFinite(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCampaignInteractions(
  id: number,
  page: number,
  pageSize = 20
) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.campaignInteractions(id, page, pageSize),
    queryFn: () => getCampaignInteractions(id, page, pageSize),
    enabled: Boolean(token) && Number.isFinite(id),
    placeholderData: keepPreviousData,
  });
}
