"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import type { CampaignCreate } from "@/lib/types/api";
import { useCreateCampaign } from "@/lib/hooks/use-campaigns";
import { PageHeader } from "@/components/layout/page-header";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const [serverFieldErrors, setServerFieldErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (values: CampaignCreate) => {
    setServerFieldErrors({});
    try {
      const campaign = await createCampaign.mutateAsync(values);
      toast.success({
        title: "Campaign created",
        description: "Saved as a draft. Activate it when you're ready to go live.",
      });
      router.replace(`/campaigns/${campaign.id}`);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidation) {
        setServerFieldErrors(parsed.fieldErrors);
        toast.error({ title: "Check the form", description: parsed.message });
      } else {
        // Wallet validation / connectivity / funds failures land here.
        toast.error({
          title: "Couldn't create the campaign",
          description: parsed.message,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to campaigns
      </Link>

      <PageHeader
        title="New campaign"
        description="Configure your product, keywords, wallet and budget. We validate your NWC wallet and funds before saving."
      />

      <CampaignForm
        onSubmit={handleSubmit}
        submitting={createCampaign.isPending}
        serverFieldErrors={serverFieldErrors}
      />
    </div>
  );
}
