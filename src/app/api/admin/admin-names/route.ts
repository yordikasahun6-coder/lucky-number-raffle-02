import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("display_name")
    .eq("active", true);
  const names = ["Owner", ...(data || []).map((a) => a.display_name)];
  return NextResponse.json({ names });
}
