/** Centralized React Query keys to keep cache invalidation consistent. */
export const queryKeys = {
  me: ["me"] as const,
  company: ["company", "me"] as const,
  campaigns: ["campaigns"] as const,
  campaign: (id: number) => ["campaigns", id] as const,
  campaignMetrics: (id: number) => ["campaigns", id, "metrics"] as const,
  campaignInteractions: (id: number, page: number, pageSize: number) =>
    ["campaigns", id, "interactions", page, pageSize] as const,
};
