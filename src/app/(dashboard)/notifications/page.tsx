"use client";

import * as React from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks/use-notifications";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const { data, isPending, isError, error, refetch, isFetching } = useNotifications({
    unreadOnly,
    page,
    pageSize: PAGE_SIZE,
  });
  const markRead = useMarkNotificationRead();
  const [markingId, setMarkingId] = React.useState<number | null>(null);
  const [markingAll, setMarkingAll] = React.useState(false);

  const items = data?.items ?? [];
  const unreadOnPage = items.filter((n) => n.read_at == null);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  const setFilter = (next: boolean) => {
    setUnreadOnly(next);
    setPage(1);
  };

  const handleMarkRead = (id: number) => {
    setMarkingId(id);
    markRead.mutate(id, { onSettled: () => setMarkingId(null) });
  };

  const handleMarkAll = async () => {
    if (unreadOnPage.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(unreadOnPage.map((n) => markRead.mutateAsync(n.id)));
      toast.success("All notifications on this page marked as read.");
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Campaign, wallet and system alerts for your company."
        actions={
          <Button
            variant="outline"
            onClick={handleMarkAll}
            loading={markingAll}
            disabled={unreadOnPage.length === 0}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: false, label: "All" },
          { key: true, label: "Unread" },
        ].map((f) => {
          const active = unreadOnly === f.key;
          return (
            <button
              key={String(f.key)}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-aurora/40 bg-aurora/10 text-aurora"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isError ? (
        <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="glass space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          description={
            unreadOnly
              ? "You're all caught up."
              : "Alerts about your campaigns, wallet and account will appear here."
          }
        />
      ) : (
        <div className="glass overflow-hidden">
          <ul className="divide-y divide-white/5">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  onMarkRead={handleMarkRead}
                  marking={markingId === n.id}
                />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
            <p className="text-xs text-muted-foreground tabular">
              {(data.page - 1) * data.page_size + 1}–
              {Math.min(data.page * data.page_size, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground tabular">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
