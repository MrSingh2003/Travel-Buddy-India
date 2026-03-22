// src/components/language-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { translations, type LanguageCode } from '@/lib/translations';

export const languages = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
};

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLanguage = window.localStorage.getItem('travel-buddy-language');
    if (savedLanguage && savedLanguage in languages) {
      return savedLanguage as LanguageCode;
    }

    return 'en';
  });

  const t = useMemo(() => (key: string, params?: Record<string, string | number>): string => {
    // Attempt to get the translation for the current language
    let translation = get(translations[language], key);

    // If not found, fall back to English
    if (!translation) {
      translation = get(translations.en, key);
    }

    const baseText = translation || key;

    if (!params) {
      return baseText;
    }

    return Object.entries(params).reduce((output, [token, value]) => {
      return output.replace(new RegExp(`\\{${token}\\}`, 'g'), String(value));
    }, baseText);
  }, [language]);

  const value = {
    language,
    setLanguage: (lang: LanguageCode) => setLanguage(lang),
    t,
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('travel-buddy-language', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
