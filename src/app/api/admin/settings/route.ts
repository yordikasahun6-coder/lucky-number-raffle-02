import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("*")
    .limit(1)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { ticket_price, currency, closes_at } = body;

  if (
    ticket_price === undefined ||
    ticket_price === null ||
    ticket_price <= 0
  ) {
    return NextResponse.json(
      { error: "Ticket price must be a positive number." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("app_settings")
    .update({
      ticket_price,
      currency: currency || "ETB",
      closes_at: closes_at || null,
    })
    .eq("id", true);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
