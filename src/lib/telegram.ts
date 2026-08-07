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
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) return;

  const statusLine =
    params.status === "approved"
      ? `Status: ✅ *Approved*${params.referenceNumber ? ` (ref: ${params.referenceNumber})` : ""}`
      : `Status: ❌ *Rejected*`;

  const newText =
    (params.status === "approved"
      ? `✅ *Payment approved*\n\n`
      : `❌ *Payment rejected*\n\n`) +
    `👤 Name: ${params.customerName}\n` +
    `📱 Phone: ${params.phoneNumber}\n` +
    `💳 Method: ${params.method}\n\n` +
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
  status: "approved" | "rejected";
  ticketCount?: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const text =
    params.status === "approved"
      ? `🎉 Great news! Your payment has been approved.\n\nYou can now pick your lucky number${params.ticketCount && params.ticketCount > 1 ? `s (you have ${params.ticketCount})` : ""} on the website — go to "Check Your Status" and enter your phone number to continue.`
      : `⚠️ We couldn't verify your payment. Please double check and resubmit, or contact us for help.`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: params.chatId, text }),
    });
  } catch (err) {
    console.log("notifyCustomerTelegram failed:", err);
  }
}
