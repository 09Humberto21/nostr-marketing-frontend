import { apiClient } from "@/lib/api/client";
import type {
  CampaignActivate,
  CampaignCreate,
  CampaignInteractionPage,
  CampaignMetrics,
  CampaignNwcTestRequest,
  CampaignNwcTestResult,
  CampaignOut,
  CampaignResume,
  CampaignUpdate,
} from "@/lib/types/api";

export async function listCampaigns(): Promise<CampaignOut[]> {
  const { data } = await apiClient.get<CampaignOut[]>("/campaigns");
  return data;
}

export async function getCampaign(id: number): Promise<CampaignOut> {
  const { data } = await apiClient.get<CampaignOut>(`/campaigns/${id}`);
  return data;
}

export async function createCampaign(payload: CampaignCreate): Promise<CampaignOut> {
  const { data } = await apiClient.post<CampaignOut>("/campaigns", payload);
  return data;
}

export async function updateCampaign(
  id: number,
  payload: CampaignUpdate
): Promise<CampaignOut> {
  const { data } = await apiClient.patch<CampaignOut>(`/campaigns/${id}`, payload);
  return data;
}

export async function activateCampaign(
  id: number,
  payload: CampaignActivate
): Promise<CampaignOut> {
  const { data } = await apiClient.post<CampaignOut>(
    `/campaigns/${id}/activate`,
    payload
  );
  return data;
}

export async function pauseCampaign(id: number): Promise<CampaignOut> {
  const { data } = await apiClient.post<CampaignOut>(`/campaigns/${id}/pause`);
  return data;
}

export async function resumeCampaign(
  id: number,
  payload: CampaignResume
): Promise<CampaignOut> {
  const { data } = await apiClient.post<CampaignOut>(
    `/campaigns/${id}/resume`,
    payload
  );
  return data;
}

export async function testCampaignNwc(
  id: number,
  payload: CampaignNwcTestRequest
): Promise<CampaignNwcTestResult> {
  const { data } = await apiClient.post<CampaignNwcTestResult>(
    `/campaigns/${id}/test-nwc`,
    payload
  );
  return data;
}

export async function getCampaignMetrics(id: number): Promise<CampaignMetrics> {
  const { data } = await apiClient.get<CampaignMetrics>(`/campaigns/${id}/metrics`);
  return data;
}

export async function getCampaignInteractions(
  id: number,
  page = 1,
  pageSize = 20
): Promise<CampaignInteractionPage> {
  const { data } = await apiClient.get<CampaignInteractionPage>(
    `/campaigns/${id}/interactions`,
    { params: { page, page_size: pageSize } }
  );
  return data;
}
