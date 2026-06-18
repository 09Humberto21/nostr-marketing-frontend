import { apiClient } from "@/lib/api/client";
import type {
  AdminCampaignOut,
  AdminInteractionPage,
  AdminMonitoringState,
  CampaignOut,
} from "@/lib/types/api";

export interface AdminCampaignQuery {
  status?: string | null;
  companyId?: number | null;
  createdFrom?: string | null;
  createdTo?: string | null;
}

export async function listAdminCampaigns(
  query: AdminCampaignQuery = {}
): Promise<AdminCampaignOut[]> {
  // Only forward params that are actually set, so we never send `null`.
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.companyId != null) params.company_id = query.companyId;
  if (query.createdFrom) params.created_from = query.createdFrom;
  if (query.createdTo) params.created_to = query.createdTo;

  const { data } = await apiClient.get<AdminCampaignOut[]>("/admin/campaigns", {
    params,
  });
  return data;
}

export async function pauseAdminCampaign(id: number): Promise<CampaignOut> {
  const { data } = await apiClient.post<CampaignOut>(
    `/admin/campaigns/${id}/pause`
  );
  return data;
}

export interface AdminInteractionQuery {
  campaignId?: number | null;
  status?: string | null;
  errorOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listAdminInteractions(
  query: AdminInteractionQuery = {}
): Promise<AdminInteractionPage> {
  const params: Record<string, string | number | boolean> = {
    page: query.page ?? 1,
    page_size: query.pageSize ?? 20,
    error_only: query.errorOnly ?? false,
  };
  if (query.campaignId != null) params.campaign_id = query.campaignId;
  if (query.status) params.status = query.status;

  const { data } = await apiClient.get<AdminInteractionPage>(
    "/admin/interactions",
    { params }
  );
  return data;
}

export async function getAdminMonitoringState(): Promise<AdminMonitoringState> {
  const { data } = await apiClient.get<AdminMonitoringState>(
    "/admin/monitoring/state"
  );
  return data;
}
