import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { payment_id, refund_amount } = await request.json();

  if (!payment_id || !refund_amount || refund_amount < 1) {
    return NextResponse.json(
      { error: "Missing or invalid refund details." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.rpc("refund_payment_tickets", {
    p_payment_id: payment_id,
    p_refund_amount: refund_amount,
  });

  if (error) {
    if (error.message.includes("EXCEEDS_UNCLAIMED")) {
      return NextResponse.json(
        {
          error:
            "Can't refund more than the unclaimed portion — some of these tickets have already been picked.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
