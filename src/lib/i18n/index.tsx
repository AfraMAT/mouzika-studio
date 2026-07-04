'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, RTL_LOCALES, type Dictionary, type Locale } from './dictionaries';

export { LOCALES, LOCALE_LABELS, type Locale, type Dictionary } from './dictionaries';

const STORAGE_KEY = 'mz_lang';

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function readStored(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'fr' || v === 'ar') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start with 'en' to match server render, then hydrate from storage.
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = readStored();
    if (stored !== 'en') setLocaleState(stored);
  }, []);

  const applyDocAttrs = useCallback((l: Locale) => {
    if (typeof document === 'undefined') return;
    const isRTL = RTL_LOCALES.includes(l);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', l);
  }, []);

  useEffect(() => {
    applyDocAttrs(locale);
  }, [locale, applyDocAttrs]);

  const setLocale = useCallback(
    (l: Locale) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
      } catch {
        /* ignore */
      }
      setLocaleState(l);
    },
    []
  );

  const value = useMemo<I18nValue>(() => {
    const isRTL = RTL_LOCALES.includes(locale);
    return {
      locale,
      t: dictionaries[locale],
      dir: isRTL ? 'rtl' : 'ltr',
      isRTL,
      setLocale,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Convenience: just the translation dictionary. */
export function useT(): Dictionary {
  return useI18n().t;
}
