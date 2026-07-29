"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations, Lang, TranslationKey } from "./translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const defaultContext: LanguageContextType = {
  lang: "en",
  setLang: () => {},
  t: (key: TranslationKey) => translations.en[key] || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "am") setLangState(saved);
  }, []);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] || translations.en[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
