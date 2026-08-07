import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateAdminTelegramStatus } from "@/lib/telegram";
import { notifyCustomerTelegram } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { payment_id, reference_number, action, ticket_count } = body;

  if (!payment_id || !action) {
    return NextResponse.json(
      { error: "Missing payment_id or action." },
      { status: 400 },
    );
  }

  if (action === "reject") {
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select(
        "customer_name, phone_number, method, telegram_message_id, screenshot_url, telegram_chat_id",
      )
      .eq("id", payment_id)
      .single();

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
      })
      .eq("id", payment_id);

    if (error)
      return NextResponse.json({ error: "Reject failed." }, { status: 500 });

    if (payment?.telegram_message_id) {
      await updateAdminTelegramStatus({
        messageId: payment.telegram_message_id,
        hasPhoto: !!payment.screenshot_url,
        customerName: payment.customer_name,
        phoneNumber: payment.phone_number,
        method: payment.method,
        status: "rejected",
      });
    }

    if (payment?.telegram_chat_id) {
      await notifyCustomerTelegram({
        chatId: payment.telegram_chat_id,
        status: "rejected",
      });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    if (!reference_number || reference_number.trim().length === 0) {
      return NextResponse.json(
        { error: "Reference number is required to approve." },
        { status: 400 },
      );
    }

    // Re-check server-side right before saving — never trust the
    // green checkmark alone, someone else could've approved it in
    // the seconds between the check and the click.
    const { data: existing } = await supabaseAdmin.rpc(
      "check_reference_number",
      {
        p_reference: reference_number.trim(),
      },
    );

    if (existing) {
      return NextResponse.json(
        { error: `Already approved under phone number ${existing}.` },
        { status: 409 },
      );
    }

    const count = Number(ticket_count) > 0 ? Number(ticket_count) : 1;

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select(
        "customer_name, phone_number, method, telegram_message_id, screenshot_url, telegram_chat_id",
      )
      .eq("id", payment_id)
      .single();

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "approved",
        reference_number: reference_number.trim(),
        ticket_count: count,
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
      })
      .eq("id", payment_id);

    if (error) {
      // Unique constraint caught a duplicate the RPC check missed
      // (a true race condition) — this is exactly why the DB
      // constraint matters, not just the app-level check.
      return NextResponse.json(
        { error: "This reference number was just used by someone else." },
        { status: 409 },
      );
    }

    if (payment?.telegram_message_id) {
      await updateAdminTelegramStatus({
        messageId: payment.telegram_message_id,
        hasPhoto: !!payment.screenshot_url,
        customerName: payment.customer_name,
        phoneNumber: payment.phone_number,
        method: payment.method,
        status: "approved",
        referenceNumber: reference_number.trim(),
      });
    }

    if (payment?.telegram_chat_id) {
      await notifyCustomerTelegram({
        chatId: payment.telegram_chat_id,
        status: "approved",
        ticketCount: count,
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
