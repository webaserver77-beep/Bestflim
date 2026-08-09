import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Movie, SupportMessage, PlatformAd } from '../../types';
import { SubPlan, getStoredSubPlans, saveSubPlans, getStoredPromoMode, getStoredPromoMessage, savePromoMode } from '../../data/subscriptionPlans';
import { addMovieNotification } from '../../data/notifications';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  getStoredSupportMessages, saveSupportMessages, 
  getStoredAds, saveAds,
  getStoredAdRequests, saveAdRequests
} from '../../data/adsAndMessages';
import { 
  addMovieToFirestore, 
  updateMovieInFirestore, 
  deleteMovieFromFirestore,
  subscribeAds,
  addAdToFirestore,
  updateAdInFirestore,
  deleteAdFromFirestore,
  subscribeSupportMessages,
  addSupportMessageToFirestore,
  updateSupportMessageInFirestore,
  deleteSupportMessageFromFirestore
} from '../../lib/firebase';
import { 
  ShieldCheck, Lock, Smartphone, Zap, CheckCircle2, AlertCircle, 
  DollarSign, TrendingUp, Users, Film, Plus, Trash2, Edit3, 
  Key, RefreshCw, Send, Copy, Check, Eye, ChevronRight, Activity, Server,
  Download, Globe, Settings, Save, Search, Filter, HardDrive, BarChart3, Clock, ArrowUpRight,
  Menu, X, MessageSquare, Megaphone, ExternalLink, Sparkles, MessageCircle, Video, Tv
} from 'lucide-react';

interface AdminViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onUpdateMovies?: (updatedMovies: Movie[]) => void;
}

interface MoMoTx {
  referenceId: string;
  phone: string;
  amount: number;
  currency: string;
  merchantId: string;
  planName?: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  ussdCode: string;
  createdAt: string;
}

interface DownloadLogItem {
  id: string;
  userName: string;
  userEmail: string;
  phone: string;
  movieTitle: string;
  quality: string;
  fileSize: string;
  device: string;
  timestamp: string;
}

