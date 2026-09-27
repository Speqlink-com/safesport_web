import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Redirect root to signin
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/account/signin", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/safesport")) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace("/dashboard/safesport", "/safesport");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/safesport", "/dashboard/safesport/:path*"],
};
