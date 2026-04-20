'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations, { Lang, TranslationKey } from '@/lib/i18n/translations';

interface LanguageContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>('en');

    useEffect(() => {
        const stored = localStorage.getItem('nexfolio_lang');
        if (stored === 'sk' || stored === 'en') setLangState(stored);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem('nexfolio_lang', l);
    };

    const t = (key: TranslationKey): string => translations[lang][key];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
}
