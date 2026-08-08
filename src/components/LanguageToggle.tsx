"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Lang } from "@/lib/i18n/translations";

const options: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "am", label: "አማ", flag: "🇪🇹" },
  { code: "or", label: "AO", flag: "🇪🇹" },
];
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const activeIndex = options.findIndex((o) => o.code === lang);

  return (
    <div className="relative inline-flex items-center rounded-full border border-[#EAE1C4] bg-white/80 p-1 shrink-0">
      <div
        className="absolute top-1 bottom-1 rounded-full bg-[#0F5132] transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(activeIndex * 100) / options.length}% + 2px)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          className={`press-scale relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold [font-family:var(--font-mono)] transition-colors duration-300 ${
            lang === opt.code
              ? "text-white"
              : "text-[#0F5132] hover:text-[#E0A72E]"
          }`}
        >
          <span className="text-[10px]">{opt.flag}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
