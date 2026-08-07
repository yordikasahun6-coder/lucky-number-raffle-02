"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function StatusCheck() {
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<
    "approved" | "pending" | "used_up" | "rejected" | "not_found" | null
  >(null);
  const { t } = useLanguage();

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!/^0[97]\d{8}$/.test(digitsOnly)) {
      setResult(null);
      return;
    }

    setChecking(true);
    setResult(null);

    const res = await fetch(
      `/api/payments/check-status?phone=${encodeURIComponent(phone.trim())}`,
    );
    const data = await res.json();
    setResult(data.status);
    setChecking(false);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#111827] mb-1">
        {t("statusTitle")}
      </h2>
      <p className="text-[#6B7280] text-sm mb-5">{t("statusDesc")}</p>

      <form onSubmit={handleCheck} className="flex gap-2 mb-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("statusPlaceholder")}
          className="flex-1 rounded-lg border border-[#D1D5DB] px-4 py-3 text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        />
        <button
          type="submit"
          disabled={checking}
          className="rounded-lg bg-[#16A34A] text-white px-5 py-3 text-sm font-medium disabled:opacity-50"
        >
          {checking ? "..." : t("checkStatusButton")}
        </button>
      </form>

      {result === "approved" && (
        <div className="rounded-lg bg-[#F0FDF4] border border-[#16A34A] p-4 text-center">
          <p className="text-[#16A34A] font-medium mb-3">
            {t("statusApproved")}
          </p>
          <a
            href={`/pick-number?phone=${encodeURIComponent(phone.trim())}`}
            className="inline-block rounded-lg bg-[#16A34A] text-white font-medium px-5 py-2.5 text-sm"
          >
            {t("continueButton")}
          </a>
        </div>
      )}

      {result === "pending" && (
        <div className="rounded-lg bg-[#FFFBEB] border border-[#FDE68A] p-4 text-center">
          <p className="text-[#92400E] text-sm">{t("statusPending")}</p>
        </div>
      )}

      {result === "used_up" && (
        <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-center">
          <p className="text-[#111827] text-sm mb-1">
            {t("statusUsedUpTitle")}
          </p>
          <p className="text-[#6B7280] text-xs">{t("statusUsedUpDesc")}</p>
        </div>
      )}

      {result === "rejected" && (
        <div className="rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] p-4 text-center">
          <p className="text-red-700 text-sm">{t("statusRejected")}</p>
        </div>
      )}

      {result === "not_found" && (
        <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-center">
          <p className="text-[#6B7280] text-sm">{t("statusNotFound")}</p>
        </div>
      )}
    </div>
  );
}
