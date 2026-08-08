export async function notifyAdminTelegram(params: {
  customerName: string;
  phoneNumber: string;
  method: string;
  screenshotBuffer?: Buffer | null;
  screenshotFilename?: string;
}): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.log("Telegram not configured — skipping notification.");
    return null;
  }

  const caption =
    `🔔 *New payment submitted*\n\n` +
    `👤 Name: ${params.customerName}\n` +
    `📱 Phone: ${params.phoneNumber}\n` +
    `💳 Method: ${params.method}\n\n` +
    `Status: ⏳ Pending review\n\n` +
    `[Open Admin Page](${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin)`;

  try {
    if (params.screenshotBuffer) {
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");
      formData.append(
        "photo",
        new Blob([new Uint8Array(params.screenshotBuffer)]),
        params.screenshotFilename || "screenshot.jpg",
      );

      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendPhoto`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      return data?.result?.message_id ? String(data.result.message_id) : null;
    } else {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text:
              caption +
              "\n\n_(no screenshot attached — check Telegram or the upload)_",
            parse_mode: "Markdown",
          }),
        },
      );
      const data = await res.json();
      return data?.result?.message_id ? String(data.result.message_id) : null;
    }
  } catch (err) {
    console.log("Telegram notify failed:", err);
    return null;
  }
}

export async function updateAdminTelegramStatus(params: {
  messageId: string;
  hasPhoto: boolean;
  customerName: string;
  phoneNumber: string;
  method: string;
  status: "approved" | "rejected";
  referenceNumber?: string | null;
  ticketCount?: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) return;

  const statusLine =
    params.status === "approved"
      ? `Status: ✅ *Approved*${params.referenceNumber ? ` (ref: ${params.referenceNumber})` : ""}`
      : `Status: ❌ *Rejected*`;

  const ticketLine =
    params.status === "approved" && params.ticketCount
      ? `\n🎟️ Tickets granted: *${params.ticketCount}*\n`
      : "";

  const newText =
    (params.status === "approved"
      ? `✅ *Payment approved*\n\n`
      : `❌ *Payment rejected*\n\n`) +
    `👤 Name: ${params.customerName}\n` +
    `📱 Phone: ${params.phoneNumber}\n` +
    `💳 Method: ${params.method}\n` +
    `${ticketLine}\n` +
    `${statusLine}`;

  try {
    const endpoint = params.hasPhoto ? "editMessageCaption" : "editMessageText";
    const bodyKey = params.hasPhoto ? "caption" : "text";

    await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: Number(params.messageId),
        [bodyKey]: newText,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.log("Telegram status update failed:", err);
  }
}
export async function notifyCustomerTelegram(params: {
  chatId: number;
  phone: string;
  status: "approved" | "rejected";
  ticketCount?: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!token) return;

  if (params.status === "approved") {
    const text =
      `🎉 *Great news! Your payment has been approved.*\n\n` +
      `You have ${params.ticketCount || 1} ticket${(params.ticketCount || 1) > 1 ? "s" : ""} ready to claim.\n\n` +
      `📌 *A few things to know:*\n` +
      `• Once you confirm a number, it's final — no changes or refunds after that.\n` +
      `• Keep this chat — you can always come back here to buy another ticket.\n` +
      `• The winning number is drawn live and announced publicly.\n\n` +
      `Tap below to pick your lucky number, or buy another ticket right here.`;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 Pick Your Lucky Number",
                  url: `${siteUrl}/pick-number?phone=${params.phone}`,
                },
              ],
              [{ text: "🎟️ Buy Another Ticket", callback_data: "buy_another" }],
            ],
          },
        }),
      });
    } catch (err) {
      console.log("notifyCustomerTelegram failed:", err);
    }
  } else {
    const text = `⚠️ We couldn't verify your payment. Please double check and resubmit, or contact us for help.`;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          text,
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔄 Try Again", callback_data: "buy_another_fresh" }],
            ],
          },
        }),
      });
    } catch (err) {
      console.log("notifyCustomerTelegram failed:", err);
    }
  }
}
export async function notifyCustomerNumberClaimed(params: {
  chatId: number;
  ticketNumber: number;
  remainingCredits: number;
  drawDateText: string;
  allNumbers: number[];
  phone: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!token) return;

  const isFinal = params.remainingCredits === 0 && params.allNumbers.length > 0;

  const numbersLine =
    isFinal && params.allNumbers.length > 1
      ? `Your Tickets: *${params.allNumbers.map((n) => `#${n}`).join(", ")}*\n`
      : `Ticket Number: *#${params.ticketNumber}*\n`;

  const text =
    `🎟️ *Your lucky number is locked in!*\n\n` +
    numbersLine +
    `Draw Date: *${params.drawDateText}*\n\n` +
    `💡 Save this message — this is your proof of your number${isFinal && params.allNumbers.length > 1 ? "s" : ""}. No need to remember it yourself, just scroll back to this chat anytime.\n\n` +
    (params.remainingCredits > 0
      ? `You still have ${params.remainingCredits} more ticket${params.remainingCredits > 1 ? "s" : ""} to claim — go back to the site to pick the rest.\n\n`
      : "") +
    `Good luck! 🍀`;

  const buttons = [
    isFinal
      ? [
          {
            text: "📥 View & Download My Tickets",
            url: `${siteUrl}/pick-number?phone=${encodeURIComponent(params.phone)}`,
          },
        ]
      : [
          {
            text: "🔗 Pick Another Number",
            url: `${siteUrl}/pick-number?phone=${encodeURIComponent(params.phone)}`,
          },
        ],
    [{ text: "🏠 Visit Homepage", url: siteUrl }],
    [{ text: "🎟️ Buy Another Ticket", callback_data: "buy_another" }],
    [
      {
        text: "💬 Contact Us",
        url: `https://t.me/${process.env.TELEGRAM_SUPPORT_USERNAME || ""}`,
      },
    ],
  ];

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons },
      }),
    });
  } catch (err) {
    console.log("notifyCustomerNumberClaimed failed:", err);
  }
}
