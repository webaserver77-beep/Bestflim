import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { getTranslation, translations } from '../data/translations';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  hasChosenLang: boolean;
  confirmLanguageChoice: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('rw'); // Default Kinyarwanda
  const [hasChosenLang, setHasChosenLang] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('rebamovie_lang') as Language | null;
    const hasChosen = localStorage.getItem('rebamovie_lang_chosen');
    if (savedLang === 'rw' || savedLang === 'en') {
      setLangState(savedLang);
    }
    if (hasChosen === 'true') {
      setHasChosenLang(true);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('rebamovie_lang', newLang);
  };

  const confirmLanguageChoice = (chosenLang: Language) => {
    setLanguage(chosenLang);
    setHasChosenLang(true);
    localStorage.setItem('rebamovie_lang_chosen', 'true');
  };

  const t = (key: keyof typeof translations.en): string => {
    return getTranslation(lang, key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, hasChosenLang, confirmLanguageChoice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
