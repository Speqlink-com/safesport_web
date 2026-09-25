"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-xl border p-8">
      <h1 className="text-xl font-semibold">
        This workspace could not be displayed
      </h1>
      <p className="my-4 text-sm text-muted-foreground">
        Try rendering the page again. Refreshing the browser resets local demo
        changes.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
