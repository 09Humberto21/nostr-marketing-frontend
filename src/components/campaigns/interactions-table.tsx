"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Inbox,
  Zap,
} from "lucide-react";
import type { CampaignInteractionOut } from "@/lib/types/api";
import { parseApiError } from "@/lib/api/errors";
import { interactionStatusMeta } from "@/lib/constants";
import { formatRelative, formatSats, truncateMiddle } from "@/lib/utils/format";
import { useCampaignInteractions } from "@/lib/hooks/use-metrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

function ZapCell({ interaction }: { interaction: CampaignInteractionOut }) {
  const ok = interaction.zap_status === "succeeded";
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs tabular ${
        ok ? "text-lightning-soft" : "text-muted-foreground line-through"
      }`}
    >
      <Zap className="size-3" />
      {formatSats(interaction.zap_amount_sats)}
    </span>
  );
}

function CommentCell({ interaction }: { interaction: CampaignInteractionOut }) {
  const ok = interaction.comment_status === "succeeded";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        ok ? "text-aurora" : "text-muted-foreground"
      }`}
      title={interaction.generated_comment ?? undefined}
    >
      <MessageSquare className="size-3" />
      {ok ? "Published" : interaction.comment_status}
    </span>
  );
}

export function InteractionsTable({ campaignId }: { campaignId: number }) {
  const [page, setPage] = React.useState(1);
  const { data, isPending, isError, error, refetch, isFetching } =
    useCampaignInteractions(campaignId, page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load interactions"
        description={parseApiError(error).message}
        onRetry={() => refetch()}
      />
    );
  }

  if (isPending) {
    return (
      <div className="glass space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No interactions yet"
        description="Once the campaign is active and finds relevant Nostr posts, each zap and comment will appear here."
      />
    );
  }

  return (
    <div className="glass overflow-hidden">
      <div className="hidden grid-cols-[1.4fr_1fr_1.2fr_1fr_1fr] gap-4 border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
        <span>Recipient</span>
        <span>Zap</span>
        <span>Comment</span>
        <span>Result</span>
        <span className="text-right">When</span>
      </div>

      <ul className="divide-y divide-white/5">
        {data.items.map((it) => {
          const meta = interactionStatusMeta(it.status);
          return (
            <li
              key={it.id}
              className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-[1.4fr_1fr_1.2fr_1fr_1fr] md:items-center md:gap-4"
            >
              <div className="col-span-2 min-w-0 md:col-span-1">
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
              <ZapCell interaction={it} />
              <CommentCell interaction={it} />
              <div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <div className="text-right text-xs text-muted-foreground" title={it.created_at}>
                {formatRelative(it.created_at)}
              </div>
            </li>
          );
        })}
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
  );
}
