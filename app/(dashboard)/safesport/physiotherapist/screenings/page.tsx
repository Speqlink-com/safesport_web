import { Suspense } from "react";
import Workspace from "@/features/safesport/workspace/workspace";
import { Skeleton } from "@/components/ui/skeleton";
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-label="Loading workspace">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <Workspace />
    </Suspense>
  );
}
