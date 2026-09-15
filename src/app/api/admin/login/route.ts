import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const admin = await verifyCredentials(username || "", password);

  if (!admin) {
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }

  const token = await createSession(admin.name, username || "owner");

  const response = NextResponse.json({ success: true, name: admin.name });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
