import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Film, Home, Search, HelpCircle, User, Globe, Sparkles, ShieldCheck, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'search' | 'help' | 'account' | 'admin';
  setActiveTab: (tab: 'home' | 'search' | 'help' | 'account' | 'admin') => void;
  onOpenSearchQuery?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab,
}) => {
  const { lang, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-rose-900 flex items-center justify-center shadow-lg shadow-red-950/50 ring-1 ring-red-500/30 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-2xl tracking-tight text-white group-hover:text-red-500 transition-colors">
                Best<span className="text-red-600">Films</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded">
                {lang === 'rw' ? 'RW' : 'HD'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block font-medium">
              {lang === 'rw' ? 'Sinema mu Kinyarwanda & English' : 'Rwandan & World Cinema'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Desktop */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/70">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('navHome')}</span>
          </button>

          <button
            id="nav-tab-search"
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t('navSearch')}</span>
          </button>

          <button
            id="nav-tab-help"
            onClick={() => setActiveTab('help')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'help'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('navHelp')}</span>
          </button>

          <button
            id="nav-tab-account"
            onClick={() => setActiveTab('account')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'account'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('navAccount')}</span>
          </button>

          <button
            id="nav-tab-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-950/40'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right Section: Language Switcher & Account Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              id="lang-toggle-rw"
              onClick={() => setLanguage('rw')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'rw'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Kinyarwanda"
            >
              <span>🇷🇼</span>
              <span className="hidden sm:inline">RW</span>
            </button>
            <button
              id="lang-toggle-en"
              onClick={() => setLanguage('en')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>

          {/* Account Quick Button */}
          <button
            id="header-user-account-btn"
            onClick={() => setActiveTab('account')}
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline truncate max-w-[100px]">
              {user.isGuest ? t('guestUser') : user.name}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
