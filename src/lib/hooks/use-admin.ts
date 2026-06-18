"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminMonitoringState,
  listAdminCampaigns,
  listAdminInteractions,
  pauseAdminCampaign,
} from "@/lib/api/admin";
import {
  queryKeys,
  type AdminCampaignFilters,
  type AdminInteractionFilters,
} from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";

/** Admin endpoints require the platform_admin role. */
function useIsAdmin(): boolean {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  return Boolean(token) && role === "platform_admin";
}

export function useAdminCampaigns(filters: AdminCampaignFilters) {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: queryKeys.adminCampaigns(filters),
    queryFn: () =>
      listAdminCampaigns({
        status: filters.status,
        companyId: filters.companyId,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePauseAdminCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pauseAdminCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMonitoring });
    },
  });
}

export function useAdminInteractions(filters: AdminInteractionFilters) {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: queryKeys.adminInteractions(filters),
    queryFn: () =>
      listAdminInteractions({
        campaignId: filters.campaignId,
        status: filters.status,
        errorOnly: filters.errorOnly,
        page: filters.page,
        pageSize: filters.pageSize,
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminMonitoring() {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: queryKeys.adminMonitoring,
    queryFn: getAdminMonitoringState,
    enabled,
    refetchInterval: 15_000,
  });
}
