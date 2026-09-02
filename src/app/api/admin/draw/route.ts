import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: draws } = await supabaseAdmin
    .from("draws")
    .select("*")
    .order("drawn_at", { ascending: false });

  const { count: eligibleCount } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken");

  const drawnNumbers = (draws || []).map((d) => d.ticket_number);
  const { count: remainingCount } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken")
    .not(
      "number",
      "in",
      `(${drawnNumbers.length > 0 ? drawnNumbers.join(",") : "0"})`,
    );

  const { data: settingsRow } = await supabaseAdmin
    .from("app_settings")
    .select("max_number")
    .limit(1)
    .single();
  const totalPool = settingsRow?.max_number || 1000;
  const soldOut = (eligibleCount || 0) >= totalPool;

  return NextResponse.json({
    draws: draws || [],
    eligibleCount: eligibleCount || 0,
    remainingCount: remainingCount || 0,
    totalPool,
    soldOut,
  });
}

export async function POST() {
  const { data: winner, error } = await supabaseAdmin.rpc("draw_random_winner");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!winner || winner.length === 0) {
    return NextResponse.json(
      { error: "No eligible tickets left to draw from." },
      { status: 409 },
    );
  }

  const picked = winner[0];

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("customer_name")
    .eq("phone_number", picked.phone_number)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  const { data: draw, error: insertError } = await supabaseAdmin
    .from("draws")
    .insert({
      ticket_number: picked.number,
      phone_number: picked.phone_number,
      customer_name: payment?.customer_name || "Unknown",
    })
    .select()
    .single();

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ draw });
}
