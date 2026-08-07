import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyCustomerNumberClaimed } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, number, random } = body;

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("closes_at, max_number")
    .limit(1)
    .single();

  if (settings?.closes_at && new Date(settings.closes_at) < new Date()) {
    return NextResponse.json(
      { error: "The draw has closed — numbers can no longer be claimed." },
      { status: 403 },
    );
  }

  const maxNumber = settings?.max_number || 1000;

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

    await sendClaimNotification(phone, data.number);
    return NextResponse.json({ success: true, number: data.number });
  }

  if (!number || number < 1 || number > maxNumber) {
    return NextResponse.json(
      { error: `Pick a number between 1 and ${maxNumber}.` },
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

  await sendClaimNotification(phone, data.number);
  return NextResponse.json({ success: true, number: data.number });
}

async function sendClaimNotification(phone: string, ticketNumber: number) {
  try {
    const { data: recentPayment } = await supabaseAdmin
      .from("payments")
      .select("telegram_chat_id")
      .eq("phone_number", phone.trim())
      .not("telegram_chat_id", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (!recentPayment?.telegram_chat_id) return; // not a Telegram customer, nothing to send

    const { data: credits } = await supabaseAdmin
      .from("available_credits")
      .select("remaining")
      .eq("phone_number", phone.trim());

    const remainingCredits = (credits || []).reduce(
      (sum, c) => sum + c.remaining,
      0,
    );

    const { data: settingsRow } = await supabaseAdmin
      .from("app_settings")
      .select("closes_at")
      .limit(1)
      .single();
    const drawDateText = settingsRow?.closes_at
      ? new Date(settingsRow.closes_at).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "To be announced";

    let allNumbers: number[] = [ticketNumber];
    if (remainingCredits === 0) {
      const { data: myNumbers } = await supabaseAdmin
        .from("numbers")
        .select("number")
        .eq("phone_number", phone.trim())
        .order("number", { ascending: true });
      if (myNumbers && myNumbers.length > 0) {
        allNumbers = myNumbers.map((n) => n.number);
      }
    }

    await notifyCustomerNumberClaimed({
      chatId: recentPayment.telegram_chat_id,
      ticketNumber,
      remainingCredits,
      drawDateText,
      allNumbers,
      phone: phone.trim(),
    });
  } catch (err) {
    console.log("sendClaimNotification failed:", err);
  }
}
