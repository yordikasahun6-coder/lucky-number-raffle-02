import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const adminFilter = request.nextUrl.searchParams.get("admin");
  const actionFilter = request.nextUrl.searchParams.get("action");
  const phoneFilter = request.nextUrl.searchParams.get("phone");

  let query = supabaseAdmin
    .from("approval_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (adminFilter) query = query.eq("admin_name", adminFilter);
  if (actionFilter) query = query.eq("action", actionFilter);
  if (phoneFilter) query = query.ilike("phone_number", `%${phoneFilter}%`);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: admins } = await supabaseAdmin
    .from("approval_audit_log")
    .select("admin_name");

  const uniqueAdmins = Array.from(
    new Set((admins || []).map((a) => a.admin_name)),
  ).sort();

  return NextResponse.json({ logs: data, admins: uniqueAdmins });
}
