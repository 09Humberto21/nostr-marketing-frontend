"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markNotificationRead } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";

/** Only company users receive notifications. */
function useIsCompanyUser(): boolean {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  // Treat unknown role (still loading) as a company user so the bell can load.
  return Boolean(token) && role !== "platform_admin";
}

export function useNotifications(
  params: { unreadOnly: boolean; page: number; pageSize: number },
  options?: { enabled?: boolean }
) {
  const isCompanyUser = useIsCompanyUser();
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () =>
      listNotifications({
        unreadOnly: params.unreadOnly,
        page: params.page,
        pageSize: params.pageSize,
      }),
    enabled: isCompanyUser && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}

/** Lightweight unread counter for the topbar bell badge. */
export function useUnreadCount() {
  const enabled = useIsCompanyUser();
  return useQuery({
    queryKey: queryKeys.notificationsUnread,
    queryFn: () => listNotifications({ unreadOnly: true, page: 1, pageSize: 1 }),
    enabled,
    refetchInterval: 30_000,
    select: (page) => page.total,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      // Refresh every notification list and the unread badge.
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
