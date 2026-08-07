"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ScreenshotUpload from "./ScreenshotUpload";

type Account = { id: string; name: string; logo_url: string | null };

export default function BuyTicketForm({
  accounts,
  telegramUsername,
  botUsername,
}: {
  accounts: Account[];
  telegramUsername: string | null;
  botUsername: string | null;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const selectedAccount = accounts.find((a) => a.id === accountId);

  function buildTelegramLink(): string {
    const methodText = selectedAccount ? selectedAccount.name : "_____";
    const nameText = name.trim() || "_____";
    const phoneText = phone.trim() || "_____";

    const template = `Name: ${nameText}\nPhone: ${phoneText}\nPayment method: ${methodText}\n\n[Attach your payment screenshot below]`;

    return `https://t.me/${botUsername}?text=${encodeURIComponent(template)}`;
  }

  function resetForNewSubmission() {
    setPhone("");
    setName("");
    setAccountId("");
    setScreenshot(null);
    setError("");
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone || !name || !accountId) {
      setError("Please fill in your phone number, name, and payment method.");
      return;
    }

    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!/^0[97]\d{8}$/.test(digitsOnly)) {
      setError(
        t("invalidPhoneError") ||
          "Enter a valid 10-digit phone number (e.g. 0912345678).",
      );
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("phone_number", phone);
    formData.append("customer_name", name);
    formData.append("payment_account_id", accountId);
    if (screenshot) formData.append("screenshot", screenshot);

    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {["🪙", "🍀", "✨", "🪙", "✨"].map((emoji, i) => (
            <span
              key={i}
              className="ambient-item absolute text-xl"
              style={{
                top: `${10 + i * 15}%`,
                left: `${10 + i * 18}%`,
                animationDuration: `${5 + i}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative z-10">
          <div className="check-circle w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-lg shadow-[#16A34A]/30">
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
              <path
                className="check-mark"
                d="M10 21 L17 28 L30 13"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="content-reveal" style={{ animationDelay: "0.5s" }}>
            <p className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#111827] mb-1">
              {t("submittedTitle")}
            </p>
            <p className="text-[#6B7280] text-sm max-w-xs mx-auto mb-6">
              {t("submittedDesc")}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-semibold px-4 py-2 mb-6">
              📱{" "}
              {t("checkStatusHint") ||
                'Use "Check Your Status" below anytime to see your approval'}
            </div>

            <div>
              <button
                onClick={resetForNewSubmission}
                className="press-scale rounded-lg bg-[#16A34A] text-white font-semibold px-6 py-3 hover:bg-[#15803D] hover:shadow-lg hover:shadow-[#16A34A]/20 transition-all"
              >
                🎟️ {t("submitAnotherButton") || "Submit Another Ticket"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          {t("phoneLabel")}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phonePlaceholder")}
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          {t("nameLabel")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-3 text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          {t("paymentMethodLabel")}
        </label>
        {accounts.length === 0 ? (
          <p className="text-[#9CA3AF] text-sm">{t("noPaymentMethods")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {accounts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccountId(a.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  accountId === a.id
                    ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]"
                    : "border-[#D1D5DB] text-[#374151]"
                }`}
              >
                {a.logo_url && (
                  <img
                    src={a.logo_url}
                    alt={a.name}
                    className="w-5 h-5 object-contain"
                  />
                )}
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <ScreenshotUpload file={screenshot} onChange={setScreenshot} />

      {botUsername && (
        <div>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wide">
              {t("orLabel") || "Or"}
            </span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <div className="rounded-xl border border-[#BFE3F5] bg-[#F0F9FF] px-4 py-3">
            <p className="text-[#0C4A6E] text-xs font-semibold mb-1">
              {t("telegramAltTitle") ||
                "Can't upload here? Send it on Telegram"}
            </p>
            <p className="text-[#0C4A6E]/70 text-[11px] mb-3">
              {t("telegramAltDesc") ||
                "Fill in your details above first — we'll pre-fill the message for you."}
            </p>

            <a
              href={buildTelegramLink()}
              target="_blank"
              rel="noreferrer"
              className="press-scale inline-flex items-center gap-2 rounded-lg bg-[#229ED9] text-white text-xs font-semibold px-4 py-2.5 hover:bg-[#1B8BC0] transition-colors"
            >
              ✈️ {t("telegramButton") || "Open Telegram with details filled in"}
            </a>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="press-scale w-full rounded-lg bg-[#16A34A] text-white font-semibold py-3 disabled:opacity-50 hover:bg-[#15803D] hover:shadow-lg hover:shadow-[#16A34A]/20 transition-all"
      >
        {submitting ? t("submitting") : t("submitButton")}
      </button>
    </form>
  );
}
