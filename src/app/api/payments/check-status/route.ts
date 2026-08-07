import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required." },
      { status: 400 },
    );
  }

  const cleanPhone = phone.trim();

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("status, customer_name")
    .eq("phone_number", cleanPhone)
    .order("submitted_at", { ascending: false });

  const { data: credits } = await supabaseAdmin
    .from("available_credits")
    .select("remaining")
    .eq("phone_number", cleanPhone);

  const { data: myNumbers } = await supabaseAdmin
    .from("numbers")
    .select("number")
    .eq("phone_number", cleanPhone);

  const { data: takenRows } = await supabaseAdmin
    .from("numbers")
    .select("number")
    .eq("status", "taken");

  const availableCredits = (credits || []).reduce(
    (sum, c) => sum + c.remaining,
    0,
  );

  let status: "approved" | "pending" | "used_up" | "rejected" | "not_found" =
    "not_found";

  if (payments && payments.length > 0) {
    if (availableCredits > 0) status = "approved";
    else if (payments.some((p) => p.status === "pending")) status = "pending";
    else if (payments.some((p) => p.status === "approved")) status = "used_up";
    else status = "rejected";
  }

  return NextResponse.json({
    status,
    approved: status === "approved",
    availableCredits,
    myNumbers: (myNumbers || []).map((n) => n.number),
    takenNumbers: (takenRows || []).map((n) => n.number),
    customerName: payments?.[0]?.customer_name || null,
  });
}
