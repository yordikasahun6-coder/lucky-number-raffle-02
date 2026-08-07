"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const items = [
    { q: t("faqQ1"), a: t("faqA1") },
    { q: t("faqQ2"), a: t("faqA2") },
    { q: t("faqQ3"), a: t("faqA3") },
    { q: t("faqQ4"), a: t("faqA4") },
    { q: t("faqQ5"), a: t("faqA5") },
    { q: t("faqQ6"), a: t("faqA6") },
  ];

  return (
    <div className="ticket-stub hover-lift px-6 py-6">
      <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
        {t("faqLabel")}
      </p>
      <h2 className="[font-family:var(--font-fraunces)] text-2xl font-bold text-[#14231C] mb-5">
        {t("faqTitle")}
      </h2>

      <div className="divide-y divide-[#F0E9D0]">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="press-scale w-full flex items-center justify-between gap-3 py-4 text-left"
              >
                <span className="font-medium text-[#14231C] text-sm">
                  {item.q}
                </span>
                <span
                  className={`text-[#E0A72E] text-lg shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>

              <div className={`expand-panel ${open ? "open" : ""}`}>
                <div>
                  <p className="text-[#6B8A78] text-sm pb-4 pr-8">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
