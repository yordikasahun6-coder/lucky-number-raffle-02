import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("max_number")
    .limit(1)
    .single();
  const total = settings?.max_number || 1000;

  const { count, error } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const sold = count || 0;
  return NextResponse.json({ sold, total, remaining: total - sold });
}
