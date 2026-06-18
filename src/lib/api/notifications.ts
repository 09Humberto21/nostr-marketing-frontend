import { apiClient } from "@/lib/api/client";
import type { NotificationOut, NotificationPage } from "@/lib/types/api";

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listNotifications({
  unreadOnly = false,
  page = 1,
  pageSize = 20,
}: ListNotificationsParams = {}): Promise<NotificationPage> {
  const { data } = await apiClient.get<NotificationPage>("/notifications", {
    params: { unread_only: unreadOnly, page, page_size: pageSize },
  });
  return data;
}

export async function markNotificationRead(id: number): Promise<NotificationOut> {
  const { data } = await apiClient.post<NotificationOut>(
    `/notifications/${id}/read`
  );
  return data;
}
