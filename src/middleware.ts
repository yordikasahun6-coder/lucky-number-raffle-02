import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/api/admin/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);

  if (session) {
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
