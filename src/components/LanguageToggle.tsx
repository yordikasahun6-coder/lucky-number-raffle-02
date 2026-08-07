"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const getNextLang = () => {
    const languages = ["en", "am", "or"];
    const currentIndex = languages.indexOf(lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex] as "en" | "am" | "or";
  };

  const getDisplay = () => {
    switch (lang) {
      case "en":
        return { flag: "🇬🇧", label: "EN" };
      case "am":
        return { flag: "🇪🇹", label: "አማ" };
      case "or":
        return { flag: "🌍", label: "OR" };
      default:
        return { flag: "🌐", label: "EN" };
    }
  };

  const current = getDisplay();

  return (
    <button
      onClick={() => setLang(getNextLang())}
      className="press-scale flex items-center gap-1.5 rounded-full border border-[#EAE1C4] bg-white/80 px-3 py-2 text-xs font-bold [font-family:var(--font-mono)] text-[#0F5132] hover:border-[#0F5132] transition-colors shrink-0"
    >
      <span>{current.flag}</span>
      <span>{current.label}</span>
    </button>
  );
}
