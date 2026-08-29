import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: approved } = await supabaseAdmin
    .from("payments")
    .select("id, ticket_count, refunded_count")
    .eq("status", "approved");

  const { count: claimedCount } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "taken");

  const totalApprovedPayments = approved?.length || 0;
  const totalTicketsSold = (approved || []).reduce(
    (sum, p) => sum + p.ticket_count,
    0,
  );
  const totalRefunded = (approved || []).reduce(
    (sum, p) => sum + p.refunded_count,
    0,
  );
  const totalUnclaimed = totalTicketsSold - (claimedCount || 0);

  // Count distinct customers who have at least one unclaimed ticket
  const { data: creditRows } = await supabaseAdmin
    .from("available_credits")
    .select("phone_number");
  const uniqueUnclaimedCustomers = new Set(
    (creditRows || []).map((c) => c.phone_number),
  ).size;

  return NextResponse.json({
    totalApprovedPayments,
    totalTicketsSold,
    totalRefunded,
    totalUnclaimed,
    uniqueUnclaimedCustomers,
  });
}
