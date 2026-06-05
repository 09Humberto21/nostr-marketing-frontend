import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import type { CampaignOut } from "@/lib/types/api";
import { formatDate, formatSats } from "@/lib/utils/format";
import { StatusBadge } from "@/components/campaigns/status-badge";

export function CampaignsTable({ campaigns }: { campaigns: CampaignOut[] }) {
  return (
    <div className="glass overflow-hidden">
      {/* Header (desktop) */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
        <span>Campaign</span>
        <span>Status</span>
        <span className="text-right">Package</span>
        <span className="text-right">Zap</span>
        <span className="w-5" />
      </div>

      <ul className="divide-y divide-white/5">
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link
              href={`/campaigns/${c.id}`}
              className="group grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground group-hover:text-aurora">
                  {c.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Created {formatDate(c.created_at)}
                  {c.keywords.length > 0 && ` · ${c.keywords.length} keywords`}
                </p>
              </div>

              <div className="flex md:block">
                <StatusBadge status={c.status} />
              </div>

              <div className="flex items-center justify-between md:justify-end">
                <span className="text-xs text-muted-foreground md:hidden">Package</span>
                <span className="font-mono text-sm text-foreground tabular">
                  {c.package_impacts}
                </span>
              </div>

              <div className="flex items-center justify-between md:justify-end">
                <span className="text-xs text-muted-foreground md:hidden">Zap</span>
                <span className="flex items-center gap-1 font-mono text-sm text-lightning-soft tabular">
                  <Zap className="size-3" />
                  {formatSats(c.zap_amount_sats)}
                </span>
              </div>

              <ChevronRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground md:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
