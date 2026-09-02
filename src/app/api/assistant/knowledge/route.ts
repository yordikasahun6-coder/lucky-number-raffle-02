import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("ticket_price, currency, closes_at, telegram_username, max_number")
    .limit(1)
    .single();

  const { data: prizes } = await supabaseAdmin
    .from("prizes")
    .select("title, amount")
    .eq("active", true)
    .order("display_order", { ascending: true });

  const { data: accounts } = await supabaseAdmin
    .from("payment_accounts")
    .select("name")
    .eq("active", true);

  const { count: taken } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken");

  const totalPool = settings?.max_number || 1000;
  const remaining = totalPool - (taken || 0);

  return NextResponse.json({
    ticketPrice: settings?.ticket_price || 0,
    currency: settings?.currency || "ETB",
    drawDate: settings?.closes_at
      ? new Date(settings.closes_at).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null,
    telegramUsername: settings?.telegram_username || null,
    totalPool,
    remaining,
    topPrize: prizes?.[0]?.amount || null,
    prizeCount: prizes?.length || 0,
    paymentMethods: (accounts || []).map((a) => a.name),
  });
}
