import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    password_loaded: process.env.ADMIN_PASSWORD ? true : false,
    password_length: process.env.ADMIN_PASSWORD?.length || 0,
    password_value: process.env.ADMIN_PASSWORD || "NOT SET",
    token_loaded: process.env.ADMIN_SESSION_TOKEN ? true : false,
  });
}
