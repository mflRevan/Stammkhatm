import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '../i18n/en';
import { de } from '../i18n/de';
import type { Translations } from '../i18n/en';

type Lang = 'en' | 'de';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'de',
  setLang: () => {},
  t: de,
});

const translations: Record<Lang, Translations> = { en, de };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('stammkhatm-lang');
    return stored === 'en' || stored === 'de' ? stored : 'de';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('stammkhatm-lang', l);
  };

  const t = translations[lang];

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
