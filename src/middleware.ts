import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/api/admin/login" ||
    request.nextUrl.pathname === "/api/admin/debug"
  ) {
    return NextResponse.next();
  }
  const session = request.cookies.get("admin_session")?.value;
  const isValid = session === process.env.ADMIN_SESSION_TOKEN;

  if (isValid) {
    return NextResponse.next();
  }

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/payments/approve",
    "/api/payments/screenshot",
  ],
};
