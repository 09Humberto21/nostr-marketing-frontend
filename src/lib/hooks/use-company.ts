"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyCompany, updateMyCompany } from "@/lib/api/companies";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import type { CompanyUpdate } from "@/lib/types/api";

export function useMyCompany() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: getMyCompany,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyUpdate) => updateMyCompany(payload),
    onSuccess: (company) => {
      queryClient.setQueryData(queryKeys.company, company);
    },
  });
}
