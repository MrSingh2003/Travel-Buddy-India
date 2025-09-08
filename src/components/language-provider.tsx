// src/components/language-provider.tsx
"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
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
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = useMemo(() => (key: string): string => {
    // Attempt to get the translation for the current language
    let translation = get(translations[language], key);

    // If not found, fall back to English
    if (!translation) {
      translation = get(translations.en, key);
    }
    
    // If still not found, return the key itself as a fallback
    return translation || key;
  }, [language]);

  const value = {
    language,
    setLanguage: (lang) => setLanguage(lang as LanguageCode),
    t,
  };

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
