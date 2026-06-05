import { Badge } from "@/components/ui/badge";
import { statusMeta } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  const animated = status === "active";
  return (
    <Badge tone={meta.tone} dot={animated || status === "paused_insufficient_funds"}>
      {meta.label}
    </Badge>
  );
}
