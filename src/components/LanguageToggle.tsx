"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-full border border-[#EAE1C4] p-0.5 text-xs [font-family:var(--font-mono)]">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full transition ${lang === "en" ? "bg-[#0F5132] text-white" : "text-[#8A9A8F]"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("am")}
        className={`px-3 py-1 rounded-full transition ${lang === "am" ? "bg-[#0F5132] text-white" : "text-[#8A9A8F]"}`}
      >
        አማ
      </button>
    </div>
  );
}
