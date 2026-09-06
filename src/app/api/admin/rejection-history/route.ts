import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone")?.trim();
  if (!phone)
    return NextResponse.json({ error: "Phone required." }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("phone_number", phone)
    .eq("status", "rejected");

  return NextResponse.json({ rejectionCount: count || 0 });
}
