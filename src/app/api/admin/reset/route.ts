import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { password, confirmation } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  if (confirmation !== "RESET EVERYTHING") {
    return NextResponse.json(
      { error: "Confirmation phrase did not match." },
      { status: 400 },
    );
  }

  // 1. Collect and delete every screenshot from storage
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("screenshot_url")
    .not("screenshot_url", "is", null);

  const paths = (payments || [])
    .map((p) => p.screenshot_url)
    .filter(Boolean) as string[];

  if (paths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .remove(paths);

    if (storageError) {
      return NextResponse.json(
        { error: `Screenshot deletion failed: ${storageError.message}` },
        { status: 500 },
      );
    }
  }

  // 2. Reset every number FIRST — clear the payment_id reference before
  // touching payments, otherwise the foreign key blocks the delete below.
  // Includes claim_notified now too, so no stale flags survive a reset.
  const { error: numbersError } = await supabaseAdmin
    .from("numbers")
    .update({
      status: "available",
      phone_number: null,
      payment_id: null,
      assigned_at: null,
      claim_notified: false,
    })
    .not("number", "is", null);

  if (numbersError) {
    return NextResponse.json(
      { error: `Resetting numbers failed: ${numbersError.message}` },
      { status: 500 },
    );
  }

  // 3. Now safe to wipe every payment record (also clears all reference
  // numbers, telegram_message_id, and telegram_chat_id since the whole
  // row goes away)
  const { error: paymentsError } = await supabaseAdmin
    .from("payments")
    .delete()
    .not("id", "is", null);

  if (paymentsError) {
    return NextResponse.json(
      { error: `Clearing payments failed: ${paymentsError.message}` },
      { status: 500 },
    );
  }

  // 4. Clear any in-progress Telegram bot conversations — otherwise
  // someone mid-way through typing their name/phone/method before the
  // reset would resume into a session referencing data that no longer
  // makes sense in a fresh raffle round.
  const { error: sessionsError } = await supabaseAdmin
    .from("telegram_sessions")
    .delete()
    .not("chat_id", "is", null);

  if (sessionsError) {
    return NextResponse.json(
      { error: `Clearing Telegram sessions failed: ${sessionsError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    screenshotsDeleted: paths.length,
  });
}
