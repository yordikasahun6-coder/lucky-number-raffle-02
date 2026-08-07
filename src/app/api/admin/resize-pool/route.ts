import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { max_number } = await request.json();

  const parsed = Number(max_number);
  if (!parsed || parsed < 1) {
    return NextResponse.json(
      { error: "Enter a valid number of tickets." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.rpc("resize_number_pool", {
    p_new_max: parsed,
  });

  if (error) {
    if (error.message.includes("CLAIMED_NUMBERS_ABOVE_NEW_MAX")) {
      return NextResponse.json(
        {
          error:
            "Can't shrink below a number that's already been claimed by a customer.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, max_number: parsed });
}
