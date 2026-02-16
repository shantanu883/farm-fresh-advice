import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "@/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("selectedLanguage");
    return (stored as Language) || "en";
  });

  // Ensure all translation objects contain the same keys as English.
  // Missing keys will be filled with the English value so UI switches consistently.
  useEffect(() => {
    try {
      const enKeys = Object.keys(translations.en) as TranslationKey[];
      (Object.keys(translations) as Language[]).forEach((lang) => {
        if (lang === 'en') return;
        const target = (translations as any)[lang] as Record<string, string>;
        const missing: string[] = [];
        enKeys.forEach((k) => {
          if (!(k in target)) {
            // record missing and fill with English fallback
            missing.push(k as string);
            target[k] = (translations.en as any)[k];
          }
        });

        if (missing.length > 0) {
          console.info(`i18n: Filled ${missing.length} missing keys for '${lang}'. Keys:`, missing);
        }
      });
    } catch (e) {
      // silent
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    // Update document lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
