import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone")?.trim();

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required." },
      { status: 400 },
    );
  }

  const { data: payments, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("phone_number", phone)
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const results = await Promise.all(
    (payments || []).map(async (p) => {
      const { count: claimed } = await supabaseAdmin
        .from("numbers")
        .select("*", { count: "exact", head: true })
        .eq("payment_id", p.id);

      const { data: claimedNumbers } = await supabaseAdmin
        .from("numbers")
        .select("number")
        .eq("payment_id", p.id)
        .order("number", { ascending: true });

      return {
        ...p,
        claimedCount: claimed || 0,
        unclaimedCount: p.ticket_count - (claimed || 0),
        claimedNumbers: (claimedNumbers || []).map((n) => n.number),
      };
    }),
  );

  return NextResponse.json({ payments: results });
}
