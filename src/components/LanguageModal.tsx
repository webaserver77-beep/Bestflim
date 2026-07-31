import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, Sparkles } from 'lucide-react';

export const LanguageModal: React.FC = () => {
  const { hasChosenLang, lang, confirmLanguageChoice, t } = useLanguage();

  if (hasChosenLang) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        id="language-modal-card"
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow background effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white">
                Best Films
              </span>
              <span className="text-xs text-zinc-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Ururimi / Language</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              {t('langModalTitle')}
            </h2>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          {t('langModalSubtitle')}
        </p>

        <div className="space-y-4 mb-8">
          {/* Kinyarwanda option */}
          <button
            id="select-kinyarwanda-btn"
            onClick={() => confirmLanguageChoice('rw')}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start space-x-4 ${
              lang === 'rw'
                ? 'bg-red-950/40 border-red-600 ring-2 ring-red-600/50 text-white'
                : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200'
            }`}
          >
            <span className="text-3xl mt-1">🇷🇼</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-white">Kinyarwanda</span>
                {lang === 'rw' && <Check className="w-5 h-5 text-red-500" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                {t('selectKinyarwandaDesc')}
              </p>
            </div>
          </button>

          {/* English option */}
          <button
            id="select-english-btn"
            onClick={() => confirmLanguageChoice('en')}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start space-x-4 ${
              lang === 'en'
                ? 'bg-red-950/40 border-red-600 ring-2 ring-red-600/50 text-white'
                : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200'
            }`}
          >
            <span className="text-3xl mt-1">🇬🇧</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-white">English</span>
                {lang === 'en' && <Check className="w-5 h-5 text-red-500" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                {t('selectEnglishDesc')}
              </p>
            </div>
          </button>
        </div>

        <button
          id="confirm-language-continue-btn"
          onClick={() => confirmLanguageChoice(lang)}
          className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40 transition-all flex items-center justify-center space-x-2"
        >
          <span>{t('continueBtn')}</span>
        </button>
      </div>
    </div>
  );
};
