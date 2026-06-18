"use client";

import { MessageSquare, Zap } from "lucide-react";
import type { AdminInteractionOut } from "@/lib/types/api";
import { interactionStatusMeta } from "@/lib/constants";
import { formatRelative, formatSats, truncateMiddle } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export function AdminInteractionsTable({ items }: { items: AdminInteractionOut[] }) {
  return (
    <div className="glass overflow-hidden">
      <div className="hidden grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr_0.9fr] gap-4 border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
        <span>Recipient</span>
        <span>Zap</span>
        <span>Comment</span>
        <span>Result</span>
        <span>Campaign</span>
        <span className="text-right">When</span>
      </div>

      <ul className="divide-y divide-white/5">
        {items.map((it) => {
          const meta = interactionStatusMeta(it.status);
          const zapOk = it.zap_status === "succeeded";
          const commentOk = it.comment_status === "succeeded";
          return (
            <li
              key={it.id}
              className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr_0.9fr] lg:items-center lg:gap-4"
            >
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="truncate font-mono text-xs text-foreground" title={it.target_pubkey}>
                  {truncateMiddle(it.target_pubkey, 10)}
                </p>
                {it.error_message && (
                  <p className="truncate text-[11px] text-red-300/80" title={it.error_message}>
                    {it.error_code ? `${it.error_code}: ` : ""}
                    {it.error_message}
                  </p>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1 font-mono text-xs tabular ${
                  zapOk ? "text-lightning-soft" : "text-muted-foreground line-through"
                }`}
              >
                <Zap className="size-3" />
                {formatSats(it.zap_amount_sats)}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  commentOk ? "text-aurora" : "text-muted-foreground"
                }`}
                title={it.generated_comment ?? undefined}
              >
                <MessageSquare className="size-3" />
                {commentOk ? "Published" : it.comment_status}
              </span>

              <div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>

              <div className="text-xs text-muted-foreground tabular">
                <span className="font-mono text-foreground">#{it.campaign_id}</span>
                <span className="ml-1 text-muted-foreground/70">· co {it.company_id}</span>
              </div>

              <div className="text-right text-xs text-muted-foreground" title={it.created_at}>
                {formatRelative(it.created_at)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
