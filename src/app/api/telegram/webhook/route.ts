import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyAdminTelegram } from "@/lib/telegram";

async function sendBotMessage(
  chatId: number,
  text: string,
  keyboard?: { text: string; data: string }[],
) {
  const body: any = { chat_id: chatId, text };
  if (keyboard) {
    body.reply_markup = {
      inline_keyboard: keyboard.map((k) => [
        { text: k.text, callback_data: k.data },
      ]),
    };
  }
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

async function answerCallback(callbackQueryId: string) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId }),
    },
  );
}

async function startSession(chatId: number) {
  await supabaseAdmin
    .from("telegram_sessions")
    .upsert({
      chat_id: chatId,
      step: "name",
      name: null,
      phone: null,
      method_id: null,
      method_name: null,
      updated_at: new Date().toISOString(),
    });
  await sendBotMessage(
    chatId,
    "👋 Let's get your ticket submitted!\n\nFirst — what's your full name?",
  );
}

export async function POST(request: NextRequest) {
  const update = await request.json();

  // Handle payment-method button taps
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    await answerCallback(cb.id);

    const [methodId, methodName] = cb.data.split("|");

    await supabaseAdmin
      .from("telegram_sessions")
      .update({
        step: "photo",
        method_id: methodId === "none" ? null : methodId,
        method_name: methodName,
        updated_at: new Date().toISOString(),
      })
      .eq("chat_id", chatId);

    await sendBotMessage(
      chatId,
      `✅ Got it — ${methodName}.\n\nLast step: send a photo of your payment screenshot.`,
    );
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text: string = message.text || "";
  const photo = message.photo;

  if (text.trim() === "/start") {
    await startSession(chatId);
    return NextResponse.json({ ok: true });
  }

  const { data: session } = await supabaseAdmin
    .from("telegram_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (!session) {
    await startSession(chatId);
    return NextResponse.json({ ok: true });
  }

  if (session.step === "name") {
    if (!text.trim()) {
      await sendBotMessage(chatId, "Please type your full name as text.");
      return NextResponse.json({ ok: true });
    }
    await supabaseAdmin
      .from("telegram_sessions")
      .update({
        name: text.trim(),
        step: "phone",
        updated_at: new Date().toISOString(),
      })
      .eq("chat_id", chatId);
    await sendBotMessage(
      chatId,
      `Thanks, ${text.trim()}!\n\nNow, what's your phone number? (e.g. 0912345678)`,
    );
    return NextResponse.json({ ok: true });
  }

  if (session.step === "phone") {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    if (!/^0[97]\d{8}$/.test(digitsOnly)) {
      await sendBotMessage(
        chatId,
        "That doesn't look like a valid 10-digit phone number. Please try again (e.g. 0912345678).",
      );
      return NextResponse.json({ ok: true });
    }

    const { data: accounts } = await supabaseAdmin
      .from("payment_accounts")
      .select("id, name")
      .eq("active", true);
    await supabaseAdmin
      .from("telegram_sessions")
      .update({
        phone: digitsOnly,
        step: "method",
        updated_at: new Date().toISOString(),
      })
      .eq("chat_id", chatId);

    if (accounts && accounts.length > 0) {
      const keyboard = accounts.map((a) => ({
        text: a.name,
        data: `${a.id}|${a.name}`,
      }));
      await sendBotMessage(
        chatId,
        "Which payment method did you use?",
        keyboard,
      );
    } else {
      await supabaseAdmin
        .from("telegram_sessions")
        .update({ step: "photo", method_name: "Telegram" })
        .eq("chat_id", chatId);
      await sendBotMessage(
        chatId,
        "Now send a photo of your payment screenshot.",
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (session.step === "photo") {
    if (!photo || photo.length === 0) {
      await sendBotMessage(
        chatId,
        "Please send a photo of your payment screenshot to finish.",
      );
      return NextResponse.json({ ok: true });
    }

    const largestPhoto = photo[photo.length - 1];
    const fileRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${largestPhoto.file_id}`,
    );
    const fileData = await fileRes.json();
    const filePath = fileData?.result?.file_path;

    let screenshot_url: string | null = null;
    let imageBuffer: Buffer | null = null;

    if (filePath) {
      const imageRes = await fetch(
        `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`,
      );
      imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const fileName = `${session.phone}-${Date.now()}.jpg`;

      const { data: uploadData } = await supabaseAdmin.storage
        .from("payment-screenshots")
        .upload(fileName, imageBuffer, { contentType: "image/jpeg" });
      if (uploadData) screenshot_url = uploadData.path;
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .insert({
        phone_number: session.phone,
        customer_name: session.name,
        method: session.method_name || "Telegram",
        payment_account_id: session.method_id,
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
        screenshotBuffer: imageBuffer,
        screenshotFilename: "screenshot.jpg",
      });

      if (telegramMessageId) {
        await supabaseAdmin
          .from("payments")
          .update({ telegram_message_id: telegramMessageId })
          .eq("id", payment.id);
      }
    }

    await supabaseAdmin
      .from("telegram_sessions")
      .delete()
      .eq("chat_id", chatId);

    await sendBotMessage(
      chatId,
      "✅ Got it! Your submission has been received and is pending review.\n\nWe'll notify you here once it's approved.",
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
