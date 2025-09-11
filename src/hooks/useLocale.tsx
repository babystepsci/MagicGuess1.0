import { useState, useEffect, createContext, useContext } from 'react';
import { locales, defaultLocale, type LocaleKey, type Translations } from '../config/locales';

interface LocaleContextType {
  locale: LocaleKey;
  t: Translations;
  setLocale: (locale: LocaleKey) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleKey>(defaultLocale);

  useEffect(() => {
    // Charger la langue sauvegardée ou utiliser le français par défaut
    const savedLocale = localStorage.getItem('magicguess-locale') as LocaleKey;
    if (savedLocale && locales[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: LocaleKey) => {
    setLocaleState(newLocale);
    localStorage.setItem('magicguess-locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{
      locale,
      t: locales[locale],
      setLocale,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}