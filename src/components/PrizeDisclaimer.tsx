"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrizeDisclaimer({ text }: { text: string | null }) {
  const { t } = useLanguage();

  if (!text) return null;

  return (
    <div className="rounded-xl bg-[#FFF7E8] border border-[#F0D68A] px-5 py-4 flex items-start gap-3">
      <span className="text-[#B9861F] text-lg shrink-0">⚠</span>
      <div>
        <p className="text-[#8A6D1F] text-xs font-semibold uppercase tracking-wide mb-1">
          {t("disclaimerLabel") || "Important"}
        </p>
        <p className="text-[#6B5A20] text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
