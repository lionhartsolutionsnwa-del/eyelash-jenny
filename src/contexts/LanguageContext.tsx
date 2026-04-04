'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

type Lang = 'en' | 'zh';

interface LangContextValue {
  lang: Lang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as Lang | null;
    if (saved === 'en' || saved === 'zh') {
      setLang(saved);
      document.documentElement.dataset.lang = saved;
    }
  }, []);

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    localStorage.setItem('admin_lang', next);
    document.documentElement.dataset.lang = next;
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
