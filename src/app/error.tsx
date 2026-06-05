"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // In production you'd forward this to your error tracker.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card variant="strong" className="max-w-md p-8 text-center">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-red-300">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can try again — if it persists, please contact support.
            </p>
          </div>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
