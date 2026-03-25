"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { get } from "lodash";
import { translations, type LanguageCode } from "@/lib/translations";

export function repairText(input: string): string {
  if (!input || (!input.includes("à") && !input.includes("Ã") && !input.includes("Â"))) {
    return input;
  }

  try {
    const bytes = Uint8Array.from(input, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8").decode(bytes);
    return decoded.includes("�") ? input : decoded;
  } catch {
    return input;
  }
}

export const languages = {
  en: "English",
  hi: repairText("à¤¹à¤¿à¤¨à¥à¤¦à¥€"),
  bn: repairText("à¦¬à¦¾à¦‚à¦²à¦¾"),
  gu: repairText("àª—à«àªœàª°àª¾àª¤à«€"),
  kn: repairText("à²•à²¨à³à²¨à²¡"),
  ml: repairText("à´®à´²à´¯à´¾à´³à´‚"),
  mr: repairText("à¤®à¤°à¤¾à¤ à¥€"),
  pa: repairText("à¨ªà©°à¨œà¨¾à¨¬à©€"),
  ta: repairText("à®¤à®®à®¿à®´à¯"),
  te: repairText("à°¤à±†à°²à±à°—à±"),
};

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLanguage = window.localStorage.getItem("travel-buddy-language");
    if (savedLanguage && savedLanguage in languages) {
      return savedLanguage as LanguageCode;
    }

    return "en";
  });

  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>): string => {
      let translation = get(translations[language], key);

      if (!translation) {
        translation = get(translations.en, key);
      }

      const baseText = repairText(translation || key);

      if (!params) {
        return baseText;
      }

      return Object.entries(params).reduce((output, [token, value]) => {
        return output.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
      }, baseText);
    },
    [language]
  );

  const value = {
    language,
    setLanguage: (lang: LanguageCode) => setLanguage(lang),
    t,
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("travel-buddy-language", language);
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
