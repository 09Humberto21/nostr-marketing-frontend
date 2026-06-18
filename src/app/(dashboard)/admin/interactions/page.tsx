"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/errors";
import type { AdminInteractionFilters } from "@/lib/api/query-keys";
import { useAdminInteractions } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { AdminInteractionsTable } from "@/components/admin/admin-interactions-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { key: null, label: "All" },
  { key: "success", label: "Success" },
  { key: "zap_failed", label: "Zap failed" },
  { key: "comment_failed", label: "Comment failed" },
  { key: "pending_comment_retry", label: "Retrying" },
] as const;

export default function AdminInteractionsPage() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [errorOnly, setErrorOnly] = React.useState(false);
  const [campaignIdInput, setCampaignIdInput] = React.useState("");
  const [campaignId, setCampaignId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);

  const filters: AdminInteractionFilters = {
    campaignId,
    status,
    errorOnly,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isPending, isError, error, refetch, isFetching } =
    useAdminInteractions(filters);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  const commitCampaignId = () => {
    const trimmed = campaignIdInput.trim();
    const parsed = trimmed ? Number(trimmed) : NaN;
    setCampaignId(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
    setPage(1);
  };

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All interactions"
        description="Platform-wide zap and comment interactions. Filter by campaign, status or errors."
      />

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.label}
              onClick={() => {
                setStatus(f.key);
                setPage(1);
              }}
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

      {/* Detailed filters */}
      <div className="glass flex flex-wrap items-end gap-4 p-4">
        <div className="w-40 space-y-1.5">
          <Label htmlFor="campaign_id">Campaign ID</Label>
          <Input
            id="campaign_id"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 7"
            value={campaignIdInput}
            onChange={(e) => setCampaignIdInput(e.target.value)}
            onBlur={commitCampaignId}
            onKeyDown={(e) => e.key === "Enter" && commitCampaignId()}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={errorOnly}
            onChange={(e) => {
              setErrorOnly(e.target.checked);
              setPage(1);
            }}
            className="size-4 rounded border-white/20 bg-black/30 accent-aurora"
          />
          Errors only
        </label>
      </div>

      {isError ? (
        <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="glass space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No interactions match"
          description="Try widening or clearing the filters."
        />
      ) : (
        <div className="space-y-3">
          <AdminInteractionsTable items={items} />

          {/* Pagination */}
          <div className="flex items-center justify-between px-1">
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
