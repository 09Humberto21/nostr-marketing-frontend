"use client";

import * as React from "react";
import { Rocket, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/errors";
import type { AdminCampaignFilters } from "@/lib/api/query-keys";
import { useAdminCampaigns } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { AdminCampaignsTable } from "@/components/admin/admin-campaigns-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILTERS = [
  { key: null, label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Completed" },
  { key: "expired", label: "Expired" },
] as const;

export default function AdminCampaignsPage() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [companyIdInput, setCompanyIdInput] = React.useState("");
  const [companyId, setCompanyId] = React.useState<number | null>(null);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  const filters: AdminCampaignFilters = {
    status,
    companyId,
    createdFrom: fromDate ? `${fromDate}T00:00:00Z` : null,
    createdTo: toDate ? `${toDate}T23:59:59Z` : null,
  };

  const { data, isPending, isError, error, refetch } = useAdminCampaigns(filters);

  const commitCompanyId = () => {
    const trimmed = companyIdInput.trim();
    const parsed = trimmed ? Number(trimmed) : NaN;
    setCompanyId(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  };

  const hasFilters = status !== null || companyId !== null || fromDate !== "" || toDate !== "";
  const clearFilters = () => {
    setStatus(null);
    setCompanyIdInput("");
    setCompanyId(null);
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All campaigns"
        description="Platform-wide campaign listing across every company."
      />

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.label}
              onClick={() => setStatus(f.key)}
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
      <div className="glass grid gap-4 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="company_id">Company ID</Label>
          <Input
            id="company_id"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 12"
            value={companyIdInput}
            onChange={(e) => setCompanyIdInput(e.target.value)}
            onBlur={commitCompanyId}
            onKeyDown={(e) => e.key === "Enter" && commitCompanyId()}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="created_from">Created from</Label>
          <Input
            id="created_from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="created_to">Created to</Label>
          <Input
            id="created_to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {isError ? (
        <ErrorState description={parseApiError(error).message} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="glass space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No campaigns match"
          description={hasFilters ? "Try widening or clearing the filters." : "No campaigns on the platform yet."}
        />
      ) : (
        <AdminCampaignsTable campaigns={data} />
      )}
    </div>
  );
}
