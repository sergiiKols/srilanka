import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'en' | 'ru'>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as 'en' | 'ru' | null;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ru' : 'en';
    setLang(newLang);
    localStorage.setItem('admin_lang', newLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
    window.location.reload(); // Reload to apply translations
  };

  return (
    <button onClick={toggleLang} className="lang-switcher">
      {lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
      <style jsx>{`
        .lang-switcher {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lang-switcher:hover {
          border-color: #3b82f6;
          background: #f9fafb;
        }
      `}</style>
    </button>
  );
}

export function useLang() {
  const [lang, setLang] = useState<'en' | 'ru'>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as 'en' | 'ru' | null;
    if (saved) setLang(saved);

    const handleLangChange = (e: CustomEvent) => {
      setLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener);
  }, []);

  return lang;
}
