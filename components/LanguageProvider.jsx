"use client";

import {
  DEFAULT_LANGUAGE,
  dictionaries,
  getDictionary,
  languages,
} from "@/lib/i18n/dictionaries";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

const STORAGE_KEY = "sndct-language";

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && dictionaries[stored]) return stored;
    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    if (browserLang && dictionaries[browserLang]) return browserLang;
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, language);
    const root = document.documentElement;
    const body = document.body;
    const isRtl = language === "he";

    root.lang = language;
    root.dir = isRtl ? "rtl" : "ltr";
    root.classList.toggle("rtl", isRtl);

    if (body) {
      body.lang = language;
      body.dir = root.dir;
      body.classList.toggle("rtl", isRtl);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useDictionary() {
  const { language } = useLanguage();
  return getDictionary(language);
}

export const supportedLanguages = languages;
