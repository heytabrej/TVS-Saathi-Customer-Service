'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'hi' | 'ta' | 'te';

interface LanguageContextValue {
  language: Lang;
  setLanguage: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('saathi_language');
    if (stored) setLanguage(stored as Lang);
  }, []);

  const update = (l: Lang) => {
    setLanguage(l);
    localStorage.setItem('saathi_language', l);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: update }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};