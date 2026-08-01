import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Home, Search, HelpCircle, User, ShieldCheck, Bell } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'search' | 'help' | 'account' | 'admin';
  setActiveTab: (tab: 'home' | 'search' | 'help' | 'account' | 'admin') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  setActiveTab,
}) => {
  const { lang, t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-2">
      <div className="grid grid-cols-4 gap-1">
        
        {/* Ahabanza (Home) */}
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-red-500 font-bold bg-red-950/40 border border-red-800/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] truncate max-w-full">{t('navHome')}</span>
        </button>

        {/* Shakisha (Search) */}
        <button
          id="mobile-nav-search"
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'search'
              ? 'text-red-500 font-bold bg-red-950/40 border border-red-800/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[10px] truncate max-w-full">{t('navSearch')}</span>
        </button>

        {/* Ubufasha (Help) */}
        <button
          id="mobile-nav-help"
          onClick={() => setActiveTab('help')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'help'
              ? 'text-red-500 font-bold bg-red-950/40 border border-red-800/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] truncate max-w-full">{t('navHelp')}</span>
        </button>

        {/* Konte (Account) */}
        <button
          id="mobile-nav-account"
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'account'
              ? 'text-red-500 font-bold bg-red-950/40 border border-red-800/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] truncate max-w-full">{t('navAccount')}</span>
        </button>
      </div>
    </nav>
  );
};
