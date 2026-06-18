"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/hooks/use-notifications";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Spinner } from "@/components/ui/spinner";

const RECENT_SIZE = 6;

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close, open);

  const unread = useUnreadCount();
  const unreadCount = unread.data ?? 0;

  // Only fetch the recent list while the panel is open (the badge uses the count).
  const recent = useNotifications(
    { unreadOnly: false, page: 1, pageSize: RECENT_SIZE },
    { enabled: open }
  );
  const markRead = useMarkNotificationRead();
  const [markingId, setMarkingId] = React.useState<number | null>(null);

  const handleMarkRead = (id: number) => {
    setMarkingId(id);
    markRead.mutate(id, { onSettled: () => setMarkingId(null) });
  };

  const items = recent.data?.items ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          open && "bg-white/5 text-foreground"
        )}
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-aurora px-1 text-[10px] font-bold leading-4 text-galaxy-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[360px] max-w-[calc(100vw-2rem)] origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-galaxy-850/95 shadow-glass backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-aurora/10 px-2 py-0.5 text-[11px] font-medium text-aurora">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {recent.isPending ? (
              <div className="flex items-center justify-center py-10">
                <Spinner className="size-5" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="size-6 text-muted-foreground" aria-hidden />
                <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      onMarkRead={handleMarkRead}
                      marking={markingId === n.id}
                      compact
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-white/5 p-2">
            <Link
              href="/notifications"
              onClick={close}
              className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-aurora transition-colors hover:bg-white/5"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
