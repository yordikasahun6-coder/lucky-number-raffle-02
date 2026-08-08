"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import AnimatedCheck from "./AnimatedCheck";

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
          className="press-scale rounded-lg bg-[#16A34A] text-white px-5 py-3 text-sm font-medium disabled:opacity-50 hover:bg-[#15803D] transition-colors"
        >
          {checking ? "..." : t("checkStatusButton")}
        </button>
      </form>

      {result === "approved" && (
        <div className="claim-burst relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#E7F5EC] border-2 border-[#16A34A] p-6 text-center">
          <div className="absolute inset-0 pointer-events-none">
            {["✨", "✨", "✨"].map((s, i) => (
              <span
                key={i}
                className="ambient-item absolute text-sm"
                style={{
                  top: `${15 + i * 25}%`,
                  left: `${10 + i * 35}%`,
                  animationDuration: `${5 + i}s`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="relative z-10">
            <div className="scale-75 -mb-2">
              <AnimatedCheck />
            </div>

            <div className="content-reveal" style={{ animationDelay: "0.5s" }}>
              <p className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#0F5132] mb-1">
                {t("statusApprovedTitle") || "You're Approved!"}
              </p>
              <p className="text-[#4A5A50] text-sm mb-5">
                {t("statusApprovedDesc") ||
                  "Your lucky number is waiting for you."}
              </p>

              <a
                href={`/pick-number?phone=${encodeURIComponent(phone.trim())}`}
                className="press-scale inline-flex items-center gap-2 rounded-xl bg-[#0F5132] text-white font-semibold px-6 py-3.5 hover:bg-[#0C4028] hover:shadow-lg hover:shadow-[#0F5132]/20 transition-all"
              >
                🍀 {t("continueButton")}
              </a>
            </div>
          </div>
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
