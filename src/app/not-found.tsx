import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card variant="strong" className="max-w-md p-8 text-center">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-nebula/15 text-nebula-soft">
            <Compass className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">404</h1>
            <p className="text-sm text-muted-foreground">
              This corner of the galaxy doesn&apos;t exist. Let&apos;s get you back on course.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to the Observatory</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
