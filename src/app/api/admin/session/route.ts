import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const session = await validateSession(token);

  if (!session)
    return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    name: session.name,
    isOwner: session.name === "Owner",
  });
}
