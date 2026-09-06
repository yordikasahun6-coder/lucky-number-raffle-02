import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function sendReminder(
  chatId: number,
  ticketCount: number,
  siteUrl: string,
  phone: string,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const text =
    `⏳ *Friendly reminder!*\n\n` +
    `You still have ${ticketCount} unclaimed lucky ticket${ticketCount !== 1 ? "s" : ""} waiting for you. ` +
    `Don't forget to pick your number before the draw!\n\n` +
    `Tap below to pick it now.`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 Pick Your Lucky Number",
                  url: `${siteUrl}/pick-number?phone=${encodeURIComponent(phone)}`,
                },
              ],
            ],
          },
        }),
      },
    );
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Vercel Cron calls this with a special header — verify it's really
  // Vercel's scheduler and not a random public hit on this URL.
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data: approved } = await supabaseAdmin
    .from("payments")
    .select(
      "id, phone_number, telegram_chat_id, ticket_count, reviewed_at, last_reminder_sent_at",
    )
    .eq("status", "approved")
    .not("telegram_chat_id", "is", null)
    .lte("reviewed_at", twentyFourHoursAgo.toISOString());

  if (!approved || approved.length === 0) {
    return NextResponse.json({ checked: 0, reminded: 0 });
  }

  let reminded = 0;

  for (const payment of approved) {
    // Only remind once every 24 hours per payment, even if this cron
    // runs more frequently or the customer stays unclaimed for weeks
    if (payment.last_reminder_sent_at) {
      const hoursSinceLastReminder =
        (Date.now() - new Date(payment.last_reminder_sent_at).getTime()) /
        3600000;
      if (hoursSinceLastReminder < 24) continue;
    }

    const { count: claimed } = await supabaseAdmin
      .from("numbers")
      .select("*", { count: "exact", head: true })
      .eq("payment_id", payment.id);

    const unclaimedCount = payment.ticket_count - (claimed || 0);
    if (unclaimedCount <= 0) continue; // fully claimed, nothing to remind about

    const sent = await sendReminder(
      payment.telegram_chat_id,
      unclaimedCount,
      siteUrl,
      payment.phone_number,
    );

    if (sent) {
      await supabaseAdmin
        .from("payments")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("id", payment.id);
      reminded++;
    }
  }

  return NextResponse.json({ checked: approved.length, reminded });
}
