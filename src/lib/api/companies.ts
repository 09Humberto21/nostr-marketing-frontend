import { apiClient } from "@/lib/api/client";
import type { CompanyOut, CompanyUpdate } from "@/lib/types/api";

export async function getMyCompany(): Promise<CompanyOut> {
  const { data } = await apiClient.get<CompanyOut>("/companies/me");
  return data;
}

export async function updateMyCompany(payload: CompanyUpdate): Promise<CompanyOut> {
  const { data } = await apiClient.patch<CompanyOut>("/companies/me", payload);
  return data;
}
