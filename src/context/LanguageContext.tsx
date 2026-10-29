import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/erp';
import { translations, getTranslation } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  userNativeLanguage: Language;
  setUserNativeLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
  translateText: (text: string, targetLang?: Language, sourceLang?: Language) => Promise<string>;
  translateCache: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sas4erp_lang') as Language) || 'en';
  });

  const [userNativeLanguage, setUserNativeLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sas4erp_native_lang') as Language) || 'ku';
  });

  const [translateCache, setTranslateCache] = useState<Record<string, string>>({});

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sas4erp_lang', lang);
  };

  const setUserNativeLanguage = (lang: Language) => {
    setUserNativeLanguageState(lang);
    localStorage.setItem('sas4erp_native_lang', lang);
  };

  const isRtl = language === 'ku' || language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const translateText = async (text: string, targetLang: Language = language, sourceLang?: Language): Promise<string> => {
    if (!text || text.trim() === '') return text;
    const cacheKey = `${sourceLang || 'auto'}_${targetLang}_${text}`;
    if (translateCache[cacheKey]) {
      return translateCache[cacheKey];
    }

    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fromLang: sourceLang,
          toLang: targetLang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          setTranslateCache((prev) => ({ ...prev, [cacheKey]: data.translatedText }));
          return data.translatedText;
        }
      }
    } catch (err) {
      console.warn('API Translation request fallback', err);
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        userNativeLanguage,
        setUserNativeLanguage,
        t,
        isRtl,
        translateText,
        translateCache,
      }}
    >
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
