import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  await deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return response;
}
