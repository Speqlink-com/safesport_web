import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const ACCESS_COOKIE = "safesport_access";
const REFRESH_COOKIE = "safesport_refresh";
const ROLES = new Set([
  "athlete",
  "guardian",
  "clinician",
  "physiotherapist",
  "coach",
  "institution",
  "operations",
  "sys-admin",
]);

interface SessionResponse {
  user: {
    role: string;
  };
}

export async function proxy(request: NextRequest) {
  const normalized = normalizeLegacyDashboard(request);
  if (normalized) return normalized;

  const { pathname } = request.nextUrl;
  const hasAccessCookie = request.cookies.has(ACCESS_COOKIE);
  const hasRefreshCookie = request.cookies.has(REFRESH_COOKIE);
  const isDashboardRoute = pathname === "/safesport" || pathname.startsWith("/safesport/");
  const isAuthRoute = pathname.startsWith("/account/");

  if (pathname === "/") {
    if (!hasAccessCookie && !hasRefreshCookie) return redirect(request, "/account/signin");
    const role = hasAccessCookie ? await sessionRole(request) : null;
    return redirect(request, role ? `/safesport/${role}` : "/safesport");
  }

  if (isDashboardRoute) {
    if (!hasAccessCookie && !hasRefreshCookie) {
      return redirect(request, `/account/signin?next=${encodeURIComponent(pathnameWithSearch(request))}`);
    }

    if (!hasAccessCookie && hasRefreshCookie) return NextResponse.next();

    const role = await sessionRole(request);
    if (!role) {
      if (hasRefreshCookie) return NextResponse.next();
      return redirect(request, `/account/signin?next=${encodeURIComponent(pathnameWithSearch(request))}`);
    }

    if (pathname === "/safesport") return redirect(request, `/safesport/${role}`);

    const requestedRole = pathname.split("/")[2];
    if (ROLES.has(requestedRole) && requestedRole !== role) {
      return redirect(request, `/safesport/${role}`);
    }

    return NextResponse.next();
  }

  if (isAuthRoute && (hasAccessCookie || hasRefreshCookie)) {
    const role = hasAccessCookie ? await sessionRole(request) : null;
    if (role) return redirect(request, `/safesport/${role}`);
    if (hasRefreshCookie) return redirect(request, "/safesport");
  }

  return NextResponse.next();
}

function normalizeLegacyDashboard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard/safesport")) return null;
  const url = request.nextUrl.clone();
  url.pathname = pathname.replace("/dashboard/safesport", "/safesport") || "/safesport";
  return NextResponse.redirect(url);
}

async function sessionRole(request: NextRequest): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      cache: "no-store",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });
    if (!response.ok) return null;
    const session = (await response.json()) as SessionResponse;
    return ROLES.has(session.user.role) ? session.user.role : null;
  } catch {
    return null;
  }
}

function redirect(request: NextRequest, target: string): NextResponse {
  return NextResponse.redirect(new URL(target, request.url));
}

function pathnameWithSearch(request: NextRequest): string {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export const config = {
  matcher: ["/", "/account/:path*", "/safesport/:path*", "/dashboard/safesport/:path*"],
};
