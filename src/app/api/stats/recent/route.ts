import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const stars = "*".repeat(Math.max(phone.length - 4, 4));
  return `${start}${stars}${end}`;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("numbers")
    .select("number, phone_number, assigned_at")
    .eq("status", "taken")
    .order("assigned_at", { ascending: false })
    .limit(10);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const recent = (data || []).map((row) => ({
    number: row.number,
    maskedPhone: maskPhone(row.phone_number || ""),
    assignedAt: row.assigned_at,
  }));

  return NextResponse.json({ recent });
}
