"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminDictionaries, ADMIN_DEFAULT_LOCALE } from "@/lib/admin/i18n";

const STORAGE_KEY = "admin-lang";

const AdminLocaleContext = createContext({
  language: ADMIN_DEFAULT_LOCALE,
  setLanguage: () => {},
  dict: adminDictionaries[ADMIN_DEFAULT_LOCALE],
});

export function AdminLocaleProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return ADMIN_DEFAULT_LOCALE;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && adminDictionaries[stored]) return stored;
    return ADMIN_DEFAULT_LOCALE;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dict: adminDictionaries[language] || adminDictionaries[ADMIN_DEFAULT_LOCALE],
    }),
    [language]
  );

  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

export function useAdminDict() {
  return useAdminLocale().dict;
}
