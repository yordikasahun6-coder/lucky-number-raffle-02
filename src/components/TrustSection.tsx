"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TrustSection() {
  const { t } = useLanguage();

  const cards = [
    { icon: "📡", text: t("trustCardDraw") },
    { icon: "🔢", text: t("trustCardUnique") },
    { icon: "📩", text: t("trustCardSms") },
    { icon: "🔒", text: t("trustCardSecure") },
    { icon: "🛡️", text: t("trustCardNoModify") },
  ];

  return (
    <div>
      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1 px-1">
        {t("trustLabel") || "Trust & transparency"}
      </p>
      <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-5 px-1">
        {t("trustTitle") || "How we keep this fair"}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <div
            key={i}
            className="hover-lift rounded-xl bg-white border border-[#EAE1C4] px-4 py-4 flex items-center gap-3"
          >
            <span className="w-9 h-9 rounded-full bg-[#E7F5EC] flex items-center justify-center text-base shrink-0">
              {c.icon}
            </span>
            <span className="text-[#14231C] text-sm font-medium leading-tight">
              {c.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
