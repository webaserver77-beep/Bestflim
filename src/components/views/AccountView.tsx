import React, { useState, useEffect } from 'react';
import { Movie, SubscriptionPlan } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MovieCard } from '../MovieCard';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  User, ShieldAlert, Heart, Clock, History, ListPlus, LogIn, 
  UserPlus, LogOut, CheckCircle, Plus, Play, Sparkles, CreditCard,
  Calendar, Zap, Megaphone, ShieldCheck, Smartphone, Check, ArrowRight, X, AlertCircle,
  Copy, Lock, PhoneCall, Send, Bell, Menu, ChevronDown
} from 'lucide-react';

import { getStoredSubPlans, getStoredPromoMode, getStoredPromoMessage } from '../../data/subscriptionPlans';
import { addAdRequest } from '../../data/adsAndMessages';
import { getStoredNotifications } from '../../data/notifications';

interface AccountViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const AccountView: React.FC<AccountViewProps> = ({ 
  movies, 
  onSelectMovie,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  const { lang, t } = useLanguage();
  const { user, login, logout, createPlaylist, updateSubscription } = useAuth();

  // Notifications State in Account View
  const [unreadNotifs, setUnreadNotifs] = useState<number>(() => {
    return getStoredNotifications().filter(n => !n.isRead).length;
  });

  useEffect(() => {
    const handleNotifUpdate = () => {
      setUnreadNotifs(getStoredNotifications().filter(n => !n.isRead).length);
    };
    window.addEventListener('bestfilms_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('bestfilms_notifications_updated', handleNotifUpdate);
  }, []);

  const totalUnread = unreadNotificationsCount || unreadNotifs;

  // Global Promotion Mode Listener
  const [isPromoModeActive, setIsPromoModeActive] = useState<boolean>(getStoredPromoMode);
  const [promoMessage, setPromoMessage] = useState<string>(getStoredPromoMessage);

  useEffect(() => {
    const handlePromoUpdate = () => {
      setIsPromoModeActive(getStoredPromoMode());
      setPromoMessage(getStoredPromoMessage());
    };
    window.addEventListener('bestfilms_promo_mode_updated', handlePromoUpdate);
    return () => window.removeEventListener('bestfilms_promo_mode_updated', handlePromoUpdate);
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'watchLater' | 'history' | 'playlists' | 'subscription'>('subscription');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: string;
    amountRwf: number;
    durationDays: number;
    type: 'free' | 'vip' | 'advertiser';
    desc: string;
  } | null>(null);

  const [payMethod, setPayMethod] = useState<'mtn' | 'airtel' | 'card'>('mtn');
  const [momoPhone, setMomoPhone] = useState<string>('0788123456');
  const [momoStep, setMomoStep] = useState<'details' | 'pin_prompt'>('details');
  const [pinCode, setPinCode] = useState<string>('');
  const [copiedUSSD, setCopiedUSSD] = useState<boolean>(false);
  const [momoRefId, setMomoRefId] = useState<string | null>(null);
  const [momoApiMessage, setMomoApiMessage] = useState<string | null>(null);
  const [momoError, setMomoError] = useState<string | null>(null);
  const [paySuccessMessage, setPaySuccessMessage] = useState<string | null>(null);
  const [isProcessingPay, setIsProcessingPay] = useState<boolean>(false);

  // Auth Form State
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');

  // Playlist Form State
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState<boolean>(false);
  const [playlistNameInput, setPlaylistNameInput] = useState<string>('');

  // Advertising Request Modal State
  const [showAdRequestModal, setShowAdRequestModal] = useState<boolean>(false);
  const [adForm, setAdForm] = useState({
    businessName: '',
    adTitle: '',
    targetUrl: '',
    phone: '',
    description: '',
    imageUrl: '',
  });
  const [adRequestSuccess, setAdRequestSuccess] = useState<boolean>(false);
  const [adRequestError, setAdRequestError] = useState<string | null>(null);

  const handleOpenAdRequest = () => {
    if (user.isGuest) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setAdRequestError(null);
    setAdRequestSuccess(false);
    setShowAdRequestModal(true);
  };

  const handleAdRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.businessName || !adForm.adTitle || !adForm.phone) {
      setAdRequestError(
        lang === 'rw'
          ? 'Nyamuneka uzuze izina ry\'ubucuruzi, umutwe w\'anonsi na nimero ya telefoni.'
          : 'Please enter business name, ad title, and contact phone number.'
      );
      return;
    }

    addAdRequest({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      phone: adForm.phone,
      businessName: adForm.businessName,
      adTitle: adForm.adTitle,
      targetUrl: adForm.targetUrl,
      description: adForm.description,
      imageUrl: adForm.imageUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
      planName: user.subscription?.name || 'Free Plan',
    });

    setAdRequestSuccess(true);
    setAdRequestError(null);
  };

  // Movies filtered by user lists
  const favoriteMovies = movies.filter((m) => user.favorites.includes(m.id));
  const watchLaterMovies = movies.filter((m) => user.watchLater.includes(m.id));

  const historyItems = user.watchHistory.map((h) => {
    const movieObj = movies.find((m) => m.id === h.movieId);
    return { ...h, movie: movieObj };
  }).filter((h) => h.movie !== undefined);

  // Subscription Plans list dynamic state
  const [rawSubPlans, setRawSubPlans] = useState(() => getStoredSubPlans());

  useEffect(() => {
    const handlePlansUpdate = () => {
      setRawSubPlans(getStoredSubPlans());
    };
    window.addEventListener('bestfilms_plans_updated', handlePlansUpdate);
    return () => window.removeEventListener('bestfilms_plans_updated', handlePlansUpdate);
  }, []);

  const availablePlans = rawSubPlans.map((p) => ({
    id: p.id,
    name: lang === 'rw' ? p.nameRw : p.nameEn,
    price: lang === 'rw' ? p.priceTextRw : p.priceTextEn,
    amountRwf: p.amountRwf,
    durationDays: p.durationDays,
    type: p.type,
    tagline: lang === 'rw' ? p.taglineRw : p.taglineEn,
    features: lang === 'rw' ? p.featuresRw : p.featuresEn,
    badge: lang === 'rw' ? p.badgeRw : p.badgeEn,
    highlight: p.highlight,
  }));

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    login(nameInput || emailInput.split('@')[0], emailInput);
    setShowAuthModal(false);
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistNameInput.trim()) return;
    createPlaylist(playlistNameInput.trim(), []);
    setPlaylistNameInput('');
    setShowNewPlaylistModal(false);
  };

  const handleOpenPayModal = (plan: typeof availablePlans[0]) => {
    setSelectedPlan(plan);
    setShowPayModal(true);
    setPaySuccessMessage(null);
    setMomoError(null);
    setMomoApiMessage(null);
    setMomoRefId(null);
    setMomoStep('details');
    setPinCode('');
    setCopiedUSSD(false);
  };

  const handleCopyUSSD = async (ussdCode: string) => {
    await copyToClipboard(ussdCode);
    setCopiedUSSD(true);
    setTimeout(() => setCopiedUSSD(false), 2500);
  };

  // Real-time MoMo transaction status polling
  useEffect(() => {
    let intervalId: any = null;
    if (momoStep === 'pin_prompt' && momoRefId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/momo/status/${momoRefId}`);
          const data = await res.json();
          if (res.ok && data.success && data.transaction) {
            if (data.transaction.status === 'SUCCESSFUL') {
              clearInterval(intervalId);
              handleConfirmPayment();
            }
          }
        } catch (err) {
          console.error('MoMo Polling error:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [momoStep, momoRefId]);

  const handleSendMoMoPushRequest = async () => {
    if (!momoPhone || momoPhone.trim().length < 8 || !selectedPlan) return;
    setIsProcessingPay(true);
    setMomoError(null);

    try {
      const res = await fetch('/api/momo/request-to-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: momoPhone,
          amount: selectedPlan.amountRwf,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMomoError(data.message || (lang === 'rw' ? 'Kwishyura byananiwe. Ongera ugerageze.' : 'Payment request failed. Please try again.'));
        setIsProcessingPay(false);
        return;
      }

      setMomoRefId(data.referenceId);
      setMomoApiMessage(data.message);
      setIsProcessingPay(false);
      setMomoStep('pin_prompt');
    } catch (err: any) {
      console.error(err);
      setMomoError(lang === 'rw' ? 'Ntabwo bishoboka guhuza na seriveri.' : 'Failed to connect to backend server.');
      setIsProcessingPay(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessingPay(true);
    setMomoError(null);

    try {
      if (momoRefId) {
        const res = await fetch('/api/momo/confirm-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: momoRefId,
            pinCode: pinCode || '1234',
            lang,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setMomoError(data.message || (lang === 'rw' ? 'PIN ntabwo yemewe.' : 'Invalid PIN code.'));
          setIsProcessingPay(false);
          return;
        }
      }

      const now = new Date();
      const startDateStr = now.toISOString().split('T')[0];
      
      let endDateStr = 'Lifetime (Ntabwo Irangira)';
      if (selectedPlan.id !== 'free') {
        const endDate = new Date(now.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
        endDateStr = endDate.toISOString().split('T')[0];
      }

      const updatedPlan: SubscriptionPlan = {
        id: selectedPlan.id,
        name: selectedPlan.name,
        type: selectedPlan.type,
        price: selectedPlan.price,
        amountRwf: selectedPlan.amountRwf,
        startedAt: startDateStr,
        endsAt: endDateStr,
        paymentMethod: payMethod === 'mtn' ? 'MTN Mobile Money' : payMethod === 'airtel' ? 'Airtel Money' : 'Bank Visa/Mastercard',
        paymentPhone: momoPhone,
        isActive: true,
      };

      updateSubscription(updatedPlan);

      // Record transaction log for real analytics
      try {
        const newTx = {
          referenceId: `ref-${Date.now().toString().slice(-6)}`,
          phone: momoPhone || '250788000000',
          amount: selectedPlan.amountRwf || 0,
          currency: 'RWF',
          merchantId: '1461297',
          planName: selectedPlan.name,
          status: 'SUCCESSFUL',
          ussdCode: `*182*8*1*1461297*${selectedPlan.amountRwf}#`,
          createdAt: new Date().toISOString(),
        };
        const rawTxs = localStorage.getItem('bestfilms_momo_txs');
        const txList = rawTxs ? JSON.parse(rawTxs) : [];
        txList.unshift(newTx);
        localStorage.setItem('bestfilms_momo_txs', JSON.stringify(txList));
        window.dispatchEvent(new Event('bestfilms_momo_tx_added'));
      } catch (txErr) {
        console.error('Save transaction error:', txErr);
      }

      setIsProcessingPay(false);
      setPaySuccessMessage(
        lang === 'rw'
          ? `Kwishyura amayarafanga ${selectedPlan.price} byakozwe neza! Ifatabuguzi ryawe rya "${selectedPlan.name}" yatangiye kuva ${startDateStr} kugeza ${endDateStr}.`
          : `Payment of ${selectedPlan.price} successful! Your subscription "${selectedPlan.name}" is now active from ${startDateStr} until ${endDateStr}.`
      );

      setTimeout(() => {
        setShowPayModal(false);
        setPaySuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      setMomoError(lang === 'rw' ? 'Ikosa ryo kwemeza kwishyura' : 'Error confirming payment');
      setIsProcessingPay(false);
    }
  };

  const currentSub = user.subscription || {
    id: 'free',
    name: "Plan y'Ubuntu (Free Plan)",
    type: 'free',
    price: '0 RWF',
    amountRwf: 0,
    startedAt: new Date().toISOString().split('T')[0],
    endsAt: 'Lifetime (Ntabwo Irangira)',
    isActive: true,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Header Box & User Info */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/40 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20 flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-white">{user.name}</h1>
              
              {/* Movie Updates Notification Bell right next to Account Name */}
              {onOpenNotifications && (
                <button
                  id="account-name-notification-bell-btn"
                  onClick={onOpenNotifications}
                  className="relative p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-red-500/60 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center space-x-1.5 group shadow-sm active:scale-95"
                  title={lang === 'rw' ? 'Ubutumwa bw\'amakuru ya filme' : 'Movie Update Alerts'}
                >
                  <Bell className="w-4 h-4 text-zinc-300 group-hover:text-red-400 transition-colors" />
                  {totalUnread > 0 ? (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black animate-pulse flex items-center justify-center">
                      {totalUnread}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-semibold pr-0.5 hidden sm:inline-block">
                      {lang === 'rw' ? 'Amakuru' : 'Alerts'}
                    </span>
                  )}
                </button>
              )}

              {user.isGuest ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold uppercase border border-amber-500/30">
                  {t('guestUser')}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold uppercase border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified User</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        </div>

        {/* Current User Subscription Quick Status */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {lang === 'rw' ? 'Ifatabuguzi Yanjye' : 'Current Plan'}
            </div>
            <div className="text-sm font-black text-white flex items-center space-x-2">
              <span>{currentSub.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                currentSub.type === 'free' 
                  ? 'bg-zinc-800 text-zinc-300' 
                  : currentSub.type === 'advertiser'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                  : 'bg-amber-950 text-amber-400 border border-amber-700/50'
              }`}>
                {currentSub.type === 'free' ? 'Free Plan' : currentSub.type === 'advertiser' ? 'Ad Promotion' : 'VIP Member'}
              </span>
            </div>
          </div>
        </div>

        {user.isGuest ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="request-advertising-top-guest-btn"
              type="button"
              onClick={handleOpenAdRequest}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-zinc-900 hover:from-amber-600/30 hover:to-purple-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'rw' ? 'Saba Kwamamaza Ubucuruzi' : 'Request Advertising'}</span>
            </button>
            <button
              id="profile-login-btn"
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-white text-xs transition-colors flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('login')}</span>
            </button>
            <button
              id="profile-signup-btn"
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-xs transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('createAccount')}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="request-advertising-top-btn"
              type="button"
              onClick={handleOpenAdRequest}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-zinc-900 hover:from-amber-600/30 hover:to-purple-600/30 border border-amber-500/50 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'rw' ? 'Saba Kwamamaza Ubucuruzi' : 'Request Advertising'}</span>
            </button>
            <button
              id="profile-logout-btn"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-400 border border-zinc-700 text-zinc-300 text-xs font-bold transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Account Navigation Sub-tabs with 3-Bar Menu */}
      <div className="relative border-b border-zinc-800 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* 1. Subscription & Pricing Button - ALWAYS VISIBLE OUTSIDE */}
            <button
              id="tab-subscription"
              onClick={() => {
                setActiveSubTab('subscription');
                setIsAccountMenuOpen(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'subscription'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 scale-102 ring-2 ring-red-500/50'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{lang === 'rw' ? 'Ifatabuguzi & Kwamamaza' : 'Subscription & Pricing'}</span>
            </button>

            {/* If active tab is NOT subscription, show active tab indicator badge outside too */}
            {activeSubTab !== 'subscription' && (
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-red-600 text-white shadow-md border border-red-500/40 animate-fadeIn">
                {activeSubTab === 'favorites' && <Heart className="w-4 h-4 text-white" />}
                {activeSubTab === 'watchLater' && <Clock className="w-4 h-4 text-white" />}
                {activeSubTab === 'history' && <History className="w-4 h-4 text-white" />}
                {activeSubTab === 'playlists' && <ListPlus className="w-4 h-4 text-white" />}
                <span>
                  {activeSubTab === 'favorites' && `${t('myFavorites')} (${favoriteMovies.length})`}
                  {activeSubTab === 'watchLater' && `${t('myWatchLater')} (${watchLaterMovies.length})`}
                  {activeSubTab === 'history' && `${t('myHistory')} (${historyItems.length})`}
                  {activeSubTab === 'playlists' && `${t('myPlaylists')} (${user.playlists.length})`}
                </span>
              </div>
            )}
          </div>

          {/* 2. Three Bar Menu Button (Dropdown Toggle) */}
          <button
            id="account-three-bar-menu-btn"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              isAccountMenuOpen
                ? 'bg-amber-500 text-zinc-950 border border-amber-400 shadow-md scale-102'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-sm'
            }`}
          >
            {isAccountMenuOpen ? (
              <X className="w-4 h-4 text-zinc-950" />
            ) : (
              <Menu className="w-4 h-4 text-red-500" />
            )}
            <span>{lang === 'rw' ? 'Menu ya Konti' : 'Account Menu'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 3. Three Bar Dropdown Menu Panel */}
        {isAccountMenuOpen && (
          <>
            {/* Backdrop for closing menu when clicking outside */}
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setIsAccountMenuOpen(false)} 
            />

            <div className="absolute right-0 top-14 z-30 w-72 bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>{lang === 'rw' ? 'Hitamo Menu' : 'Select Section'}</span>
                <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded font-black">
                  3-Bar
                </span>
              </div>

              {/* Subscription Option inside 3-bar menu as requested */}
              <button
                id="menu-tab-subscription"
                onClick={() => {
                  setActiveSubTab('subscription');
                  setIsAccountMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'subscription'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'rw' ? 'Ifatabuguzi & Kwamamaza' : 'Subscription & Pricing'}</span>
                </div>
                {activeSubTab === 'subscription' && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Favorites Option */}
              <button
                id="menu-tab-favorites"
                onClick={() => {
                  setActiveSubTab('favorites');
                  setIsAccountMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'favorites'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{t('myFavorites')}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeSubTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {favoriteMovies.length}
                </span>
              </button>

              {/* Watch Later Option */}
              <button
                id="menu-tab-watch-later"
                onClick={() => {
                  setActiveSubTab('watchLater');
                  setIsAccountMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'watchLater'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{t('myWatchLater')}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeSubTab === 'watchLater' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {watchLaterMovies.length}
                </span>
              </button>

              {/* Watch History Option */}
              <button
                id="menu-tab-history"
                onClick={() => {
                  setActiveSubTab('history');
                  setIsAccountMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'history'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <History className="w-4 h-4 text-blue-400" />
                  <span>{t('myHistory')}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeSubTab === 'history' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {historyItems.length}
                </span>
              </button>

              {/* Playlists Option */}
              <button
                id="menu-tab-playlists"
                onClick={() => {
                  setActiveSubTab('playlists');
                  setIsAccountMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'playlists'
                    ? 'bg-red-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <ListPlus className="w-4 h-4 text-emerald-400" />
                  <span>{t('myPlaylists')}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeSubTab === 'playlists' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {user.playlists.length}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 1. SUBSCRIPTION & PRICING TAB CONTENT */}
      {activeSubTab === 'subscription' && (
        <div className="space-y-8">
          {/* Global Promo Mode Alert Banner */}
          {isPromoModeActive && (
            <div className="bg-gradient-to-r from-amber-950 via-emerald-950/80 to-purple-950 border-2 border-amber-500/80 p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/50 shrink-0">
                  <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>{lang === 'rw' ? '🎉 PROMO Y\'UBUNTU IRAKORA! (Free Access Promo Live)' : '🎉 GLOBAL FREE ACCESS PROMOTION ACTIVE!'}</span>
                  </h3>
                  <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                    {promoMessage}
                  </p>
                  <p className="text-[11px] text-zinc-300 mt-1 italic">
                    {lang === 'rw' 
                      ? 'Nta kiguzi cyangwa icyemezo cy\'ifatabuguzi gisabwa muri iki gihe. Filme zose n\'ibikorwa byo kumanura ziri ku buntu.'
                      : 'All VIP movie streaming, HD/4K downloads, and premium features are 100% unlocked for everyone during this promo period.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 bg-black/50 border border-amber-500/40 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">{lang === 'rw' ? 'Urwego rwa Promo' : 'Promo Access'}</span>
                <span className="text-xs font-black text-white">{lang === 'rw' ? '100% FREE VIP' : '100% FREE VIP'}</span>
              </div>
            </div>
          )}
          
          {/* Detailed Current Subscription Dashboard Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-500 bg-red-950/80 border border-red-800/50 px-2.5 py-1 rounded-full">
                    {lang === 'rw' ? 'STATUS Y\'IKUBITIRO' : 'MEMBERSHIP DASHBOARD'}
                  </span>
                  <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active Plan (Irakora)</span>
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  {currentSub.name}
                </h2>
                
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                  {currentSub.type === 'free'
                    ? (lang === 'rw' 
                        ? 'Uri gukoresha Plan y\'Ubuntu (Free Plan). Ushobora kureba filme n\'amaserie ku buntu cyangwa ukongera urwego ukaba VIP.'
                        : 'You are currently on the Free Plan. Enjoy free SD playback or upgrade anytime for full HD VIP access.')
                    : (lang === 'rw'
                        ? 'Ifatabuguzi ryawe rirakora neza. Ushobora kureba no kumanura filme zose utabangamiwe.'
                        : 'Your VIP subscription is currently active. Stream unlimited movies with zero ads.')}
                </p>

                {currentSub.type === 'free' && (
                  <div className="pt-1">
                    <button
                      id="upgrade-vip-banner-btn"
                      type="button"
                      onClick={() => {
                        const targetPlan = availablePlans.find(p => p.id === 'vip_weekly') || availablePlans[0];
                        handleOpenPayModal(targetPlan);
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-red-950/60 flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{lang === 'rw' ? 'Gura Ifatabuguzi rya VIP (Ishyura na MoMo)' : 'Subscribe to Go VIP (Pay with MoMo)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price & Billing Cycle Badge */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl text-center min-w-[200px] space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">
                  {lang === 'rw' ? 'Igiciro cy\'Ifatabuguzi' : 'Subscription Price'}
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {currentSub.price}
                </div>
                {currentSub.paymentMethod && (
                  <div className="text-[11px] font-semibold text-zinc-400">
                    {currentSub.paymentMethod}
                  </div>
                )}
              </div>
            </div>

            {/* Start Date, End Date, & Time Interval Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">
                    {lang === 'rw' ? 'Itariki Yatangiriye' : 'Started Date'}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentSub.startedAt}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3">
                <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">
                    {lang === 'rw' ? 'Itariki Izarangiriraho' : 'Expiration Date'}
                  </div>
                  <div className="text-sm font-bold text-amber-400">
                    {currentSub.endsAt}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">
                    {lang === 'rw' ? 'Uburyo bw\'Ubwishyu' : 'Payment Type'}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentSub.paymentMethod || (lang === 'rw' ? 'Ubuntu (Free Access)' : 'Free Tier')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans & Pricing Cards Title */}
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {lang === 'rw' ? 'Ibiciro n\'Amahitamo y\'Ifatabuguzi' : 'Choose Your Plan or Business Ad'}
            </h2>
            <p className="text-xs md:text-sm text-zinc-400">
              {lang === 'rw' 
                ? 'Hitamo igiciro kikunze cyangwa wandikishe amatangazo y\'ubucuruzi bwawe ku Best Films (1,000 RWF / icyumweru).'
                : 'Select your preferred streaming plan or advertise your business on Best Films (1,000 RWF / week).'}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              const isCurrent = currentSub.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl bg-zinc-900 border p-6 flex flex-col justify-between space-y-6 transition-all duration-300 ${
                    plan.highlight
                      ? 'border-red-600 shadow-2xl shadow-red-950/40 ring-1 ring-red-500/30 bg-gradient-to-b from-red-950/20 via-zinc-900 to-zinc-900'
                      : plan.type === 'advertiser'
                      ? 'border-purple-600/60 shadow-xl bg-gradient-to-b from-purple-950/20 via-zinc-900 to-zinc-900'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      plan.highlight
                        ? 'bg-red-600 border-red-500 text-white'
                        : plan.type === 'advertiser'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}>
                      {plan.badge}
                    </span>

                    {plan.type === 'advertiser' && (
                      <Megaphone className="w-5 h-5 text-purple-400" />
                    )}
                  </div>

                  {/* Header Title & Price */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white">
                      {plan.name}
                    </h3>
                    <div className="text-2xl md:text-3xl font-black text-amber-400">
                      {plan.price}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 border-t border-zinc-800/80 pt-4 flex-1">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCurrent ? (
                      <div className="w-full py-3 rounded-xl bg-emerald-950 border border-emerald-600/50 text-emerald-300 font-bold text-xs text-center flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'rw' ? 'Iki ni cyo ukoresha ubu' : 'Active Plan'}</span>
                      </div>
                    ) : (
                      <button
                        id={`select-plan-btn-${plan.id}`}
                        onClick={() => handleOpenPayModal(plan)}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 ${
                          plan.highlight
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/80'
                            : plan.type === 'advertiser'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/80'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        }`}
                      >
                        <span>{plan.amountRwf === 0 ? (lang === 'rw' ? 'Hitamo Plan y\'Ubuntu' : 'Select Free Plan') : (lang === 'rw' ? 'Gura Ifatabuguzi (Ishyura na MoMo)' : 'Subscribe / Pay Now')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 2. FAVORITES TAB */}
      {activeSubTab === 'favorites' && (
        <div>
          {favoriteMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-3">
              <Heart className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">{t('noFavoritesYet')}</p>
            </div>
          )}
        </div>
      )}

      {/* 3. WATCH LATER TAB */}
      {activeSubTab === 'watchLater' && (
        <div>
          {watchLaterMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchLaterMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-3">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">{t('noWatchLaterYet')}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. WATCH HISTORY TAB */}
      {activeSubTab === 'history' && (
        <div>
          {historyItems.length > 0 ? (
            <div className="space-y-4">
              {historyItems.map((item) => {
                const m = item.movie!;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m)}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center space-x-4 cursor-pointer transition-all"
                  >
                    <img src={m.posterUrl} alt={m.title} className="w-16 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'rw' && m.kinyarwandaTitle ? m.kinyarwandaTitle : m.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{m.year} • {m.runtime}</p>
                      
                      <div className="w-full max-w-md bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-red-600 h-full rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block font-semibold">
                        {item.progress}% completed
                      </span>
                    </div>

                    <button className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white">
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-3">
              <History className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">{t('noHistoryYet')}</p>
            </div>
          )}
        </div>
      )}

      {/* 5. CUSTOM PLAYLISTS TAB */}
      {activeSubTab === 'playlists' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{t('myPlaylists')}</h3>
            <button
              id="create-playlist-trigger-btn"
              onClick={() => setShowNewPlaylistModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createPlaylistBtn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.playlists.map((pl) => (
              <div key={pl.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{pl.name}</h4>
                  <span className="text-xs text-zinc-400">{pl.movieIds.length} items</span>
                </div>
                <p className="text-xs text-zinc-500">Custom user curated playlist</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MOBILE MONEY & PAYMENT CHECKOUT */}
      {showPayModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {paySuccessMessage ? (
              <div className="text-center space-y-4 py-6">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-white">
                  {lang === 'rw' ? 'Igikorwa Kyo Kwishyura Byakozwe!' : 'Payment Completed Successfully!'}
                </h3>
                <p className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 p-4 rounded-xl leading-relaxed">
                  {paySuccessMessage}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>{lang === 'rw' ? 'Kwishyura na Mobile Money (MoMo Pay)' : 'Mobile Money Checkout'}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {selectedPlan.name}
                  </h3>
                  <div className="text-2xl font-black text-amber-400">
                    {selectedPlan.price}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 block">
                    {lang === 'rw' ? 'Hitamo Uburyo bwo Kwishyura:' : 'Select Payment Option:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod('mtn')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center space-y-1 transition-all ${
                        payMethod === 'mtn'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">🟡</span>
                      <span>MTN MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('airtel')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center space-y-1 transition-all ${
                        payMethod === 'airtel'
                          ? 'bg-red-500/10 border-red-500 text-red-400 shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">🔴</span>
                      <span>Airtel Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('card')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center space-y-1 transition-all ${
                        payMethod === 'card'
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Visa/Mastercard</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner if any */}
                {momoError && (
                  <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-xs text-red-200 flex items-start space-x-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{momoError}</span>
                  </div>
                )}

                {/* STEP 1: MOMO DETAILS & PUSH REQUEST */}
                {momoStep === 'details' && (
                  <div className="space-y-4">
                    {/* Official Secure Direct Push Banner */}
                    <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-zinc-950 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        <span>{lang === 'rw' ? 'Kwishyura Kuri MoMo Direct Push' : 'Direct Mobile Money Payment'}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {lang === 'rw'
                          ? 'Kwishyura bikorwa mu buryo bw\'akanya kohererezwa ubutumwa ku telefoni yawe (Direct Push Prompt). Injiza numero yawe hanyuma ukande "Yohereza Ubusabe".'
                          : 'Payment is processed automatically via direct MoMo push notification. Enter your phone number below and click "Send Payment Prompt".'}
                      </p>
                    </div>

                    {/* Paying Phone Number Input */}
                    <div className="space-y-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <label className="text-xs font-bold text-zinc-300 block">
                        {lang === 'rw' ? 'Nimero ya telefoni yakatwaho amafaranga (Paying Phone Number):' : 'Enter Paying Phone Number:'}
                      </label>
                      <input
                        id="momo-phone-input"
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="078XXXXXXX / 079XXXXXXX"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {lang === 'rw' 
                          ? 'Muri iyi numero niho hahita hohererezwa ubutumwa (push alert) bukusaba kwinjiza PIN ya MoMo.'
                          : 'A push alert will be sent to this phone number asking to confirm with your PIN.'}
                      </p>
                    </div>

                    {/* Submit Push Alert Request Button */}
                    <button
                      id="send-momo-push-btn"
                      type="button"
                      onClick={handleSendMoMoPushRequest}
                      disabled={isProcessingPay || !momoPhone || momoPhone.trim().length < 8}
                      className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl shadow-red-950/60 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 transition-transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isProcessingPay
                          ? (lang === 'rw' ? 'Biratunganywa...' : 'Sending Request...')
                          : (lang === 'rw' ? 'Yohereza Ubusabe bwo Kwishyura (Send Prompt)' : 'Send Payment Request Prompt')}
                      </span>
                    </button>
                  </div>
                )}

                {/* STEP 2: SIMULATED MOBILE MONEY PIN ALERT ON PHONE */}
                {momoStep === 'pin_prompt' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Simulated Phone Alert Dialog */}
                    <div className="bg-amber-950/40 border-2 border-amber-500/80 p-5 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden">
                      <div className="flex items-center space-x-3 border-b border-amber-500/30 pb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm">
                            📲 {lang === 'rw' ? 'Ubutumwa bwo Kwishyura (MoMo Push Alert)' : 'MoMo PIN Push Prompt Sent'}
                          </h4>
                          <p className="text-[11px] text-amber-300 font-mono">
                            {lang === 'rw' ? `Bwohererejwe kuri: ${momoPhone}` : `Sent to phone: ${momoPhone}`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-200">
                        <p className="leading-relaxed">
                          {lang === 'rw'
                            ? `Ubusabe bwa ${selectedPlan.price} bwohererejwe kuri telefoni yawe (${momoPhone}). Reba kuri shusho ya telefoni yawe hanyuma kwinjiza PIN ya MoMo bwo kwemeza ko amafaranga akatwa.`
                            : `A payment request of ${selectedPlan.price} has been pushed to ${momoPhone}. Check your phone screen and enter your Mobile Money PIN to authorize payment.`}
                        </p>
                      </div>

                      {/* PIN Entry Simulation */}
                      <div className="space-y-1 border-t border-amber-500/30 pt-3">
                        <label className="text-xs font-bold text-white block flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'rw' ? 'Injiza PIN ya MoMo (Enter MoMo PIN):' : 'Enter MoMo PIN (Simulation):'}</span>
                        </label>
                        <input
                          id="momo-pin-input"
                          type="password"
                          maxLength={5}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          placeholder="****"
                          className="w-full px-4 py-3 bg-zinc-950 border border-amber-500/60 rounded-xl text-white font-mono text-lg text-center tracking-widest focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setMomoStep('details')}
                        className="px-4 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                      >
                        {lang === 'rw' ? 'Subira Inyuma' : 'Back'}
                      </button>

                      <button
                        id="confirm-pay-now-btn"
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPay}
                        className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white shadow-xl shadow-emerald-950/60 flex items-center justify-center space-x-2 text-xs disabled:opacity-50 transition-transform active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>
                          {isProcessingPay
                            ? (lang === 'rw' ? 'Kwishyura biratunganywa...' : 'Verifying PIN & Payment...')
                            : (lang === 'rw' ? 'Emeza PIN & Rangiza Kwishyura' : 'Confirm PIN & Complete Payment')}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Login / Sign Up */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-white">
                {authMode === 'login' ? t('login') : t('createAccount')}
              </h3>
              <p className="text-xs text-zinc-400">
                {authMode === 'login' ? 'Injira muri Best Films' : 'Kora konte nshya ku buntu'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    {t('nameLabel')}
                  </label>
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Mutesi Keza"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  {t('emailLabel')}
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  {t('passwordLabel')}
                </label>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm"
                />
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50"
              >
                {authMode === 'login' ? t('login') : t('createAccount')}
              </button>
            </form>

            <div className="relative border-t border-zinc-800 pt-4 text-center">
              <button
                onClick={() => {
                  login('Google User', 'google.user@gmail.com');
                  setShowAuthModal(false);
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center space-x-2"
              >
                <span>🌐</span>
                <span>{t('loginWithGoogle')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Playlist */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{t('createPlaylistBtn')}</h3>
            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <input
                id="new-playlist-input"
                type="text"
                required
                value={playlistNameInput}
                onChange={(e) => setPlaylistNameInput(e.target.value)}
                placeholder={t('newPlaylistName')}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlaylistModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  {t('savePlaylist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST ADVERTISING */}
      {showAdRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {lang === 'rw' ? 'Saba Kwamamaza Ubucuruzi Bwawe' : 'Request Advertising for Your Business'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {lang === 'rw' ? 'Shyira anonsi n\'ibiringiti by\'ubucuruzi bwawe ku Best Films' : 'Promote your business to 50,000+ Rwandan viewers'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-ad-request-modal-btn"
                onClick={() => setShowAdRequestModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If user is not yet subscribed to Ad Promotion */}
            {currentSub.type !== 'advertiser' && !adRequestSuccess && (
              <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-zinc-950 p-4 rounded-2xl border border-amber-500/40 space-y-3">
                <div className="flex items-start space-x-2 text-amber-300">
                  <Sparkles className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                  <div className="space-y-1 text-xs leading-relaxed">
                    <p className="font-bold text-amber-300">
                      {lang === 'rw'
                        ? 'Gusaba kwamamaza bisaba kuba ufite Ifatabuguzi ry\'amatangazo (Ad Promotion Plan).'
                        : 'Business advertising request requires an active Advertiser Subscription plan.'}
                    </p>
                    <p className="text-zinc-300 text-[11px]">
                      {lang === 'rw'
                        ? 'Ushobora kugura Ifatabuguzi ry\'Amatangazo (1,000 RWF / icyumweru) cyangwa ukaba wakwuzuza ubusabe hano hepfo bikazasuzumwa na Admin.'
                        : 'Subscribe for 1,000 RWF / week or submit your business details below for platform owner review.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="ad-request-subscribe-now-btn"
                  onClick={() => {
                    setShowAdRequestModal(false);
                    const adPlan = availablePlans.find(p => p.type === 'advertiser') || availablePlans[3];
                    handleOpenPayModal(adPlan);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'rw' ? 'Gura Ifatabuguzi ry\'Amatangazo (1,000 RWF ku Icyumweru)' : 'Subscribe to Advertiser Plan (1,000 RWF / week)'}</span>
                </button>
              </div>
            )}

            {/* Success Message */}
            {adRequestSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-white text-sm">
                  {lang === 'rw' ? 'Ubusabe bwawe bwohererejwe neza!' : 'Ad Request Submitted Successfully!'}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                  {lang === 'rw'
                    ? 'Ubusabe bw\'ubucuruzi bwawe bwageze kuri Nyiri Best Films (Admin). Azagusuzumira anashyireho anonsi yawe vuba cyane.'
                    : 'Your advertising request has been sent directly to the platform owner (Admin). Your banner will be reviewed and activated shortly.'}
                </p>
                <button
                  type="button"
                  id="ad-request-success-close-btn"
                  onClick={() => setShowAdRequestModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              /* Ad Form */
              <form onSubmit={handleAdRequestSubmit} className="space-y-4">
                {adRequestError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{adRequestError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    {lang === 'rw' ? 'Izina ry\'Ubucuruzi Bwawe *' : 'Business Name *'}
                  </label>
                  <input
                    id="ad-request-business-name-input"
                    type="text"
                    required
                    value={adForm.businessName}
                    onChange={(e) => setAdForm({ ...adForm, businessName: e.target.value })}
                    placeholder={lang === 'rw' ? 'urugero: Kigali Fashion Store, Electronic Repairs...' : 'e.g., Kigali Tech Store, Phone Repair Hub...'}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    {lang === 'rw' ? 'Umutwe w\'Anonsi (Headline / Title) *' : 'Ad Headline / Title *'}
                  </label>
                  <input
                    id="ad-request-headline-input"
                    type="text"
                    required
                    value={adForm.adTitle}
                    onChange={(e) => setAdForm({ ...adForm, adTitle: e.target.value })}
                    placeholder={lang === 'rw' ? 'urugero: Gura telefoni nziza ku giciro kito Rwanda' : 'e.g., High Quality Laptops at Low Prices'}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      {lang === 'rw' ? 'Telefoni (WhatsApp) *' : 'Contact Phone / WhatsApp *'}
                    </label>
                    <input
                      id="ad-request-phone-input"
                      type="text"
                      required
                      value={adForm.phone}
                      onChange={(e) => setAdForm({ ...adForm, phone: e.target.value })}
                      placeholder="0788123456"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      {lang === 'rw' ? 'Lien / WhatsApp Link' : 'Target Website / WhatsApp Link'}
                    </label>
                    <input
                      id="ad-request-url-input"
                      type="url"
                      value={adForm.targetUrl}
                      onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })}
                      placeholder="https://wa.me/250788123456"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    {lang === 'rw' ? 'Lien y\'Amashusho (Banner Image URL - Udakeneye byirengagize)' : 'Banner Image URL (Optional)'}
                  </label>
                  <input
                    id="ad-request-image-input"
                    type="url"
                    value={adForm.imageUrl}
                    onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    {lang === 'rw' ? 'Ubusobanuro bw\'Ubucuruzi Bwawe' : 'Business Description / Promotion Notes'}
                  </label>
                  <textarea
                    id="ad-request-desc-textarea"
                    rows={3}
                    value={adForm.description}
                    onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                    placeholder={lang === 'rw' ? 'Sobanura ibyo ukora n\'uburyo abakiriya bagushaka...' : 'Describe your business products or service offer...'}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    id="ad-request-cancel-btn"
                    onClick={() => setShowAdRequestModal(false)}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    id="ad-request-submit-btn"
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'rw' ? 'Ohereza Ubusabe bwo Kwamamaza' : 'Submit Ad Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};