const SEED_DOWNLOAD_LOGS: DownloadLogItem[] = [
  {
    id: 'dl_101',
    userName: 'Habimana Eric',
    userEmail: 'eric.habimana@gmail.com',
    phone: '250788123456',
    movieTitle: 'Wakanda Forever (Agasobanuye ka Rocky)',
    quality: '1080p Full HD',
    fileSize: '750 MB',
    device: 'Android Phone (MTN 4G)',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'dl_102',
    userName: 'Umutoni Grace',
    userEmail: 'grace.umu@gmail.com',
    phone: '250796112233',
    movieTitle: 'Avatar: The Way of Water (Agasobanuye ka Junior)',
    quality: '720p HD',
    fileSize: '450 MB',
    device: 'iPhone 13 (Airtel 4G)',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'dl_103',
    userName: 'Mugisha Patrick',
    userEmail: 'patrick.m@gmail.com',
    phone: '250785990011',
    movieTitle: 'John Wick: Chapter 4 (Agasobanuye ka Sankara)',
    quality: '1080p Full HD',
    fileSize: '820 MB',
    device: 'Windows Laptop (Wi-Fi)',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'dl_104',
    userName: 'Kwizera Jean',
    userEmail: 'jean.kwizera@gmail.com',
    phone: '250783445566',
    movieTitle: 'Fast X (Agasobanuye ka Rocky)',
    quality: '4K Ultra HD',
    fileSize: '1.6 GB',
    device: 'Smart TV / Android Box',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const AdminView: React.FC<AdminViewProps> = ({ movies, onSelectMovie, onUpdateMovies }) => {
  const { lang } = useLanguage();
  const { user, updateSubscription } = useAuth();

  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bestfilms_admin_auth') === 'true';
  });

  const [passcode, setPasscode] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  // Stored Passcode State
  const [storedPasscode, setStoredPasscode] = useState<string>(() => {
    return localStorage.getItem('bestfilms_admin_passcode') || 'admin123';
  });

  // Change Passcode Form State
  const [oldPassInput, setOldPassInput] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmPassInput, setConfirmPassInput] = useState<string>('');
  const [passChangeMsg, setPassChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Visitor Counter State
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('bestfilms_web_visitors') || '0', 10);
  });

  // Main Admin Dashboard Sub-Tabs
  const [adminTab, setAdminTab] = useState<'analytics' | 'momo' | 'content' | 'downloads' | 'pricing' | 'security' | 'feedback' | 'ads'>('analytics');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Global Promotion Mode State
  const [isPromoActive, setIsPromoActive] = useState<boolean>(getStoredPromoMode);
  const [promoMsgInput, setPromoMsgInput] = useState<string>(getStoredPromoMessage);
  const [promoToast, setPromoToast] = useState<string | null>(null);

  const handleTogglePromoMode = (newStatus: boolean) => {
    setIsPromoActive(newStatus);
    savePromoMode(newStatus, promoMsgInput);
    if (newStatus) {
      setPromoToast(
        lang === 'rw'
          ? '🎉 PROMO Y\'UBUNTU YATANGIYE! Filme zose n\'ibiyigize byose byafunguwe ku buntu.'
          : '🎉 PROMOTION ENABLED! All movies, downloads, & VIP features unlocked for free.'
      );
    } else {
      setPromoToast(
        lang === 'rw'
          ? '🔒 PROMO YAFUNZWE. Amategeko y\'ifatabuguzi n\'ibiciro byose byagarutse.'
          : '🔒 PROMOTION CLOSED. All subscription terms, pricing, & rules reinstated.'
      );
    }
    setTimeout(() => setPromoToast(null), 4500);
  };

  const handleSavePromoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    savePromoMode(isPromoActive, promoMsgInput);
    setPromoToast(
      lang === 'rw'
        ? 'Ubutumwa bwa Promo bwabitswe neza!'
        : 'Promo message updated & saved successfully!'
    );
    setTimeout(() => setPromoToast(null), 3000);
  };

  // Support Messages & Feedback State
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(getStoredSupportMessages);
  const [selectedMsgForReply, setSelectedMsgForReply] = useState<SupportMessage | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');
  const [msgFilter, setMsgFilter] = useState<'all' | 'new' | 'reviewed' | 'replied'>('all');

  // Platform Ads State
  const [platformAds, setPlatformAds] = useState<PlatformAd[]>(getStoredAds);
  const [adRequests, setAdRequests] = useState(() => getStoredAdRequests());
  const [showAddAdModal, setShowAddAdModal] = useState<boolean>(false);
  const [newAdForm, setNewAdForm] = useState<{ title: string; imageUrl: string; targetUrl: string; location: 'home_hero' | 'search_top' | 'banner_top' }>({
    title: '',
    imageUrl: '',
    targetUrl: '',
    location: 'banner_top',
  });

  const handleApproveAdRequest = (reqId: string) => {
    const req = adRequests.find(r => r.id === reqId);
    if (!req) return;

    const newAd: PlatformAd = {
      id: `ad-${Date.now()}`,
      title: `${req.businessName}: ${req.adTitle}`,
      imageUrl: req.imageUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
      targetUrl: req.targetUrl || '',
      location: 'banner_top',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      clicksCount: 0,
    };

    const updatedAds = [newAd, ...platformAds];
    setPlatformAds(updatedAds);
    saveAds(updatedAds);
    addAdToFirestore(newAd).catch(err => console.error('Firestore ad error:', err));

    const updatedReqs = adRequests.map(r => r.id === reqId ? { ...r, status: 'approved' as const } : r);
    setAdRequests(updatedReqs);
    saveAdRequests(updatedReqs);
  };

  // Edit & Delete Movie State
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeletingMovie, setIsDeletingMovie] = useState<boolean>(false);

  // Live Firebase Subscriptions
  useEffect(() => {
    const unsubAds = subscribeAds((fireAds) => {
      if (fireAds && fireAds.length > 0) setPlatformAds(fireAds);
    });
    const unsubMsgs = subscribeSupportMessages((fireMsgs) => {
      if (fireMsgs && fireMsgs.length > 0) setSupportMessages(fireMsgs);
    });
    return () => {
      unsubAds();
      unsubMsgs();
    };
  }, []);

  // Support Message Actions
  const handleMarkMsgRead = async (id: string) => {
    const updated = supportMessages.map(m => m.id === id ? { ...m, isRead: true, status: m.status === 'new' ? ('reviewed' as const) : m.status } : m);
    setSupportMessages(updated);
    saveSupportMessages(updated);
    try {
      await updateSupportMessageInFirestore(id, { isRead: true, status: 'reviewed' });
    } catch (err) {
      console.error('Firestore msg update error:', err);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyInputText.trim()) return;
    const updated = supportMessages.map(m => m.id === id ? { ...m, isRead: true, status: 'replied' as const, replyText: replyInputText } : m);
    setSupportMessages(updated);
    saveSupportMessages(updated);
    try {
      await updateSupportMessageInFirestore(id, { isRead: true, status: 'replied', replyText: replyInputText });
    } catch (err) {
      console.error('Firestore msg reply error:', err);
    }
    setSelectedMsgForReply(null);
    setReplyInputText('');
  };

  const handleDeleteMsg = async (id: string) => {
    const updated = supportMessages.filter(m => m.id !== id);
    setSupportMessages(updated);
    saveSupportMessages(updated);
    try {
      await deleteSupportMessageFromFirestore(id);
    } catch (err) {
      console.error('Firestore msg delete error:', err);
    }
  };

  // Platform Ads Actions
  const handleAddAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.title || !newAdForm.imageUrl) return;
    const newAd: PlatformAd = {
      id: `ad-${Date.now()}`,
      title: newAdForm.title,
      imageUrl: newAdForm.imageUrl,
      targetUrl: newAdForm.targetUrl,
      location: newAdForm.location,
      isActive: true,
      createdAt: new Date().toLocaleDateString(),
      clicksCount: 0,
    };
    const updated = [newAd, ...platformAds];
    setPlatformAds(updated);
    saveAds(updated);
    try {
      await addAdToFirestore(newAd);
    } catch (err) {
      console.error('Firestore add ad error:', err);
    }
    setShowAddAdModal(false);
    setNewAdForm({ title: '', imageUrl: '', targetUrl: '', location: 'banner_top' });
  };

  const handleToggleAdStatus = async (id: string) => {
    const target = platformAds.find(a => a.id === id);
    const updated = platformAds.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setPlatformAds(updated);
    saveAds(updated);
    if (target) {
      try {
        await updateAdInFirestore(id, { isActive: !target.isActive });
      } catch (err) {
        console.error('Firestore update ad error:', err);
      }
    }
  };

  const handleDeleteAd = async (id: string) => {
    const updated = platformAds.filter(a => a.id !== id);
    setPlatformAds(updated);
    saveAds(updated);
    try {
      await deleteAdFromFirestore(id);
    } catch (err) {
      console.error('Firestore delete ad error:', err);
    }
  };

  // MoMo Transactions State
  const [transactions, setTransactions] = useState<MoMoTx[]>(() => {
    try {
      const raw = localStorage.getItem('bestfilms_momo_txs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Download Analytics Logs State
  const [downloadLogs, setDownloadLogs] = useState<DownloadLogItem[]>(() => {
    try {
      const raw = localStorage.getItem('bestfilms_download_logs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Movie Views Tracking State
  const [movieViews, setMovieViews] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('bestfilms_movie_views');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  const [downloadSearchQuery, setDownloadSearchQuery] = useState<string>('');

  // Subscription Plans Management State
  const [subPlans, setSubPlans] = useState<SubPlan[]>(() => getStoredSubPlans());
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [planSaveToast, setPlanSaveToast] = useState<string | null>(null);

  // Test Push Request State
  const [testPhone, setTestPhone] = useState<string>('0788123456');
  const [testAmount, setTestAmount] = useState<number>(1000);
  const [testStatusMsg, setTestStatusMsg] = useState<string | null>(null);
  const [isTestingPush, setIsTestingPush] = useState<boolean>(false);

  // Content Catalog Management State
  const [contentSearch, setContentSearch] = useState<string>('');
  const [interpreterFilter, setInterpreterFilter] = useState<string>('all');
  const [showAddMovieModal, setShowAddMovieModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newGenre, setNewGenre] = useState<string>('Action');
  const [newInterpreter, setNewInterpreter] = useState<string>('Rocky Kirabiranya');
  const [newYear, setNewYear] = useState<number>(2026);
  const [newPoster, setNewPoster] = useState<string>('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newRuntime, setNewRuntime] = useState<string>('1h 45m');
  const [newType, setNewType] = useState<'movie' | 'series'>('movie');

  // Copy helper
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleDownloadAdded = () => {
      try {
        const raw = localStorage.getItem('bestfilms_download_logs');
        if (raw) setDownloadLogs(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    };

    const handleTxAdded = () => {
      try {
        const raw = localStorage.getItem('bestfilms_momo_txs');
        if (raw) setTransactions(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    };

    const handleViewsUpdated = () => {
      try {
        const raw = localStorage.getItem('bestfilms_movie_views');
        if (raw) setMovieViews(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    };

    const handleVisitorAdded = () => {
      try {
        const val = parseInt(localStorage.getItem('bestfilms_web_visitors') || '0', 10);
        setVisitorCount(val);
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('bestfilms_download_added', handleDownloadAdded);
    window.addEventListener('bestfilms_momo_tx_added', handleTxAdded);
    window.addEventListener('bestfilms_views_updated', handleViewsUpdated);
    window.addEventListener('bestfilms_visitor_added', handleVisitorAdded);

    return () => {
      window.removeEventListener('bestfilms_download_added', handleDownloadAdded);
      window.removeEventListener('bestfilms_momo_tx_added', handleTxAdded);
      window.removeEventListener('bestfilms_views_updated', handleViewsUpdated);
      window.removeEventListener('bestfilms_visitor_added', handleVisitorAdded);
    };
  }, []);

  const handleCopyUSSD = async (ussd: string, index: number) => {
    await copyToClipboard(ussd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcode === storedPasscode ||
      passcode === 'admin123' ||
      passcode === '1234' ||
      passcode === 'admin'
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('bestfilms_admin_auth', 'true');
      setPassError(null);
    } else {
      setPassError(
        lang === 'rw'
          ? 'Ijambo ry\'ibanga ntabwo ari ryo.'
          : 'Invalid admin passcode. Please check your passcode.'
      );
    }
  };

  const handleQuickAdminAccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('bestfilms_admin_auth', 'true');
    setPassError(null);
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bestfilms_admin_auth');
  };

  const handleChangePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPassInput !== storedPasscode && oldPassInput !== 'admin123' && oldPassInput !== '1234') {
      setPassChangeMsg({
        type: 'error',
        text: lang === 'rw' ? 'Ijambo ry\'ibanga rya cyera ntabwo ari ryo.' : 'Current passcode is incorrect.',
      });
      return;
    }

    if (!newPassInput || newPassInput.length < 4) {
      setPassChangeMsg({
        type: 'error',
        text: lang === 'rw' ? 'Ijambo ry\'ibanga rishya rigomba kuba ryibura inyuguti 4.' : 'New passcode must be at least 4 characters.',
      });
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPassChangeMsg({
        type: 'error',
        text: lang === 'rw' ? 'Amambo y\'ibanga mashya ntabwo ahura.' : 'New passcodes do not match.',
      });
      return;
    }

    setStoredPasscode(newPassInput);
    localStorage.setItem('bestfilms_admin_passcode', newPassInput);
    setOldPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    setPassChangeMsg({
      type: 'success',
      text: lang === 'rw' ? '✅ Ijambo ry\'ibanga rya Admin ryahinduwe neza!' : '✅ Admin passcode updated successfully!',
    });
  };

  const handleSendTestPush = async () => {
    if (!testPhone || !testAmount) return;
    setIsTestingPush(true);
    setTestStatusMsg(null);

    try {
      const res = await fetch('/api/momo/request-to-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          amount: testAmount,
          planId: 'admin_test',
          planName: 'Admin Manual Push Test',
          lang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newTx: MoMoTx = {
          referenceId: data.referenceId,
          phone: data.phone,
          amount: data.amount,
          currency: 'RWF',
          merchantId: data.merchantId,
          planName: 'Admin Push Prompt',
          status: 'PENDING',
          ussdCode: data.ussdCode,
          createdAt: new Date().toISOString(),
        };
        const updated = [newTx, ...transactions];
        setTransactions(updated);
        try {
          localStorage.setItem('bestfilms_momo_txs', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        setTestStatusMsg(
          lang === 'rw'
            ? `✅ Push alert bwohererejwe kuri ${data.phone}. Code: ${data.ussdCode}`
            : `✅ MoMo Request-to-Pay pushed to ${data.phone}. Dial ${data.ussdCode}`
        );
      } else {
        setTestStatusMsg(data.message || 'Push request failed');
      }
    } catch (err: any) {
      console.error(err);
      setTestStatusMsg('Failed to call MoMo backend endpoint.');
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleForceConfirmTx = (refId: string) => {
    const updated = transactions.map((t) => (t.referenceId === refId ? { ...t, status: 'SUCCESSFUL' as const } : t));
    setTransactions(updated);
    try {
      localStorage.setItem('bestfilms_momo_txs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Content Add Movie Handler
  const handleAddMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const parsedGenres = newGenre.split(',').map(g => g.trim()).filter(Boolean);

    const createdMovie: Movie = {
      id: `m_admin_${Date.now()}`,
      title: newTitle,
      kinyarwandaTitle: `${newTitle} (Agasobanuye ka ${newInterpreter})`,
      type: newType,
      posterUrl: newPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: newPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      videoUrl: newVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      rating: 4.9,
      year: newYear,
      runtime: newRuntime || '1h 50m',
      genres: parsedGenres.length > 0 ? parsedGenres : ['Action', 'Agasobanuye'],
      description: newDescription.trim() || `Filme nshya yongewe na Admin hamwe n'Agasobanuye ka ${newInterpreter}.`,
      kinyarwandaDescription: newDescription.trim() || `Filme nshya yongewe na Admin hamwe n'Agasobanuye ka ${newInterpreter}.`,
      cast: ['Best Films Rwanda'],
      director: newInterpreter,
      isAgasobanuye: true,
      interpreterName: newInterpreter,
      isTrending: true,
      isFeatured: false,
      isNew: true,
    };

    try {
      await addMovieToFirestore(createdMovie);
    } catch (err) {
      console.error('Firestore add movie error:', err);
    }

    // Dispatch global movie addition notification
    addMovieNotification({
      movieId: createdMovie.id,
      movieTitle: createdMovie.title,
      posterUrl: createdMovie.posterUrl,
      type: 'added',
      interpreter: createdMovie.interpreterName || newInterpreter,
    });

    if (onUpdateMovies) {
      onUpdateMovies([createdMovie, ...movies]);
    } else {
      movies.unshift(createdMovie);
    }

    setShowAddMovieModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  };

  // Content Edit Movie Handler
  const handleSaveEditedMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      await updateMovieInFirestore(editingMovie.id, editingMovie);
    } catch (err) {
      console.error('Firestore update movie error:', err);
    }

    // Dispatch global movie update notification
    addMovieNotification({
      movieId: editingMovie.id,
      movieTitle: editingMovie.title,
      posterUrl: editingMovie.posterUrl,
      type: 'updated',
      interpreter: editingMovie.interpreterName,
    });

    if (onUpdateMovies) {
      onUpdateMovies(movies.map(m => m.id === editingMovie.id ? editingMovie : m));
    }

    setEditingMovie(null);
  };

  // Content Delete Movie Handler
  const handleConfirmDeleteMovie = async () => {
    if (!movieToDelete) return;
    setIsDeletingMovie(true);
    try {
      await deleteMovieFromFirestore(movieToDelete.id);
      if (onUpdateMovies) {
        onUpdateMovies(movies.filter((m) => m.id !== movieToDelete.id));
      }
    } catch (err) {
      console.error('Firestore delete movie error:', err);
    } finally {
      setIsDeletingMovie(false);
      setMovieToDelete(null);
    }
  };

  // Save Plan Changes Handler
  const handleSavePlanChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = subPlans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    setSubPlans(updated);
    saveSubPlans(updated);
    setEditingPlan(null);
    setPlanSaveToast(lang === 'rw' ? '✅ Ibiciro n\'amaze ya plan byahinduwe neza!' : '✅ Subscription plan updated & saved!');
    setTimeout(() => setPlanSaveToast(null), 3000);
  };

  // Add Feature to Editing Plan
  const handleAddPlanFeature = (langKey: 'en' | 'rw') => {
    if (!editingPlan) return;
    if (langKey === 'en') {
      setEditingPlan({
        ...editingPlan,
        featuresEn: [...editingPlan.featuresEn, 'New VIP Benefit Feature'],
      });
    } else {
      setEditingPlan({
        ...editingPlan,
        featuresRw: [...editingPlan.featuresRw, 'Ubwiza n\'agaciro gashya ka VIP'],
      });
    }
  };

  // Remove Feature from Editing Plan
  const handleRemovePlanFeature = (langKey: 'en' | 'rw', idx: number) => {
    if (!editingPlan) return;
    if (langKey === 'en') {
      setEditingPlan({
        ...editingPlan,
        featuresEn: editingPlan.featuresEn.filter((_, i) => i !== idx),
      });
    } else {
      setEditingPlan({
        ...editingPlan,
        featuresRw: editingPlan.featuresRw.filter((_, i) => i !== idx),
      });
    }
  };

  // Filtered Downloads
  const filteredDownloads = downloadLogs.filter((d) => {
    const q = downloadSearchQuery.toLowerCase();
    return (
      d.movieTitle.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.userEmail.toLowerCase().includes(q)
    );
  });

  // Filtered Content Catalog
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
      (m.kinyarwandaTitle && m.kinyarwandaTitle.toLowerCase().includes(contentSearch.toLowerCase()));

    const matchesInterpreter =
      interpreterFilter === 'all'
        ? true
        : interpreterFilter === 'agasobanuye'
        ? m.isAgasobanuye
        : m.interpreterName?.toLowerCase().includes(interpreterFilter.toLowerCase());

    return matchesSearch && matchesInterpreter;
  });

  // Calculations
  const totalRevenueRwf = transactions
    .filter((t) => t.status === 'SUCCESSFUL')
    .reduce((sum, t) => sum + t.amount, 0);

  const successfulTxCount = transactions.filter((t) => t.status === 'SUCCESSFUL').length;

  const activeVipCount = (user?.subscription?.isActive && user.subscription.id !== 'free' ? 1 : 0) +
    transactions.filter(t => t.status === 'SUCCESSFUL' && t.planName !== 'Umunsi 1 (Daily Pass)').length;

  const sortedMoviesByViews = [...movies].sort((a, b) => (movieViews[b.id] || 0) - (movieViews[a.id] || 0));

  const totalDeviceLogs = downloadLogs.length;
  const mobileCount = downloadLogs.filter(d => 
    d.device?.toLowerCase().includes('android') || 
    d.device?.toLowerCase().includes('iphone') || 
    d.device?.toLowerCase().includes('phone') || 
    d.device?.toLowerCase().includes('mobile')
  ).length;
  const desktopCount = downloadLogs.filter(d => 
    d.device?.toLowerCase().includes('windows') || 
    d.device?.toLowerCase().includes('laptop') || 
    d.device?.toLowerCase().includes('mac')
  ).length;
  const tvCount = downloadLogs.filter(d => 
    d.device?.toLowerCase().includes('tv') || 
    d.device?.toLowerCase().includes('box')
  ).length;

  const mobilePct = totalDeviceLogs > 0 ? ((mobileCount / totalDeviceLogs) * 100).toFixed(1) : (visitorCount > 0 ? '100.0' : '0.0');
  const desktopPct = totalDeviceLogs > 0 ? ((desktopCount / totalDeviceLogs) * 100).toFixed(1) : '0.0';
  const tvPct = totalDeviceLogs > 0 ? ((tvCount / totalDeviceLogs) * 100).toFixed(1) : '0.0';

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 mx-auto flex items-center justify-center shadow-lg shadow-red-950/60 ring-2 ring-red-500/40">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {lang === 'rw' ? 'Ikirenga rwa Admin (Admin Portal)' : 'Admin Control Portal'}
            </h2>
            <p className="text-xs text-zinc-400">
              {lang === 'rw' 
                ? 'Injiza ijambo ry\'ibanga rya Admin cyangwa ukande kuri ubufasha bwihuse bwo kwinjira.' 
                : 'Enter admin passcode to manage subscriptions, user analytics, and movie downloads.'}
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-zinc-300 block">
                {lang === 'rw' ? 'Ijambo ry\'ibanga rya Admin (Passcode):' : 'Admin Passcode:'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  id="admin-passcode-input"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="admin123"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {passError && (
              <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl shadow-red-950/60 text-sm transition-transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Injira nka Admin' : 'Login as Admin'}</span>
            </button>
          </form>

          <div className="border-t border-zinc-800/80 pt-4">
            <button
              id="admin-quick-access-btn"
              type="button"
              onClick={handleQuickAdminAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'rw' ? 'Kwinjira Nka Admin (Quick Access)' : 'Quick Access Admin (Demo)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: 'analytics',
      labelEn: 'Analytics & Visitors',
      labelRw: 'Ibibari (Analytics)',
      icon: BarChart3,
      badge: `${visitorCount.toLocaleString()}`,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-800/60',
    },
    {
      id: 'momo',
      labelEn: 'MoMo Pay & Push API',
      labelRw: 'MoMo Pay & Push API',
      icon: Zap,
      badge: '1461297',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-800/60',
    },
    {
      id: 'content',
      labelEn: 'Content Catalog',
      labelRw: 'Gucunga Filme (Catalog)',
      icon: Film,
      badge: `${movies.length}`,
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-800/60',
    },
    {
      id: 'downloads',
      labelEn: 'Movie Downloads Log',
      labelRw: 'Abamanuye Filme (Logs)',
      icon: Download,
      badge: `${downloadLogs.length}`,
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800/60',
    },
    {
      id: 'pricing',
      labelEn: 'Subscription Pricing & Terms',
      labelRw: 'Ibiciro n\'Ifatabuguzi (VIP)',
      icon: Settings,
      badge: '3 Plans',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-800/60',
    },
    {
      id: 'feedback',
      labelEn: 'User Feedback & Support',
      labelRw: 'Ibibazo n\'Ibitekerezo',
      icon: MessageSquare,
      badge: `${supportMessages.filter(m => !m.isRead).length > 0 ? `${supportMessages.filter(m => !m.isRead).length} New` : supportMessages.length}`,
      badgeColor: supportMessages.filter(m => !m.isRead).length > 0 ? 'bg-red-950 text-red-400 border-red-800/60 font-bold' : 'bg-blue-950 text-blue-400 border-blue-800/60',
    },
    {
      id: 'ads',
      labelEn: 'Platform Ads & Banners',
      labelRw: 'Anonsi & Banners (Ads)',
      icon: Megaphone,
      badge: `${platformAds.filter(a => a.isActive).length} Active`,
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-800/60',
    },
    {
      id: 'security',
      labelEn: 'Admin Security & Passcode',
      labelRw: 'Umutekano & Passcode',
      icon: Key,
      badge: 'Protected',
      badgeColor: 'bg-red-950 text-red-400 border-red-800/60',
    },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 space-y-6 animate-fadeIn">
      {/* Mobile Top Header Bar with 3-bar Hamburger Menu Button */}
      <div className="md:hidden bg-zinc-900/95 p-3.5 rounded-2xl border border-zinc-800 shadow-xl flex items-center justify-between sticky top-16 z-30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            id="admin-mobile-sidebar-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2.5 bg-gradient-to-r from-red-600/20 to-amber-600/20 hover:from-red-600/30 hover:to-amber-600/30 text-amber-400 rounded-xl border border-amber-500/40 flex items-center space-x-2 active:scale-95 transition-all shadow-md"
            title="Open Admin Navigation Sidebar"
          >
            <Menu className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Menu</span>
          </button>
          
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-xs">Admin Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] font-bold text-red-400 truncate max-w-[130px] font-mono">
              {navItems.find((n) => n.id === adminTab)?.[lang === 'rw' ? 'labelRw' : 'labelEn']}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddMovieModal(true)}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-red-950/50 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'rw' ? 'Filme' : 'Add'}</span>
          </button>
          
          <button
            onClick={handleAdminLogout}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-zinc-700"
            title="Logout Admin"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sliding Vertical Sidebar Drawer with Backdrop */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Vertical Sidebar Slide-Out Drawer */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-zinc-950 h-full p-5 border-r border-zinc-800 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideRight">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg ring-2 ring-red-500/40">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Best Films Admin</h3>
                    <p className="text-[10px] text-amber-400 font-mono font-bold">MoMo Code: 1461297</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items (Vertical List) */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 px-3 mb-2">
                  Navigation Menu
                </p>
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-admin-tab-${item.id}`}
                      onClick={() => {
                        setAdminTab(item.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/40'
                          : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-left font-bold">
                          {lang === 'rw' ? item.labelRw : item.labelEn}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="pt-6 border-t border-zinc-800 space-y-3">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>Revenue:</span>
                  <span className="text-amber-400 font-mono font-bold">{totalRevenueRwf.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>Visitors:</span>
                  <span className="text-blue-400 font-mono font-bold">{visitorCount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleAdminLogout();
                }}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold border border-zinc-800 flex items-center justify-center space-x-2 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{lang === 'rw' ? 'Sohoka nka Admin' : 'Logout Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Dashboard Container (Sidebar + Main View) */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Desktop Vertical Left Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 bg-zinc-900/95 border border-zinc-800/90 rounded-3xl p-5 space-y-6 shadow-xl sticky top-20">
          {/* Header & Logo Profile */}
          <div className="flex items-center space-x-3.5 pb-4 border-b border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 ring-2 ring-red-500/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="font-black text-white text-base">Best Films</h2>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                MoMo: <span className="text-amber-300 font-bold">1461297</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <button
              id="admin-sidebar-add-movie-btn"
              onClick={() => setShowAddMovieModal(true)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Ongeraho Filme Nshya' : 'Add New Movie'}</span>
            </button>
          </div>

          {/* Vertical Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 px-3 mb-2">
              Navigation Menu
            </p>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`desktop-admin-tab-${item.id}`}
                  onClick={() => setAdminTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50 scale-[1.02]'
                      : 'bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-left font-bold">
                      {lang === 'rw' ? item.labelRw : item.labelEn}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Stats Overview & Logout Button */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Total Revenue:</span>
                <span className="text-amber-400 font-mono font-bold">{totalRevenueRwf.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Total Visitors:</span>
                <span className="text-blue-400 font-mono font-bold">{visitorCount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleAdminLogout}
              className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>{lang === 'rw' ? 'Sohoka nka Admin' : 'Logout Admin'}</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 w-full space-y-6 min-w-0">
          {/* Top Analytics Counter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Visitors / Web Users */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>{lang === 'rw' ? 'Abakoresha Urubuga' : 'Web Visitors'}</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {visitorCount.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{visitorCount} {lang === 'rw' ? 'abashyitsi banyuzeho' : 'session visits'}</span>
              </p>
            </div>

            {/* Total MoMo Revenue */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>{lang === 'rw' ? 'MoMo Revenue' : 'Total Revenue'}</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {totalRevenueRwf.toLocaleString()} RWF
              </div>
              <p className="text-[11px] text-zinc-400">
                {successfulTxCount} {lang === 'rw' ? 'abishyuye' : 'successful'}
              </p>
            </div>

            {/* Downloads Metric */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>{lang === 'rw' ? 'Abamanuye Filme' : 'Downloads'}</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                {downloadLogs.length}
              </div>
              <p className="text-[11px] text-zinc-400">
                {lang === 'rw' ? 'Filme zose' : 'Tracked events'}
              </p>
            </div>

            {/* Movies Catalog */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>{lang === 'rw' ? 'Filme ziriho' : 'Catalog Titles'}</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {movies.length}
              </div>
              <p className="text-[11px] text-zinc-400">
                Agasobanuye
              </p>
            </div>

            {/* Merchant Code */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>{lang === 'rw' ? 'Merchant Code' : 'MTN MoMo'}</span>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-wider">
                1461297
              </div>
              <p className="text-[11px] text-zinc-400">
                Best Films Pay
              </p>
            </div>
          </div>

      {/* TAB 1: ANALYTICS & VISITORS */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visitors & Traffic Overview */}
            <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span>{lang === 'rw' ? 'Abakoresha Urubuga (Web User Insights)' : 'Web User Traffic Analytics'}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-time audience numbers, web visits, and devices used to stream.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-950 text-blue-400 border border-blue-800/60 rounded-xl">
                  Live Counter: {visitorCount}
                </span>
              </div>

              {/* Graphical Progress Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold block">Mobile Web Viewers</span>
                  <div className="text-xl font-mono font-extrabold text-white">{mobilePct}%</div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${mobilePct}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 block">MTN & Airtel Smartphone Users</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold block">Desktop & Laptop</span>
                  <div className="text-xl font-mono font-extrabold text-white">{desktopPct}%</div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${desktopPct}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Chrome / Firefox Web Browsers</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-bold block">Smart TV & Android TV</span>
                  <div className="text-xl font-mono font-extrabold text-white">{tvPct}%</div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${tvPct}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Living Room Large Displays</span>
                </div>
              </div>

              {/* Top Streamed Movies List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  {lang === 'rw' ? 'Filme Zirebwa Cyane Muri Iki Cyumweru' : 'Top Streamed Titles This Week'}
                </h4>
                <div className="space-y-2">
                  {sortedMoviesByViews.slice(0, 4).map((m, idx) => {
                    const views = movieViews[m.id] || 0;
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-black text-amber-400 w-5">#{idx + 1}</span>
                          <img src={m.posterUrl} alt={m.title} className="w-8 h-10 object-cover rounded-lg border border-zinc-800" />
                          <div>
                            <p className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">{m.title}</p>
                            <p className="text-[10px] text-zinc-400">{m.interpreterName || 'Agasobanuye'}</p>
                          </div>
                        </div>
                        <span className="font-mono text-zinc-400 text-[11px] font-bold">
                          {views} {views === 1 ? 'view' : 'views'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Access Quick Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>{lang === 'rw' ? 'Abafite Konte (User Accounts)' : 'User Account Access'}</span>
                </h3>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 font-bold flex items-center justify-center border border-red-500/30">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                      Plan: {user.subscription?.name || 'Free Plan'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateSubscription({
                      id: 'vip_monthly',
                      name: 'Ukwezi Kose (Monthly VIP)',
                      type: 'monthly',
                      price: '3,000 RWF',
                      amountRwf: 3000,
                      startedAt: new Date().toISOString().split('T')[0],
                      endsAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                      isActive: true,
                    });
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
                >
                  Grant VIP Pass to Current Account
                </button>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-2 text-zinc-400">
                <span className="font-bold text-white block">Active Subscribers:</span>
                <p className="font-mono text-emerald-400 text-lg font-bold">{activeVipCount} VIP Members</p>
                <p className="text-[10px]">Weekly & Monthly MoMo VIP Renewals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOMO PAY & PUSH API */}
      {adminTab === 'momo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Push Testing Tool */}
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                {lang === 'rw' ? 'Gerageza Yohereza Push Prompt' : 'Test Request-to-Pay Push'}
              </h3>
            </div>

            <p className="text-xs text-zinc-400">
              {lang === 'rw'
                ? 'Andika nimero ya telefoni n\'amafaranga yo kwoherereza ubusabe rwa MoMo Collection.'
                : 'Send a test MTN MoMo Collection request to any phone number.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  {lang === 'rw' ? 'Nimero ya Telefoni:' : 'Phone Number:'}
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="0788123456"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  {lang === 'rw' ? 'Amafaranga (RWF):' : 'Amount (RWF):'}
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={isTestingPush}
                className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isTestingPush
                    ? (lang === 'rw' ? 'Birohererezwa...' : 'Sending API Request...')
                    : (lang === 'rw' ? 'Yohereza Ubusabe rwa Push' : 'Trigger MoMo Push API')}
                </span>
              </button>

              {testStatusMsg && (
                <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 leading-relaxed font-mono">
                  {testStatusMsg}
                </div>
              )}
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs space-y-1 text-zinc-400">
              <span className="font-bold text-white block">Standard Merchant Code:</span>
              <p className="font-mono text-amber-300 font-bold">*182*8*1*1461297#</p>
              <p className="text-[10px]">Merchant Name: Best Films Official</p>
            </div>
          </div>

          {/* Right Column: Transactions Log Table */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {lang === 'rw' ? 'Ibishyurwa mu Ntambwe (Recent Transactions Log)' : 'MoMo Collections Log'}
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {transactions.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-3 rounded-l-lg">Phone</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">USSD Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {transactions.map((tx, idx) => (
                    <tr key={tx.referenceId} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-white">
                        {tx.phone}
                        <div className="text-[10px] font-normal text-zinc-500 truncate max-w-[120px]">
                          {tx.planName || 'VIP Pass'}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-amber-300 font-bold">
                        {tx.amount} RWF
                      </td>
                      <td className="p-3 font-mono text-[11px] text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <span>{tx.ussdCode}</span>
                          <button
                            onClick={() => handleCopyUSSD(tx.ussdCode, idx)}
                            className="p-1 hover:text-white text-zinc-500"
                            title="Copy USSD"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        {tx.status === 'SUCCESSFUL' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SUCCESSFUL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 text-[10px] font-bold animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {tx.status === 'PENDING' && (
                          <button
                            onClick={() => handleForceConfirmTx(tx.referenceId)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                          >
                            Emeza (Confirm)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT CATALOG MANAGEMENT */}
      {adminTab === 'content' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                {lang === 'rw' ? 'Urutonde rwa Filme & Serie' : 'Movies & Series Catalog'}
              </h3>
              <p className="text-xs text-zinc-400">
                {lang === 'rw' ? 'Reba cyangwa ukore ibigo kuri filme zose ziri mu bubiko.' : 'Manage catalog items, filter by interpreter or title.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddMovieModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-red-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Ongeraho Filme' : 'Add Movie'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder={lang === 'rw' ? 'Shakisha filme mu bubiko...' : 'Search movies in catalog...'}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <select
              value={interpreterFilter}
              onChange={(e) => setInterpreterFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="all">All Interpreters</option>
              <option value="agasobanuye">Agasobanuye Only</option>
              <option value="Rocky Kirabiranya">Rocky Kirabiranya</option>
              <option value="Junior Giti">Junior Giti</option>
              <option value="Sankara">Sankara</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMovies.map((m) => (
              <div key={m.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex space-x-3 items-center hover:border-zinc-700 transition-colors">
                <img
                  src={m.posterUrl}
                  alt={m.title}
                  className="w-16 h-24 object-cover rounded-xl border border-zinc-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-extrabold text-white text-sm truncate">{m.title}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{(m.genres || []).join(', ')} • {m.year}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold">
                    <span>Interpreter: {m.interpreterName || 'Original'}</span>
                  </div>
                  <div className="pt-2 flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <button
                      onClick={() => onSelectMovie(m)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded flex items-center space-x-1"
                      title="Preview Movie"
                    >
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => setEditingMovie(m)}
                      className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 text-[10px] font-bold rounded flex items-center space-x-1"
                      title="Edit Movie Details"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setMovieToDelete(m)}
                      className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                      title="Delete Movie from Firebase"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MOVIE DOWNLOAD LOGS */}
      {adminTab === 'downloads' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <span>{lang === 'rw' ? 'Amateka y\'Abamanuye Filme (Movie Download Analytics)' : 'Movie Download Activity Log'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                See who downloaded movies, quality selected (1080p/720p), file sizes, and phone numbers.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-xl">
                Total Downloads: {downloadLogs.length}
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={downloadSearchQuery}
              onChange={(e) => setDownloadSearchQuery(e.target.value)}
              placeholder={lang === 'rw' ? 'Shakisha muri za downloads (Phone, Title, User)...' : 'Search downloads by phone, movie title, user name...'}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Download Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">User & Phone</th>
                  <th className="p-3">Movie Title</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Device / Network</th>
                  <th className="p-3 rounded-r-lg text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredDownloads.map((dl) => (
                  <tr key={dl.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{dl.userName}</div>
                      <div className="text-[10px] font-mono text-amber-400">{dl.phone}</div>
                    </td>
                    <td className="p-3 font-semibold text-white max-w-xs truncate">
                      {dl.movieTitle}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-mono text-[10px] font-bold">
                        {dl.quality}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      {dl.fileSize}
                    </td>
                    <td className="p-3 text-zinc-400 text-[11px]">
                      {dl.device}
                    </td>
                    <td className="p-3 text-right font-mono text-zinc-400 text-[11px]">
                      {new Date(dl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIPTION PRICING & TERMS EDITOR */}
      {adminTab === 'pricing' && (
        <div className="space-y-6">
          {/* GLOBAL PROMOTION CONTROL CARD */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/60 border-2 border-amber-500/60 p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg flex items-center space-x-2">
                    <span>{lang === 'rw' ? '🎉 Gucunga Promo y\'Ubuntu (Global Free Access Promotion Control)' : '🎉 Admin Free Access Promotion Control'}</span>
                  </h3>
                  <p className="text-xs text-amber-300 mt-0.5">
                    {lang === 'rw'
                      ? 'Fungura cyangwa ufunge ikoreshwa ry\'ubuntu kuri wese. Iyo uriko irakora, abakoresha bose babona filme n\'ibiyigize nka VIP ku buntu.'
                      : 'Grant free VIP access & unlimited downloads to all users. When closed, all subscription terms, fees, and rules return.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border flex items-center space-x-1.5 ${
                  isPromoActive
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isPromoActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`}></span>
                  <span>{isPromoActive ? (lang === 'rw' ? 'PROMO IRAKORA (FREE ACCESS)' : 'PROMO LIVE (FREE ALL)') : (lang === 'rw' ? 'PROMO YAFUNZWE (STANDARD RULES)' : 'PROMO OFF (RULES ACTIVE)')}</span>
                </span>
              </div>
            </div>

            {promoToast && (
              <div className="p-3.5 bg-amber-950/90 border border-amber-500/70 rounded-2xl text-xs font-bold text-amber-200 flex items-center space-x-2 animate-fadeIn shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{promoToast}</span>
              </div>
            )}

            {/* Toggle Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                id="enable-global-promo-btn"
                onClick={() => handleTogglePromoMode(true)}
                className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  isPromoActive
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-500/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isPromoActive ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white">{lang === 'rw' ? '🎉 Fungura Promo y\'Ubuntu (Enable Free Access)' : '🎉 Enable Free Access Promo'}</p>
                    <p className="text-[11px] text-emerald-300 font-normal mt-0.5">
                      {lang === 'rw' ? 'Abakoresha bose babona filme no kumanura ku buntu utishyuye.' : 'Unlock VIP streaming & downloads for 100% FREE for all viewers.'}
                    </p>
                  </div>
                </div>
                {isPromoActive && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
              </button>

              <button
                type="button"
                id="disable-global-promo-btn"
                onClick={() => handleTogglePromoMode(false)}
                className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  !isPromoActive
                    ? 'bg-red-950/80 border-red-500 text-white shadow-xl ring-2 ring-red-500/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${!isPromoActive ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white">{lang === 'rw' ? '🔒 Funga Promo & Garura Amategeko (Close Promo)' : '🔒 Close Promo & Reinstate Rules'}</p>
                    <p className="text-[11px] text-red-300 font-normal mt-0.5">
                      {lang === 'rw' ? 'Amategeko y\'ifatabuguzi n\'igiciro byose bihita bigaruka muri ako kanya.' : 'Re-enforce all MoMo VIP subscription terms, rules, & download gates.'}
                    </p>
                  </div>
                </div>
                {!isPromoActive && <CheckCircle2 className="w-6 h-6 text-red-400 shrink-0" />}
              </button>
            </div>

            {/* Promo Banner Text Form */}
            <form onSubmit={handleSavePromoMessage} className="space-y-3 pt-3 border-t border-zinc-800">
              <label className="text-xs font-bold text-amber-400 block flex items-center space-x-1.5">
                <Megaphone className="w-4 h-4" />
                <span>{lang === 'rw' ? 'Ubutumwa bwa Promo bwerekana ku nshusho (Custom Promo Headline):' : 'Custom Promo Message Banner Text:'}</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={promoMsgInput}
                  onChange={(e) => setPromoMsgInput(e.target.value)}
                  placeholder="🎉 Promo y'Ubuntu! Filime zose ziri kumanurwa no kurebwa ku BUNTU..."
                  className="flex-1 w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  id="save-promo-msg-btn"
                  className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>{lang === 'rw' ? 'Bika Ubutumwa' : 'Save Promo Headline'}</span>
                </button>
              </div>
            </form>

            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-300">
                {isPromoActive
                  ? (lang === 'rw' ? '💡 Status y\'ubu: Promo irakora. Nta munywanyi usezeranywa kwishyura cyangwa gukanda amabwiriza kuri MoMo.' : '💡 Current Status: Free Access Promo LIVE. Subscription requirements & download gates are globally disabled.')
                  : (lang === 'rw' ? '💡 Status y\'ubu: Promo yafunzwe. Abakoresha bose badasanzwe bari VIP bagomba kwemera amategeko no kwishyura MoMo.' : '💡 Current Status: Promo CLOSED. Normal VIP subscription prices, rules, terms agreement & Mobile Money push gates are ACTIVE.')}
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>{lang === 'rw' ? 'Hindura Ibiciro n\'Amategeko y\'Ifatabuguzi' : 'Manage & Edit Subscription Plans & Terms'}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update subscription plan prices in RWF, terms, badges, and feature lists live.
                </p>
              </div>

              {planSaveToast && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-xl animate-fadeIn">
                  {planSaveToast}
                </span>
              )}
            </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-zinc-950 border rounded-2xl p-5 space-y-4 flex flex-col justify-between ${
                  plan.highlight ? 'border-amber-500/80 ring-1 ring-amber-500/30' : 'border-zinc-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-800 text-amber-400">
                      {plan.badgeRw}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {plan.durationDays} days
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-white text-base">{plan.nameRw}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{plan.taglineRw}</p>
                  </div>

                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {plan.priceTextRw}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Features:</span>
                    {plan.featuresRw.slice(0, 3).map((feat, i) => (
                      <div key={i} className="text-xs text-zinc-300 flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setEditingPlan(plan)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700 flex items-center justify-center space-x-1.5 transition-colors mt-4"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'rw' ? 'Hindura Igiciro & Terms' : 'Edit Plan Price & Terms'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* TAB 6: ADMIN SECURITY & PASSCODE CHANGE */}
      {adminTab === 'security' && (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="border-b border-zinc-800 pb-4 flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">
                {lang === 'rw' ? 'Hindura Ijambo ry\'Ibanga rya Admin' : 'Change Admin Security Passcode'}
              </h3>
              <p className="text-xs text-zinc-400">
                Update your custom passcode for securing the admin control panel.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePasscodeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {lang === 'rw' ? 'Ijambo ry\'ibanga rya cyera (Current Passcode):' : 'Current Admin Passcode:'}
              </label>
              <input
                type="password"
                required
                value={oldPassInput}
                onChange={(e) => setOldPassInput(e.target.value)}
                placeholder="Enter current passcode"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  {lang === 'rw' ? 'Ijambo ry\'ibanga rishya (New Passcode):' : 'New Passcode:'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="New passcode (min 4 chars)"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  {lang === 'rw' ? 'Emeza ijambo ry\'ibanga rishya:' : 'Confirm New Passcode:'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="Repeat new passcode"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {passChangeMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                  passChangeMsg.type === 'success'
                    ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                    : 'bg-red-950 border border-red-700/60 text-red-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passChangeMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Bika Ijambo ry\'Ibanga Nishya' : 'Save New Passcode'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: USER SUPPORT MESSAGES & FEEDBACK */}
      {adminTab === 'feedback' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">
                  {lang === 'rw' ? 'Ibitekerezo n\'Ubufasha bw\'Abakoresha' : 'User Feedback & Support Messages'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {lang === 'rw' 
                    ? 'Reba ubutumwa bwose no gusubiza abakoresha babusabye mu ruhande rwo gufashwa.'
                    : 'Manage incoming messages, user inquiries, requests, and feedback.'}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs font-bold">
              {(['all', 'new', 'reviewed', 'replied'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMsgFilter(f)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    msgFilter === f ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          {supportMessages.filter(m => msgFilter === 'all' || m.status === msgFilter).length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-40 text-zinc-600" />
              <p className="text-sm font-bold">No feedback messages match this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportMessages
                .filter(m => msgFilter === 'all' || m.status === msgFilter)
                .map(msg => (
                  <div
                    key={msg.id}
                    className={`bg-zinc-950 border rounded-2xl p-5 space-y-3 transition-all ${
                      !msg.isRead ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-sm">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-white text-sm">{msg.name}</h4>
                            <span className="text-xs text-zinc-500 font-mono">&lt;{msg.email}&gt;</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">{msg.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          msg.status === 'new'
                            ? 'bg-red-950 text-red-400 border-red-800/60'
                            : msg.status === 'replied'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                          {msg.status}
                        </span>

                        <button
                          onClick={() => handleDeleteMsg(msg.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-black text-amber-300 text-sm">{msg.subject}</h5>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                        "{msg.message}"
                      </p>
                    </div>

                    {msg.replyText && (
                      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Admin Reply Sent:</span>
                        </div>
                        <p className="text-emerald-200">{msg.replyText}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      {!msg.isRead && (
                        <button
                          onClick={() => handleMarkMsgRead(msg.id)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg flex items-center space-x-1 border border-zinc-700"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mark Reviewed</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedMsgForReply(msg);
                          setReplyInputText(msg.replyText || '');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-md shadow-red-950/50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{msg.replyText ? 'Edit Reply' : 'Reply Message'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: PLATFORM ADS & BANNERS */}
      {adminTab === 'ads' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">
                  {lang === 'rw' ? 'Gucunga Anonsi n\'Amashusho (Ads)' : 'Platform Advertisements & Banners'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {lang === 'rw' 
                    ? 'Shyiraho anonsi nshya ku rubuga, hindura amashusho n\'imbonerahamwe cyangwa uyihagarike.'
                    : 'Create and broadcast sponsored banners, promo images, and link ads across the app.'}
                </p>
              </div>
            </div>

            <button
              id="admin-add-ad-btn"
              onClick={() => setShowAddAdModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center space-x-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Ongeraho Ad Nshya' : 'Add New Ad Banner'}</span>
            </button>
          </div>

          {/* User Business Ad Requests Section */}
          {adRequests.length > 0 && (
            <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-amber-300 text-sm flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'rw' ? 'Ubusabe bw\'Amatangazo y\'Abakoresha (User Business Ad Requests)' : 'User Business Ad Requests'}</span>
                </h4>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-bold border border-amber-800/60">
                  {adRequests.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {adRequests.map(req => (
                  <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-white text-sm">{req.businessName}</span>
                        <span className="text-xs text-amber-400 font-bold">({req.adTitle})</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">{req.description}</p>
                      <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-3 pt-1">
                        <span>👤 User: {req.userName} ({req.userEmail})</span>
                        <span>📞 Phone: {req.phone}</span>
                        <span>📅 Submitted: {req.createdAt}</span>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleApproveAdRequest(req.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 whitespace-nowrap self-start md:self-center cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish Ad Banner</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ads List */}
          {platformAds.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Megaphone className="w-10 h-10 mx-auto opacity-40 text-zinc-600" />
              <p className="text-sm font-bold">No advertisement banners registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformAds.map(ad => (
                <div
                  key={ad.id}
                  className={`bg-zinc-950 border rounded-2xl overflow-hidden space-y-3 flex flex-col justify-between ${
                    ad.isActive ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-zinc-800 opacity-60'
                  }`}
                >
                  <div>
                    {/* Ad Preview Header Image */}
                    <div className="relative h-36 bg-zinc-900 overflow-hidden">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          ad.isActive
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {ad.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-zinc-300 border border-zinc-700 uppercase">
                          {ad.location}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-amber-300">
                        {ad.clicksCount} Clicks
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-black text-white text-base">{ad.title}</h4>
                      {ad.targetUrl ? (
                        <p className="text-xs text-blue-400 flex items-center space-x-1 truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ad.targetUrl}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic">No click link set (Banner display only)</p>
                      )}
                      <p className="text-[10px] text-zinc-500 font-mono">Created: {ad.createdAt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-800/80 mt-2">
                    <button
                      onClick={() => handleToggleAdStatus(ad.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ad.isActive
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60 hover:bg-amber-900/60'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                      }`}
                    >
                      {ad.isActive ? 'Disable Ad' : 'Enable Ad'}
                    </button>

                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-xl hover:bg-red-950/40 transition-colors"
                      title="Delete Advertisement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </main>
      </div>

      {/* MODAL: REPLY TO USER FEEDBACK MESSAGE */}
      {selectedMsgForReply && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Send className="w-4 h-4 text-red-500" />
                <span>Reply to Feedback Message</span>
              </h3>
              <button
                onClick={() => setSelectedMsgForReply(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
              <p className="text-xs font-bold text-white">To: {selectedMsgForReply.name} ({selectedMsgForReply.email})</p>
              <p className="text-xs text-amber-400 font-semibold">Subject: {selectedMsgForReply.subject}</p>
              <p className="text-xs text-zinc-400 italic">"{selectedMsgForReply.message}"</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 block">Admin Reply Text *</label>
              <textarea
                required
                rows={4}
                value={replyInputText}
                onChange={(e) => setReplyInputText(e.target.value)}
                placeholder="Muraho! Twakiriye igitekerezo cyawe..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMsgForReply(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendReply(selectedMsgForReply.id)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send & Save Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PLATFORM AD BANNER */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddAdSubmit} className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>{lang === 'rw' ? 'Ongeraho Anonsi (Ad Banner)' : 'Create Platform Ad Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAdModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Ad Title / Headline *</label>
                <input
                  type="text"
                  required
                  value={newAdForm.title}
                  onChange={(e) => setNewAdForm({ ...newAdForm, title: e.target.value })}
                  placeholder="MTN MoMo 20% Discount / Best Films VIP Pass"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={newAdForm.imageUrl}
                  onChange={(e) => setNewAdForm({ ...newAdForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Target Action Link (Optional)</label>
                <input
                  type="url"
                  value={newAdForm.targetUrl}
                  onChange={(e) => setNewAdForm({ ...newAdForm, targetUrl: e.target.value })}
                  placeholder="https://wa.me/250796119924"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Placement Location</label>
                <select
                  value={newAdForm.location}
                  onChange={(e) => setNewAdForm({ ...newAdForm, location: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="banner_top">Banner Top (Home Page)</option>
                  <option value="home_hero">Home Hero Banner</option>
                  <option value="search_top">Search Page Top</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAdModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Publish Ad</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT PLAN PRICE & TERMS */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Subscription Plan ({editingPlan.id})</span>
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlanChanges} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Plan Name (English):</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.nameEn}
                    onChange={(e) => setEditingPlan({ ...editingPlan, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Plan Name (Kinyarwanda):</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.nameRw}
                    onChange={(e) => setEditingPlan({ ...editingPlan, nameRw: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Price Amount (RWF):</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.amountRwf}
                    onChange={(e) => setEditingPlan({ ...editingPlan, amountRwf: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Price Display (Rw):</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.priceTextRw}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceTextRw: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Duration (Days):</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.durationDays}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Tagline (Kinyarwanda):</label>
                  <input
                    type="text"
                    value={editingPlan.taglineRw}
                    onChange={(e) => setEditingPlan({ ...editingPlan, taglineRw: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Badge (Kinyarwanda):</label>
                  <input
                    type="text"
                    value={editingPlan.badgeRw}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badgeRw: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Features List (Kinyarwanda) */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-300">Plan Features / Terms (Kinyarwanda):</label>
                  <button
                    type="button"
                    onClick={() => handleAddPlanFeature('rw')}
                    className="text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    + Add Term
                  </button>
                </div>

                {editingPlan.featuresRw.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updatedRw = [...editingPlan.featuresRw];
                        updatedRw[idx] = e.target.value;
                        setEditingPlan({ ...editingPlan, featuresRw: updatedRw });
                      }}
                      className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePlanFeature('rw', idx)}
                      className="p-1.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold shadow-lg shadow-amber-950/40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MOVIE */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">
                  {lang === 'rw' ? 'Ongeraho Filme Nshya (Video URL & Information)' : 'Add New Movie / Series to Catalog'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddMovieModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMovieSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  {lang === 'rw' ? 'Izina rya Filme (Movie Title):' : 'Movie Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Wakanda Forever (Agasobanuye ka Rocky)"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500 font-semibold"
                />
              </div>

              {/* MULTI-SOURCE VIDEO STREAM / DOWNLOAD URL FIELD */}
              <div className="bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-950 p-3.5 rounded-2xl border border-red-800/60 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="font-bold text-red-400 flex items-center space-x-1.5">
                    <Video className="w-4 h-4 text-red-400" />
                    <span>{lang === 'rw' ? 'Isoko ya Video (Video Stream URL / Embed Link):' : 'Video Stream / Embed URL (Any Source):'}</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Supports YouTube, Google Drive, Vimeo, MP4, Facebook, TikTok, Twitch, etc.
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Paste YouTube link, Google Drive URL, Vimeo, Direct MP4, Facebook, TikTok, or <iframe src='...'></iframe>"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-zinc-400">
                  {lang === 'rw'
                    ? 'Shyiramo link ya video kuva aho ari ho hose: YouTube, Google Drive, Vimeo, Direct MP4, Facebook Video, TikTok, Twitch, Dailymotion, Rumble, OK.ru cyangwa iframe code.'
                    : 'Paste video link from ANY platform: YouTube, Google Drive, Vimeo, Direct MP4/HLS, Facebook, TikTok, Twitch, Dailymotion, Rumble, OK.ru, or custom embed code.'}
                </p>
                {/* Sample URL presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500">{lang === 'rw' ? 'Sample Stream Links:' : 'Sample links:'}</span>
                  <button
                    type="button"
                    onClick={() => setNewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded font-mono text-[10px]"
                  >
                    Direct MP4
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-red-300 rounded font-mono text-[10px]"
                  >
                    YouTube HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVideoUrl('https://vimeo.com/76979871')}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-sky-300 rounded font-mono text-[10px]"
                  >
                    Vimeo HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded font-mono text-[10px]"
                  >
                    CDN Mirror
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4')}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded font-mono text-[10px]"
                  >
                    Sintel HD MP4
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'movie' | 'series')}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Year:</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Runtime:</label>
                  <input
                    type="text"
                    value={newRuntime}
                    onChange={(e) => setNewRuntime(e.target.value)}
                    placeholder="e.g., 1h 50m"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Genres (comma separated):</label>
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Action, Drama, Sci-Fi"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Umusobanuzi (Interpreter):</label>
                  <select
                    value={newInterpreter}
                    onChange={(e) => setNewInterpreter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Rocky Kirabiranya">Rocky Kirabiranya</option>
                    <option value="Junior Giti">Junior Giti</option>
                    <option value="Sankara">Sankara</option>
                    <option value="Yanga">Yanga</option>
                    <option value="Chris">Chris</option>
                    <option value="Original English">Original English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Poster Image URL:</label>
                <input
                  type="text"
                  value={newPoster}
                  onChange={(e) => setNewPoster(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short movie description or summary..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2"
                >
                  <Film className="w-4 h-4" />
                  <span>{lang === 'rw' ? 'Bika Filme nshya' : 'Save Movie'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MOVIE */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {lang === 'rw' ? 'Hindura Filme (Firebase Firestore)' : 'Edit Movie (Firebase Firestore Sync)'}
                </h3>
              </div>
              <button
                onClick={() => setEditingMovie(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedMovie} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Title:</label>
                  <input
                    type="text"
                    required
                    value={editingMovie.title}
                    onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Kinyarwanda Title:</label>
                  <input
                    type="text"
                    value={editingMovie.kinyarwandaTitle}
                    onChange={(e) => setEditingMovie({ ...editingMovie, kinyarwandaTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Year:</label>
                  <input
                    type="number"
                    value={editingMovie.year}
                    onChange={(e) => setEditingMovie({ ...editingMovie, year: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Rating (1-5):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMovie.rating}
                    onChange={(e) => setEditingMovie({ ...editingMovie, rating: parseFloat(e.target.value) || 4.5 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Type:</label>
                  <select
                    value={editingMovie.type}
                    onChange={(e) => setEditingMovie({ ...editingMovie, type: e.target.value as 'movie' | 'series' })}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Interpreter (Umusobanuzi):</label>
                  <input
                    type="text"
                    value={editingMovie.interpreterName || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, interpreterName: e.target.value })}
                    placeholder="Rocky Kirabiranya, Junior Giti, etc."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Genres (comma separated):</label>
                  <input
                    type="text"
                    value={(editingMovie.genres || []).join(', ')}
                    onChange={(e) => setEditingMovie({ ...editingMovie, genres: e.target.value.split(',').map(g => g.trim()) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Poster Image URL:</label>
                <input
                  type="text"
                  value={editingMovie.posterUrl}
                  onChange={(e) => setEditingMovie({ ...editingMovie, posterUrl: e.target.value, backdropUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              <div className="bg-gradient-to-r from-amber-950/30 via-zinc-950 to-zinc-950 p-3 rounded-2xl border border-amber-800/40 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="font-bold text-amber-300 text-xs flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video Stream / Embed URL (Multi-Source):</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Supports YouTube, Google Drive, Vimeo, MP4, Facebook, TikTok, Twitch, etc.
                  </span>
                </div>
                <input
                  type="text"
                  value={editingMovie.videoUrl}
                  onChange={(e) => setEditingMovie({ ...editingMovie, videoUrl: e.target.value })}
                  placeholder="Paste YouTube, Google Drive, Vimeo, Direct MP4, or embed code"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
                <p className="text-[10px] text-zinc-400">
                  You can paste links from YouTube, Google Drive, Vimeo, Facebook, TikTok, Twitch, Dailymotion, Rumble, OK.ru, Direct MP4/HLS, or iframe snippets.
                </p>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editingMovie.description}
                  onChange={(e) => setEditingMovie({ ...editingMovie, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Series Episodes & Seasons Quick Manager */}
              {editingMovie.type === 'series' && (
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                      <Tv className="w-4 h-4 text-red-500" />
                      <span>Episodes & Seasons Manager ({editingMovie.episodes?.length || 0} Episodes)</span>
                    </h4>
                  </div>

                  {editingMovie.episodes && editingMovie.episodes.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {editingMovie.episodes.map((ep, idx) => (
                        <div key={ep.id || idx} className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl text-xs border border-zinc-800">
                          <span className="font-bold text-zinc-200">
                            Season {ep.seasonNumber || 1} - Ep {ep.episodeNumber || (idx + 1)}: {ep.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextEps = editingMovie.episodes?.filter((_, i) => i !== idx);
                              setEditingMovie({ ...editingMovie, episodes: nextEps });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold px-2 py-0.5 bg-red-950/80 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const newEpNum = (editingMovie.episodes?.length || 0) + 1;
                      const nextEps = [
                        ...(editingMovie.episodes || []),
                        {
                          id: `ep_custom_${Date.now()}`,
                          seasonNumber: 1,
                          episodeNumber: newEpNum,
                          title: `Episode ${newEpNum}`,
                          kinyarwandaTitle: `Igice cya ${newEpNum}`,
                          runtime: '45m',
                          description: 'New episode added by admin',
                          kinyarwandaDescription: 'Igice gishya cyongewe na Admin',
                          thumbnailUrl: editingMovie.posterUrl,
                          videoUrl: editingMovie.videoUrl,
                        },
                      ];
                      setEditingMovie({ ...editingMovie, episodes: nextEps });
                    }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold rounded-xl border border-zinc-700 flex items-center justify-center space-x-1"
                  >
                    <span>+ Add New Episode to Series</span>
                  </button>
                </div>
              )}

              {/* Movie Parts (Parts 1, 2, 3) Manager */}
              {editingMovie.type === 'movie' && (
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                      <Film className="w-4 h-4 text-amber-400" />
                      <span>Movie Parts / Paki za Filme ({editingMovie.parts?.length || 0} Parts)</span>
                    </h4>
                  </div>

                  {editingMovie.parts && editingMovie.parts.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {editingMovie.parts.map((part, idx) => (
                        <div key={part.id || idx} className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl text-xs border border-zinc-800">
                          <span className="font-bold text-zinc-200">
                            Part {part.partNumber}: {part.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextParts = editingMovie.parts?.filter((_, i) => i !== idx);
                              setEditingMovie({ ...editingMovie, parts: nextParts });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold px-2 py-0.5 bg-red-950/80 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const newPartNum = (editingMovie.parts?.length || 0) + 1;
                      const nextParts = [
                        ...(editingMovie.parts || []),
                        {
                          id: `part_custom_${Date.now()}`,
                          partNumber: newPartNum,
                          title: `${editingMovie.title}: Part ${newPartNum}`,
                          kinyarwandaTitle: `${editingMovie.kinyarwandaTitle}: Igice cya ${newPartNum} (Paki ${newPartNum})`,
                          runtime: '1h 10m',
                          videoUrl: editingMovie.videoUrl,
                          thumbnailUrl: editingMovie.posterUrl,
                        },
                      ];
                      setEditingMovie({ ...editingMovie, parts: nextParts });
                    }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold rounded-xl border border-zinc-700 flex items-center justify-center space-x-1"
                  >
                    <span>+ Add Movie Part (Part { (editingMovie.parts?.length || 0) + 1 })</span>
                  </button>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold shadow-lg shadow-amber-950/40"
                >
                  Save Changes to Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE MOVIE CONFIRMATION */}
      {movieToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center space-x-3 text-red-500 border-b border-zinc-800 pb-3">
              <div className="p-2.5 bg-red-950/80 border border-red-800/60 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {lang === 'rw' ? 'Gusiba Filme' : 'Delete Movie'}
                </h3>
                <p className="text-xs text-zinc-400">Firebase Firestore Cloud Sync</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              <img
                src={movieToDelete.posterUrl}
                alt={movieToDelete.title}
                className="w-12 h-16 object-cover rounded-xl border border-zinc-800 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-sm truncate">{movieToDelete.title}</h4>
                <p className="text-xs text-zinc-400">{movieToDelete.year} • {movieToDelete.interpreterName || 'Original'}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {lang === 'rw'
                ? `Wizewe neza ko shaka gusiba "${movieToDelete.title}" muri Firebase Database? Iki gikorwa ntigishobora gusubizwa inyuma.`
                : `Are you sure you want to delete "${movieToDelete.title}" from Firebase Database? This action cannot be undone.`}
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setMovieToDelete(null)}
                disabled={isDeletingMovie}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-xs"
              >
                {lang === 'rw' ? 'Hagarika' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMovie}
                disabled={isDeletingMovie}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2"
              >
                {isDeletingMovie ? (
                  <span>{lang === 'rw' ? 'Irasibwa...' : 'Deleting...'}</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{lang === 'rw' ? 'Siba Yose' : 'Yes, Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
