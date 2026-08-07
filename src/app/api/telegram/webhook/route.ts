import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyAdminTelegram } from "@/lib/telegram";

function parseField(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*(.+)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

export async function POST(request: NextRequest) {
  const update = await request.json();

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text: string = message.caption || message.text || "";
  const photo = message.photo;

  // First-time users tapping "Start" only send /start — Telegram drops
  // any pre-filled text for brand-new conversations. Give them clear
  // instructions instead of silently doing nothing.
  if (text.trim() === "/start" || text.trim() === "") {
    await sendBotReply(
      chatId,
      `👋 Hi! To submit your payment, send ONE message that includes a photo of your payment screenshot with this caption:\n\n` +
        `Name: [your full name]\n` +
        `Phone: [your phone number]\n` +
        `Payment method: [e.g. CBE, Telebirr]\n\n` +
        `📌 Tip: attach the photo first, then type the caption before sending — that way it all arrives together.`,
    );
    return NextResponse.json({ ok: true });
  }

  // Ignore messages that don't look like our template at all
  if (!text.includes("Name:") && !text.includes("Phone:")) {
    await sendBotReply(
      chatId,
      `⚠️ I couldn't find your name and phone number in that message. Please send your payment screenshot with a caption like:\n\n` +
        `Name: [your full name]\n` +
        `Phone: [your phone number]\n` +
        `Payment method: [e.g. CBE, Telebirr]`,
    );
    return NextResponse.json({ ok: true });
  }

  if (!photo) {
    await sendBotReply(
      chatId,
      `📷 I got your details, but no photo came with it. Please resend with your payment screenshot attached and the same caption.`,
    );
    return NextResponse.json({ ok: true });
  }

  const nameRaw = parseField(text, "Name");
  const phoneRaw = parseField(text, "Phone");
  const methodName = parseField(text, "Payment method");

  const digitsOnly = phoneRaw.replace(/[^0-9]/g, "");
  const validPhone = /^0[97]\d{8}$/.test(digitsOnly);

  if (!nameRaw || nameRaw === "_____" || !validPhone) {
    await sendBotReply(
      chatId,
      "⚠️ I couldn't read your name or phone number clearly. Please use the 'Send on Telegram' button from the website so the details are filled in correctly, then attach your screenshot.",
    );
    return NextResponse.json({ ok: true });
  }

  // Try to match the typed method name to a real payment_accounts row
  const { data: accounts } = await supabaseAdmin
    .from("payment_accounts")
    .select("id, name");
  const matchedAccount = accounts?.find(
    (a) => a.name.toLowerCase() === methodName.toLowerCase(),
  );

  let screenshot_url: string | null = null;

  if (photo && photo.length > 0) {
    const largestPhoto = photo[photo.length - 1];
    const fileRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${largestPhoto.file_id}`,
    );
    const fileData = await fileRes.json();
    const filePath = fileData?.result?.file_path;

    if (filePath) {
      const imageRes = await fetch(
        `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`,
      );
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const fileName = `${digitsOnly}-${Date.now()}.jpg`;

      const { data: uploadData } = await supabaseAdmin.storage
        .from("payment-screenshots")
        .upload(fileName, imageBuffer, { contentType: "image/jpeg" });

      if (uploadData) screenshot_url = uploadData.path;
    }
  }

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .insert({
      phone_number: digitsOnly,
      customer_name: nameRaw,
      method: matchedAccount?.name || methodName || "Telegram",
      payment_account_id: matchedAccount?.id || null,
      screenshot_url,
      status: "pending",
    })
    .select()
    .single();

  if (payment) {
    const telegramMessageId = await notifyAdminTelegram({
      customerName: payment.customer_name,
      phoneNumber: payment.phone_number,
      method: payment.method,
      screenshotBuffer: null, // already have the photo in the original message
    });

    if (telegramMessageId) {
      await supabaseAdmin
        .from("payments")
        .update({ telegram_message_id: telegramMessageId })
        .eq("id", payment.id);
    }

    await sendBotReply(
      chatId,
      `✅ Got it! Your submission has been received and is pending review.\n\nWe'll notify you once it's approved.`,
    );
  }

  return NextResponse.json({ ok: true });
}

async function sendBotReply(chatId: number, text: string) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );
}
