"use client";

import Link from "next/link";
import {
  Bell,
  Check,
  Megaphone,
  Server,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { NotificationOut } from "@/lib/types/api";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";
import { Spinner } from "@/components/ui/spinner";

type Tone = "aurora" | "lightning" | "nebula" | "cosmic" | "muted";

function notificationMeta(type: string): { icon: LucideIcon; tone: Tone } {
  switch (type) {
    case "campaign":
      return { icon: Megaphone, tone: "aurora" };
    case "wallet":
      return { icon: Wallet, tone: "lightning" };
    case "interaction":
      return { icon: Zap, tone: "lightning" };
    case "system":
      return { icon: Server, tone: "cosmic" };
    default:
      return { icon: Bell, tone: "muted" };
  }
}

const TONE_TEXT: Record<Tone, string> = {
  aurora: "text-aurora",
  lightning: "text-lightning-soft",
  nebula: "text-nebula-soft",
  cosmic: "text-cosmic-soft",
  muted: "text-muted-foreground",
};

export function NotificationItem({
  notification,
  onMarkRead,
  marking = false,
  compact = false,
}: {
  notification: NotificationOut;
  onMarkRead?: (id: number) => void;
  marking?: boolean;
  compact?: boolean;
}) {
  const { icon: Icon, tone } = notificationMeta(notification.type);
  const unread = notification.read_at == null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 transition-colors",
        compact ? "px-4 py-3" : "p-4",
        unread && "bg-aurora/[0.04]"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5",
          TONE_TEXT[tone]
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              unread ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          {unread && (
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aurora"
              aria-label="Unread"
            />
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 text-xs text-muted-foreground",
            compact ? "line-clamp-2" : "whitespace-pre-wrap"
          )}
        >
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span title={notification.created_at}>
            {formatRelative(notification.created_at)}
          </span>
          {notification.campaign_id != null && (
            <Link
              href={`/campaigns/${notification.campaign_id}`}
              className="text-aurora hover:underline"
            >
              View campaign
            </Link>
          )}
          {unread && onMarkRead && (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              disabled={marking}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {marking ? <Spinner className="size-3" /> : <Check className="size-3" />}
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
