import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyAdminTelegram } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("closes_at")
      .limit(1)
      .single();
    if (settings?.closes_at && new Date(settings.closes_at) < new Date()) {
      return NextResponse.json(
        { error: "Ticket sales have closed." },
        { status: 403 },
      );
    }

    const phone_number = formData.get("phone_number") as string;
    const customer_name = formData.get("customer_name") as string;
    const payment_account_id = formData.get("payment_account_id") as string;
    const screenshot = formData.get("screenshot") as File | null;

    if (!phone_number || !customer_name || !payment_account_id) {
      return NextResponse.json(
        { error: "Phone number, name, and payment method are required." },
        { status: 400 },
      );
    }

    const digitsOnly = phone_number.replace(/[^0-9]/g, "");
    const normalizedForCheck = digitsOnly.startsWith("251")
      ? "0" + digitsOnly.slice(3)
      : digitsOnly;
    if (!/^0[97]\d{8}$/.test(normalizedForCheck)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid 10-digit Ethiopian phone number (e.g. 0912345678).",
        },
        { status: 400 },
      );
    }

    const { data: account } = await supabaseAdmin
      .from("payment_accounts")
      .select("name")
      .eq("id", payment_account_id)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: "Invalid payment method selected." },
        { status: 400 },
      );
    }

    let screenshot_url: string | null = null;

    if (screenshot && screenshot.size > 0) {
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${phone_number.replace(/[^0-9]/g, "")}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from("payment-screenshots")
          .upload(fileName, screenshot, {
            contentType: screenshot.type,
            upsert: false,
          });

      if (uploadError) {
        return NextResponse.json(
          { error: `Screenshot upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }
      screenshot_url = uploadData.path;
    }

    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        phone_number,
        customer_name,
        method: account.name,
        payment_account_id,
        screenshot_url,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Could not save your submission. Try again." },
        { status: 500 },
      );
    }

    let screenshotBuffer: Buffer | null = null;
    if (screenshot && screenshot.size > 0) {
      screenshotBuffer = Buffer.from(await screenshot.arrayBuffer());
    }

    const telegramMessageId = await notifyAdminTelegram({
      customerName: customer_name,
      phoneNumber: phone_number,
      method: account.name,
      screenshotBuffer,
      screenshotFilename: screenshot?.name,
    });

    if (telegramMessageId) {
      await supabaseAdmin
        .from("payments")
        .update({ telegram_message_id: telegramMessageId })
        .eq("id", data.id);
    }

    return NextResponse.json({ success: true, payment: data });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
