import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("status", "approved")
    .order("reviewed_at", { ascending: true }); // oldest approvals first — likely most overdue

  const results = await Promise.all(
    (payments || []).map(async (p) => {
      const { count: claimed } = await supabaseAdmin
        .from("numbers")
        .select("*", { count: "exact", head: true })
        .eq("payment_id", p.id);

      const unclaimedCount = p.ticket_count - (claimed || 0);
      const daysSinceApproval = p.reviewed_at
        ? Math.floor(
            (Date.now() - new Date(p.reviewed_at).getTime()) / 86400000,
          )
        : 0;

      return {
        ...p,
        claimedCount: claimed || 0,
        unclaimedCount,
        daysSinceApproval,
      };
    }),
  );

  const withUnclaimed = results.filter((r) => r.unclaimedCount > 0);

  return NextResponse.json({ payments: withUnclaimed });
}
