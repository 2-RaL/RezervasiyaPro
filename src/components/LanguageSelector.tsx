'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe2, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import { Language } from '../lib/translations';

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'az', label: 'AZ', flag: '🇦🇿', nativeName: 'Azərbaycan' },
  { code: 'ru', label: 'RU', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'en', label: 'EN', flag: '🇬🇧', nativeName: 'English' }
];

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Dil seçimi / Выбор языка"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
          border-slate-200 dark:border-white/10
          text-slate-700 dark:text-slate-200
          hover:bg-slate-100 dark:hover:bg-white/10
          hover:border-slate-300 dark:hover:border-white/20
          shadow-sm active:scale-95`}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentOption.label}>
          {currentOption.flag}
        </span>
        <span className="font-bold tracking-wider">{currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
          role="menu"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Dil / Язык / Language
          </div>
          {LANGUAGES.map((option) => {
            const isSelected = option.code === lang;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setLang(option.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base" role="img" aria-label={option.label}>
                    {option.flag}
                  </span>
                  <span>{option.nativeName}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
