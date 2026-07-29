import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, number, random } = body;

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("closes_at")
    .limit(1)
    .single();
  if (settings?.closes_at && new Date(settings.closes_at) < new Date()) {
    return NextResponse.json(
      { error: "The draw has closed — numbers can no longer be claimed." },
      { status: 403 },
    );
  }

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required." },
      { status: 400 },
    );
  }

  if (random) {
    const { data, error } = await supabaseAdmin.rpc("claim_random_number", {
      p_phone: phone,
    });

    console.log("claim_random_number result:", { data, error });

    if (error) {
      if (error.message.includes("PHONE_NOT_APPROVED")) {
        return NextResponse.json(
          { error: "Your payment has not been approved yet." },
          { status: 403 },
        );
      }
      if (error.message.includes("NO_AVAILABLE_CREDIT")) {
        return NextResponse.json(
          {
            error:
              "You don't have a paid ticket available. Submit a new payment to get another number.",
          },
          { status: 403 },
        );
      }
      if (error.message.includes("SOLD_OUT")) {
        return NextResponse.json(
          { error: "All numbers have been claimed." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: `Could not claim a number: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, number: data.number });
  }

  if (!number || number < 1 || number > 1000) {
    return NextResponse.json(
      { error: "Pick a number between 1 and 1000." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin.rpc("claim_number", {
    p_number: number,
    p_phone: phone,
  });

  console.log("claim_number result:", { data, error });

  if (error) {
    if (error.message.includes("PHONE_NOT_APPROVED")) {
      return NextResponse.json(
        { error: "Your payment has not been approved yet." },
        { status: 403 },
      );
    }
    if (error.message.includes("NO_AVAILABLE_CREDIT")) {
      return NextResponse.json(
        {
          error:
            "You don't have a paid ticket available. Submit a new payment to get another number.",
        },
        { status: 403 },
      );
    }
    if (error.message.includes("NUMBER_ALREADY_TAKEN")) {
      return NextResponse.json(
        { error: "Someone just claimed that number — pick another." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: `Could not claim that number: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, number: data.number });
}
