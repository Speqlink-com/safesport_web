"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { dashboardForRole } from "../api";
import { useAuthStore } from "../store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated || !user) {
      router.replace(`/account/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const expectedRoot = dashboardForRole(user.role);
    if (!pathname.startsWith(expectedRoot)) router.replace(expectedRoot);
  }, [authInitialized, isAuthenticated, pathname, router, user]);

  if (!authInitialized || !isAuthenticated || !user || !pathname.startsWith(dashboardForRole(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="size-6 animate-spin text-primary" aria-label="Loading your session" />
      </div>
    );
  }
  return children;
}

