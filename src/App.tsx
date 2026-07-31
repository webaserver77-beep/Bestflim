import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { MOVIES_DATA } from './data/movies';
import { seedFirestoreIfEmpty, subscribeMovies } from './lib/firebase';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LanguageModal } from './components/LanguageModal';
import { NotificationsModal } from './components/NotificationsModal';
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { HelpView } from './components/views/HelpView';
import { AccountView } from './components/views/AccountView';
import { AdminView } from './components/views/AdminView';
import { VideoPlayer } from './components/VideoPlayer';
import { getStoredPromoMode, getStoredPromoMessage } from './data/subscriptionPlans';
import { getStoredNotifications } from './data/notifications';
import { Sparkles } from 'lucide-react';

export function BestFilmsApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'help' | 'account' | 'admin'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>(MOVIES_DATA);

  // Notifications State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() => {
    return getStoredNotifications().filter(n => !n.isRead).length;
  });

  useEffect(() => {
    const handleNotifUpdate = () => {
      setUnreadNotifCount(getStoredNotifications().filter(n => !n.isRead).length);
    };
    window.addEventListener('bestfilms_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('bestfilms_notifications_updated', handleNotifUpdate);
  }, []);

  // Global Promo State
  const [isPromoActive, setIsPromoActive] = useState<boolean>(getStoredPromoMode);
  const [promoMessage, setPromoMessage] = useState<string>(getStoredPromoMessage);

  useEffect(() => {
    const handlePromoUpdate = () => {
      setIsPromoActive(getStoredPromoMode());
      setPromoMessage(getStoredPromoMessage());
    };
    window.addEventListener('bestfilms_promo_mode_updated', handlePromoUpdate);
    return () => window.removeEventListener('bestfilms_promo_mode_updated', handlePromoUpdate);
  }, []);

  useEffect(() => {
    // Seed initial data to Firestore if empty and subscribe
    seedFirestoreIfEmpty();
    const unsubscribe = subscribeMovies((fireMovies) => {
      if (fireMovies && fireMovies.length > 0) {
        setMovies(fireMovies);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const storedVisits = parseInt(localStorage.getItem('bestfilms_web_visitors') || '0', 10);
      if (!sessionStorage.getItem('bestfilms_counted_session')) {
        sessionStorage.setItem('bestfilms_counted_session', 'true');
        const newTotal = storedVisits + 1;
        localStorage.setItem('bestfilms_web_visitors', newTotal.toString());
        window.dispatchEvent(new Event('bestfilms_visitor_added'));
      }
    } catch (e) {
      console.error('Visitor counting error:', e);
    }
  }, []);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPlayer = () => {
    setSelectedMovie(null);
  };

  const handleOpenSearchWithQuery = (query: string) => {
    setSearchInitialQuery(query);
    setSelectedMovie(null);
    setActiveTab('search');
  };

  const handleUpdateMovies = (updatedMovies: Movie[]) => {
    setMovies(updatedMovies);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* First visit language prompt modal */}
      <LanguageModal />

      {/* Movie Update & Addition Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        movies={movies}
        onSelectMovie={handleSelectMovie}
      />

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMovie(null);
          setActiveTab(tab);
        }}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
      />

      {/* Sticky Global Free Access Promotion Top Notification Banner */}
      {isPromoActive && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 px-4 py-2 font-black text-xs shadow-md border-b border-amber-300 flex items-center justify-center space-x-2 animate-fadeIn z-40">
          <Sparkles className="w-4 h-4 fill-zinc-950 text-zinc-950 shrink-0" />
          <span className="truncate">{promoMessage}</span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-950 text-amber-400 rounded-md text-[10px] uppercase font-mono tracking-wider">
            100% FREE VIP UNLOCKED
          </span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16 md:pb-6">
        {selectedMovie ? (
          <VideoPlayer
            movie={selectedMovie}
            allMovies={movies}
            onBack={handleBackFromPlayer}
            onSelectMovie={handleSelectMovie}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                movies={movies}
                onSelectMovie={handleSelectMovie}
                onExploreMore={() => setActiveTab('search')}
              />
            )}

            {activeTab === 'search' && (
              <SearchView
                movies={movies}
                onSelectMovie={handleSelectMovie}
                initialQuery={searchInitialQuery}
              />
            )}

            {activeTab === 'help' && <HelpView />}

            {activeTab === 'account' && (
              <AccountView 
                movies={movies} 
                onSelectMovie={handleSelectMovie}
                onOpenNotifications={() => setIsNotifModalOpen(true)}
                unreadNotificationsCount={unreadNotifCount}
              />
            )}

            {activeTab === 'admin' && (
              <AdminView 
                movies={movies} 
                onSelectMovie={handleSelectMovie} 
                onUpdateMovies={handleUpdateMovies}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMovie(null);
          setActiveTab(tab);
        }}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
      />

      {/* Footer */}
      {!selectedMovie && (
        <footer className="hidden md:block bg-zinc-950 border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">Best Films</span>
              <span>•</span>
              <span>Rwanda & International Cinema</span>
            </div>
            <p>© 2026 Best Films. All rights reserved.</p>
          </div>
        </footer>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BestFilmsApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
