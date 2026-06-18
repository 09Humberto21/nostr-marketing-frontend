/** Filters that vary an admin/notification query (kept in the cache key). */
export interface NotificationFilters {
  unreadOnly: boolean;
  page: number;
  pageSize: number;
}

export interface AdminCampaignFilters {
  status: string | null;
  companyId: number | null;
  createdFrom: string | null;
  createdTo: string | null;
}

export interface AdminInteractionFilters {
  campaignId: number | null;
  status: string | null;
  errorOnly: boolean;
  page: number;
  pageSize: number;
}

/** Centralized React Query keys to keep cache invalidation consistent. */
export const queryKeys = {
  me: ["me"] as const,
  company: ["company", "me"] as const,
  campaigns: ["campaigns"] as const,
  campaign: (id: number) => ["campaigns", id] as const,
  campaignMetrics: (id: number) => ["campaigns", id, "metrics"] as const,
  campaignInteractions: (id: number, page: number, pageSize: number) =>
    ["campaigns", id, "interactions", page, pageSize] as const,

  notifications: (filters: NotificationFilters) =>
    ["notifications", "list", filters] as const,
  notificationsUnread: ["notifications", "unread-count"] as const,

  adminCampaigns: (filters: AdminCampaignFilters) =>
    ["admin", "campaigns", filters] as const,
  adminInteractions: (filters: AdminInteractionFilters) =>
    ["admin", "interactions", filters] as const,
  adminMonitoring: ["admin", "monitoring"] as const,
};
