import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { count: availableCount, error: availError } = await supabaseAdmin
    .from("numbers")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");

  if (availError)
    return NextResponse.json({ error: availError.message }, { status: 500 });

  const { data: credits, error: creditsError } = await supabaseAdmin
    .from("available_credits")
    .select("remaining");

  if (creditsError)
    return NextResponse.json({ error: creditsError.message }, { status: 500 });

  const outstandingCredits = (credits || []).reduce(
    (sum, c) => sum + c.remaining,
    0,
  );
  const available = availableCount || 0;
  const safeMax = Math.max(0, available - outstandingCredits);

  return NextResponse.json({ available, outstandingCredits, safeMax });
}
