"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parseApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toast-store";
import type { CampaignUpdate } from "@/lib/types/api";
import { useCampaign, useUpdateCampaign } from "@/lib/hooks/use-campaigns";
import { PageHeader } from "@/components/layout/page-header";
import {
  CampaignForm,
  type CampaignFormValues,
} from "@/components/campaigns/campaign-form";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { FullSpinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const campaignQuery = useCampaign(id);
  const campaign = campaignQuery.data;
  const update = useUpdateCampaign(id);
  const [serverFieldErrors, setServerFieldErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (values: CampaignFormValues) => {
    setServerFieldErrors({});
    // PATCH payload — only send the NWC when the user re-entered one.
    const payload: CampaignUpdate = {
      name: values.name.trim(),
      product_description: values.product_description.trim(),
      product_url: values.product_url.trim(),
      keywords: values.keywords,
      package_impacts: values.package_impacts,
      zap_amount_sats: values.zap_amount_sats,
    };
    const nwc = values.nwc_url.trim();
    if (nwc) payload.nwc_url = nwc;

    try {
      await update.mutateAsync(payload);
      toast.success({ title: "Campaign updated", description: "Your changes were saved." });
      router.replace(`/campaigns/${id}`);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidation) {
        setServerFieldErrors(parsed.fieldErrors);
        toast.error({ title: "Check the form", description: parsed.message });
      } else {
        toast.error({ title: "Couldn't update the campaign", description: parsed.message });
      }
    }
  };

  const backLink = (
    <Link
      href={Number.isNaN(id) ? "/campaigns" : `/campaigns/${id}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to campaign
    </Link>
  );

  if (Number.isNaN(id)) {
    return <ErrorState title="Invalid campaign" description="The campaign id is not valid." />;
  }

  if (campaignQuery.isPending) {
    return <FullSpinner label="Loading campaign…" />;
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <ErrorState
        title="Couldn't load this campaign"
        description={parseApiError(campaignQuery.error).message}
        onRetry={() => campaignQuery.refetch()}
      />
    );
  }

  // Only drafts are editable; once live the configuration is locked.
  if (campaign.status !== "draft") {
    return (
      <div className="space-y-6">
        {backLink}
        <EmptyState
          title="This campaign can no longer be edited"
          description="Only draft campaigns are editable. Pause or review the campaign from its detail page."
          action={
            <Button asChild>
              <Link href={`/campaigns/${id}`}>Back to campaign</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backLink}

      <PageHeader
        title={`Edit · ${campaign.name}`}
        description="Update your campaign while it's still a draft. Leave the wallet blank to keep the one you saved."
      />

      <CampaignForm
        mode="edit"
        submitLabel="Save changes"
        defaultValues={{
          name: campaign.name,
          product_description: campaign.product_description,
          product_url: campaign.product_url,
          keywords: campaign.keywords,
          package_impacts: campaign.package_impacts,
          zap_amount_sats: campaign.zap_amount_sats,
          nwc_url: "",
        }}
        onSubmit={handleSubmit}
        submitting={update.isPending}
        serverFieldErrors={serverFieldErrors}
      />
    </div>
  );
}
