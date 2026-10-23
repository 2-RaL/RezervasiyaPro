'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  TranslationDictionary,
  getTranslation,
  formatDurationByLang,
  getLocalizedServiceName,
  getLocalizedCategoryName
} from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof TranslationDictionary) => string;
  formatDuration: (mins: number) => string;
  getServiceName: (service: { nameAz: string; nameRu?: string; nameEn?: string }) => string;
  getCategoryName: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'az',
  setLang: () => {},
  t: (key) => getTranslation(key, 'az'),
  formatDuration: (mins) => formatDurationByLang(mins, 'az'),
  getServiceName: (service) => getLocalizedServiceName(service, 'az'),
  getCategoryName: (category) => getLocalizedCategoryName(category, 'az'),
});

const STORAGE_KEY = 'rezervasiya_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'az' || saved === 'ru' || saved === 'en')) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch (_) {}
    setMounted(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newLang = e.newValue as Language;
        if (newLang === 'az' || newLang === 'ru' || newLang === 'en') {
          setLangState(newLang);
          document.documentElement.lang = newLang;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      // Dispatch custom event for immediate same-window synchronization
      window.dispatchEvent(new CustomEvent('language_change', { detail: newLang }));
    } catch (_) {}
  };

  useEffect(() => {
    const handleCustomChange = (e: any) => {
      if (e.detail && (e.detail === 'az' || e.detail === 'ru' || e.detail === 'en')) {
        setLangState(e.detail);
      }
    };
    window.addEventListener('language_change', handleCustomChange);
    return () => window.removeEventListener('language_change', handleCustomChange);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: (key) => getTranslation(key, lang),
        formatDuration: (mins) => formatDurationByLang(mins, lang),
        getServiceName: (service) => getLocalizedServiceName(service, lang),
        getCategoryName: (category) => getLocalizedCategoryName(category, lang),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
