"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Account = { id: string; name: string; logo_url: string | null };

export default function BuyTicketForm({ accounts }: { accounts: Account[] }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone || !name || !accountId) {
      setError("Please fill in your phone number, name, and payment method.");
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
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-[#111827] font-semibold mb-1">
          {t("submittedTitle")}
        </p>
        <p className="text-[#6B7280] text-sm">{t("submittedDesc")}</p>
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

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          {t("screenshotLabel")}{" "}
          <span className="text-[#9CA3AF] font-normal">
            {t("screenshotOptional")}
          </span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
          className="w-full text-sm text-[#6B7280] file:mr-4 file:rounded-lg file:border-0 file:bg-[#F3F4F6] file:px-4 file:py-2 file:text-sm"
        />
        <p className="text-xs text-[#9CA3AF] mt-1.5">{t("screenshotHint")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#16A34A] text-white font-semibold py-3 disabled:opacity-50"
      >
        {submitting ? t("submitting") : t("submitButton")}
      </button>
    </form>
  );
}
