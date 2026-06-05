"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateCampaign,
  createCampaign,
  getCampaign,
  listCampaigns,
  pauseCampaign,
  resumeCampaign,
  testCampaignNwc,
  updateCampaign,
} from "@/lib/api/campaigns";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import type {
  CampaignActivate,
  CampaignCreate,
  CampaignNwcTestRequest,
  CampaignOut,
  CampaignResume,
  CampaignUpdate,
} from "@/lib/types/api";

export function useCampaigns() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: listCampaigns,
    enabled: Boolean(token),
    staleTime: 30 * 1000,
  });
}

export function useCampaign(id: number, options?: { refetchInterval?: number }) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.campaign(id),
    queryFn: () => getCampaign(id),
    enabled: Boolean(token) && Number.isFinite(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignCreate) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

export function useUpdateCampaign(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignUpdate) => updateCampaign(id, payload),
    onSuccess: (campaign) => syncCampaign(queryClient, campaign),
  });
}

export function useActivateCampaign(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignActivate) => activateCampaign(id, payload),
    onSuccess: (campaign) => syncCampaign(queryClient, campaign),
  });
}

export function usePauseCampaign(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pauseCampaign(id),
    onSuccess: (campaign) => syncCampaign(queryClient, campaign),
  });
}

export function useResumeCampaign(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignResume) => resumeCampaign(id, payload),
    onSuccess: (campaign) => syncCampaign(queryClient, campaign),
  });
}

export function useTestNwc(id: number) {
  return useMutation({
    mutationFn: (payload: CampaignNwcTestRequest) => testCampaignNwc(id, payload),
  });
}

/** Write the fresh campaign into both the detail cache and the list cache. */
function syncCampaign(
  queryClient: ReturnType<typeof useQueryClient>,
  campaign: CampaignOut
) {
  queryClient.setQueryData(queryKeys.campaign(campaign.id), campaign);
  queryClient.setQueryData<CampaignOut[]>(queryKeys.campaigns, (prev) =>
    prev?.map((c) => (c.id === campaign.id ? campaign : c))
  );
  queryClient.invalidateQueries({ queryKey: queryKeys.campaignMetrics(campaign.id) });
}
