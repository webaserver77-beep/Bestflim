import React, { useState, useEffect } from 'react';
import { Movie, SubscriptionPlan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNetworkDownloadMonitor } from '../hooks/useNetworkDownloadMonitor';
import { getStoredPromoMode, getStoredPromoMessage } from '../data/subscriptionPlans';
import { 
  Download, Zap, Wifi, Server, CheckCircle2, Gauge, 
  Layers, ShieldCheck, X, Sparkles, Check, ArrowRight, ExternalLink, HardDrive,
  Lock, AlertCircle, Smartphone, Send, CreditCard
} from 'lucide-react';

interface DownloadSpeedModalProps {
  movie: Movie;
  videoUrl?: string;
  customTitle?: string;
  onClose: () => void;
}

export const DownloadSpeedModal: React.FC<DownloadSpeedModalProps> = ({ 
  movie, 
  videoUrl, 
  customTitle, 
  onClose 
}) => {
  const { lang } = useLanguage();
  const { user, updateSubscription } = useAuth();
  const { addToQueue } = useNetworkDownloadMonitor();

  const [selectedServer, setSelectedServer] = useState<'kigali_cdn' | 'global_multi' | 'cloudflare_edge'>('kigali_cdn');
  const [selectedQuality, setSelectedQuality] = useState<'480p' | '720p' | '1080p' | '4k'>('720p');
  const [turboBoostEnabled, setTurboBoostEnabled] = useState<boolean>(true);

  // Global Promotion Mode State
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

  // VIP Subscription & Terms Acceptance Gate State
  const hasVipSubscription = Boolean(
    user?.subscription?.isActive && 
    (user?.subscription?.type === 'vip' || (user?.subscription?.id && user?.subscription?.id !== 'free'))
  );

  const isEffectivelyVip = isPromoModeActive || hasVipSubscription;

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [selectedVipPlan, setSelectedVipPlan] = useState<'weekly_vip' | 'monthly_vip'>('weekly_vip');
  const [momoPhone, setMomoPhone] = useState<string>('0788123456');
  const [subGateStep, setSubGateStep] = useState<'form' | 'momo_pin' | 'unlocked'>('form');
  const [momoPin, setMomoPin] = useState<string>('');
  const [momoRefId, setMomoRefId] = useState<string | null>(null);
  const [isProcessingSub, setIsProcessingSub] = useState<boolean>(false);
  const [subGateError, setSubGateError] = useState<string | null>(null);

  // Poll transaction status
  useEffect(() => {
    let intervalId: any = null;
    if (subGateStep === 'momo_pin' && momoRefId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/momo/status/${momoRefId}`);
          const data = await res.json();
          if (res.ok && data.success && data.transaction) {
            if (data.transaction.status === 'SUCCESSFUL') {
              clearInterval(intervalId);
              handleConfirmPinAndActivate();
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [subGateStep, momoRefId]);

  // Download simulation state
  const [isDownloading, setIsDownloading] = useState<boolean>(true);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(38.4);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const displayTitle = customTitle || (lang === 'rw' && movie.kinyarwandaTitle ? movie.kinyarwandaTitle : movie.title);
  const activeUrl = videoUrl || movie.videoUrl;

  const qualityInfo = {
    '480p': { label: '480p Fast Saver', size: '240 MB', estTime: '8 - 12 sec', speedRatio: 'High Speed' },
    '720p': { label: '720p HD Turbo', size: '480 MB', estTime: '15 - 20 sec', speedRatio: 'Ultra Fast' },
    '1080p': { label: '1080p Full HD Direct', size: '890 MB', estTime: '25 - 35 sec', speedRatio: 'Max Quality' },
    '4k': { label: '4K Master Multi-Thread', size: '1.8 GB', estTime: '50 - 70 sec', speedRatio: 'Master Original' },
  };

  const triggerActualDownload = async (url: string, title: string, quality: string) => {
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTitle}_${quality}_Turbo.mp4`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&quality=${encodeURIComponent(quality)}`;

    try {
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Trigger actual download error:', e);
      window.open(proxyUrl, '_self');
    }
  };

  // Auto-start download immediately upon mounting without asking anything
  useEffect(() => {
    handleStartDownloadDirectly();
  }, []);

  const handleStartDownloadDirectly = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setIsCompleted(false);
    setDownloadStep(lang === 'rw' ? 'Guhuza na Kigali Direct Turbo CDN Node...' : 'Connecting to Kigali Direct Turbo CDN Node...');

    // Register in persistent network download queue monitor
    addToQueue(displayTitle, activeUrl, selectedQuality || 'HD');

    // Trigger immediate browser download trigger as well
    triggerActualDownload(activeUrl, displayTitle, selectedQuality || 'HD');

    const baseSpeed = 52.6;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 22) + 15;
      const speedVariation = (baseSpeed + (Math.random() * 8 - 4)).toFixed(1);
      setCurrentSpeed(parseFloat(speedVariation));

      if (progress >= 30 && progress < 60) {
        setDownloadStep(lang === 'rw' ? 'Kurura imihora icyarimwe (Multi-Thread Direct Download)...' : 'Streaming Parallel Threads (Multi-Thread Downloading)...');
      } else if (progress >= 60 && progress < 90) {
        setDownloadStep(lang === 'rw' ? 'Kubika muri cache y\'amashusho yihuta...' : 'Buffering high-speed media stream...');
      } else if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setDownloadStep(lang === 'rw' ? 'Gusoza kubika filme muri telefoni/mudasobwa!' : 'Saving MP4 movie to your local device!');
        setIsCompleted(true);

        // Log download event for analytics
        try {
          const rawLogs = localStorage.getItem('bestfilms_download_logs');
          const logs = rawLogs ? JSON.parse(rawLogs) : [];
          const newLog = {
            id: `dl_${Date.now()}`,
            userName: user?.name || 'Viewer',
            userEmail: user?.email || 'guest@bestfilms.rw',
            phone: user?.phone || '250788' + Math.floor(100000 + Math.random() * 900000),
            movieTitle: displayTitle,
            quality: 'HD Direct MP4',
            fileSize: '480 MB',
            server: 'Kigali Peer Node (Direct)',
            device: 'Direct Movie Downloader',
            timestamp: new Date().toISOString(),
          };
          logs.unshift(newLog);
          localStorage.setItem('bestfilms_download_logs', JSON.stringify(logs.slice(0, 100)));
          window.dispatchEvent(new Event('bestfilms_download_added'));
        } catch (e) {
          console.error('Download log error:', e);
        }
      }
      const finalProgress = progress > 100 ? 100 : progress;
      setDownloadProgress(finalProgress);
    }, 300);
  };

  // Sub Gate Handlers
  const handleSendMoMoPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setSubGateError(
        lang === 'rw'
          ? 'Nyamuneka ubanze wemeze amategeko n\'amabwiriza y\'ifatabuguzi (Ugafunga agasanduku).'
          : 'You must check the box to accept the VIP subscription terms & conditions.'
      );
      return;
    }
    if (!momoPhone || momoPhone.trim().length < 8) {
      setSubGateError(
        lang === 'rw'
          ? 'Nyamuneka injiza nimero ya telefoni neza.'
          : 'Please enter a valid phone number.'
      );
      return;
    }

    setSubGateError(null);
    setIsProcessingSub(true);

    try {
      const res = await fetch('/api/momo/request-to-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: momoPhone,
          amount: selectedVipPlan === 'weekly_vip' ? 500 : 2000,
          planName: selectedVipPlan === 'weekly_vip' ? 'VIP Stream Pass (1 Week)' : 'VIP Stream Pass (1 Month)',
        }),
      });
      const data = await res.json();
      if (data.success && data.referenceId) {
        setMomoRefId(data.referenceId);
      }
    } catch (e) {
      console.log('MoMo push API call notice:', e);
    }

    setTimeout(() => {
      setIsProcessingSub(false);
      setSubGateStep('momo_pin');
    }, 1200);
  };

  const handleConfirmPinAndActivate = () => {
    setIsProcessingSub(true);
    setTimeout(() => {
      const isWeekly = selectedVipPlan === 'weekly_vip';
      const newPlan: SubscriptionPlan = {
        id: selectedVipPlan,
        name: isWeekly ? 'VIP Stream Pass (Icyumweru 1)' : 'VIP Stream Pass (Ukwezi 1)',
        type: 'vip',
        price: isWeekly ? '500 RWF / week' : '2,000 RWF / month',
        amountRwf: isWeekly ? 500 : 2000,
        startedAt: new Date().toISOString().split('T')[0],
        endsAt: isWeekly ? '7 Days Pass' : '30 Days Pass',
        paymentMethod: 'MTN Mobile Money',
        paymentPhone: momoPhone,
        isActive: true,
      };

      updateSubscription(newPlan);

      try {
        localStorage.setItem(
          'bestfilms_accepted_download_terms',
          JSON.stringify({
            userId: user?.id,
            userName: user?.name,
            timestamp: new Date().toISOString(),
            accepted: true,
            plan: selectedVipPlan,
            phone: momoPhone,
          })
        );
      } catch (err) {
        console.error('Terms record error:', err);
      }

      setIsProcessingSub(false);
      setSubGateStep('unlocked');
      // Automatically trigger high-speed download
      setTimeout(() => {
        setIsDownloading(true);
        setDownloadProgress(0);
        setIsCompleted(false);
        setDownloadStep(lang === 'rw' ? 'Guhuza na Kigali Direct Turbo CDN Node...' : 'Connecting to Kigali Direct Turbo CDN Node...');

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 18) + 12;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setDownloadProgress(100);
            setIsCompleted(true);
            triggerActualDownload(activeUrl, displayTitle, selectedQuality);
          }
          setDownloadProgress(progress);
        }, 400);
      }, 400);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl animate-fadeIn relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Zap className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base md:text-lg flex items-center space-x-2">
                <span>{lang === 'rw' ? 'Manura filme vuba n\'Umuhondo wa Speed (Turbo Download)' : 'High-Speed Turbo Movie Downloader'}</span>
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {lang === 'rw' ? 'Ikoranabuhanga rya CDN rya Kigali & Direct Multi-Thread Peer' : 'Direct Peer Node Routing & Multi-Thread CDN Speed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Movie Info Snippet */}
        <div className="flex items-center space-x-3.5 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
          <img
            src={movie.posterUrl}
            alt={displayTitle}
            className="w-14 h-20 object-cover rounded-xl border border-zinc-800 flex-shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="font-bold text-white text-sm truncate">{displayTitle}</h4>
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.runtime}</span>
              {movie.isAgasobanuye && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-black text-[10px] uppercase">
                  Agasobanuye
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-1">{movie.genres.join(', ')}</p>
          </div>
        </div>

        {isPromoModeActive && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-amber-950/70 to-zinc-900 border border-emerald-500/60 p-3.5 rounded-2xl flex items-center space-x-3 text-xs text-emerald-200 shadow-lg animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-extrabold text-white text-xs">
                {lang === 'rw' ? '🎉 PROMO Y\'UBUNTU IRAKORA! (Free Access Promo Live)' : '🎉 ADMIN FREE PROMOTION LIVE!'}
              </p>
              <p className="text-[11px] text-amber-200 mt-0.5">
                {promoMessage}
              </p>
            </div>
          </div>
        )}

        {false ? (
          /* VIP Terms Acceptance & MoMo Subscription Gate */
          <div className="bg-gradient-to-br from-amber-950/70 via-purple-950/40 to-zinc-950 border border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-start space-x-3 border-b border-amber-500/30 pb-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <span>{lang === 'rw' ? '🔒 Kumanura Filme Bisaba Kwemera Amategeko n\'Ifatabuguzi' : '🔒 VIP Terms & Subscription Required to Download'}</span>
                </h4>
                <p className="text-xs text-amber-300 mt-0.5">
                  {lang === 'rw' 
                    ? 'Kumanura amashusho meza (HD/4K) birabujijwe ku bafite plan y\'ubuntu. Ugomba kwemera amategeko n\'amabwiriza y\'ifatabuguzi no kugura VIP Plan binyuze muri Mobile Money.'
                    : 'Downloading HD & 4K movies is reserved exclusively for active VIP Subscribers. Please accept the subscription terms & conditions and activate a VIP pass below.'}
                </p>
              </div>
            </div>

            {subGateError && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{subGateError}</span>
              </div>
            )}

            {subGateStep === 'form' ? (
              <form onSubmit={handleSendMoMoPrompt} className="space-y-4">
                {/* Terms of Agreement Box */}
                <div className="bg-zinc-950/90 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 text-xs text-zinc-300">
                  <p className="font-bold text-amber-400 flex items-center space-x-1.5 text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'rw' ? 'Amategeko n\'Amabwiriza y\'Ifatabuguzi (Subscription & Download Terms):' : 'Subscription & Download Policy Terms:'}</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-zinc-300 leading-relaxed pl-1">
                    <li>{lang === 'rw' ? '1. Filme zose zizamanurwa zigenewe gukoreshwa ubwawe mu buryo bwa offline tu. Zirabujijwe kugurishwa.' : '1. Downloaded movies are licensed strictly for personal offline viewing. Commercial redistribution is prohibited.'}</li>
                    <li>{lang === 'rw' ? '2. Ifatabuguzi ryerekeza kuri 500 RWF (Icyumweru) cyangwa 2,000 RWF (Ukwezi) riha abakoresha umuduko wa 50Mbps+ CDN Kigali Server.' : '2. VIP Stream Pass (500 RWF / week or 2,000 RWF / month) unlocks 50Mbps+ multi-threaded Kigali CDN download speed.'}</li>
                    <li>{lang === 'rw' ? '3. Amafaranga akatwa kuri Mobile Money MTN / Airtel ahita ashyiraho VIP muri Best Films muri ako kanya.' : '3. Mobile Money authorization instantly activates your VIP account across all registered devices.'}</li>
                  </ul>

                  <div className="pt-2.5 border-t border-zinc-800">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id="vip-download-terms-checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded bg-zinc-900 border-amber-500 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-amber-300 leading-tight">
                        {lang === 'rw'
                          ? 'Ndemera amategeko n\'amabwiriza y\'ifatabuguzi rya VIP rya Best Films no kumanura filme (I Accept VIP Subscription Terms) *'
                          : 'I accept the VIP Subscription Terms & Conditions and movie download agreement *'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* VIP Plan Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    {lang === 'rw' ? 'Hitamo Ifatabuguzi rya VIP (Select VIP Plan):' : 'Select VIP Pass Plan:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      onClick={() => setSelectedVipPlan('weekly_vip')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedVipPlan === 'weekly_vip'
                          ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-0.5">
                        <span>VIP Pass (Icyumweru)</span>
                        {selectedVipPlan === 'weekly_vip' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-sm font-black text-white">500 RWF</p>
                      <p className="text-[10px] text-zinc-400">Iminsi 7 (7 Days VIP)</p>
                    </div>

                    <div
                      onClick={() => setSelectedVipPlan('monthly_vip')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedVipPlan === 'monthly_vip'
                          ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-0.5">
                        <span>VIP Pass (Ukwezi)</span>
                        {selectedVipPlan === 'monthly_vip' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-sm font-black text-white">2,000 RWF</p>
                      <p className="text-[10px] text-zinc-400">Iminsi 30 (30 Days Unlimited)</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Money Phone Input */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    {lang === 'rw' ? 'Nimero ya Mobile Money (MTN / Airtel):' : 'Paying Mobile Money Phone Number:'}
                  </label>
                  <input
                    id="download-modal-momo-phone"
                    type="text"
                    required
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="0788123456"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  id="accept-terms-and-pay-btn"
                  disabled={isProcessingSub || !acceptedTerms}
                  className="w-full py-3.5 rounded-xl font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 text-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-zinc-950" />
                  <span>
                    {isProcessingSub
                      ? (lang === 'rw' ? 'Bwoherereza ubusabe bwo kwishyura...' : 'Sending MoMo Push Prompt...')
                      : (lang === 'rw' ? `Emeza Amategeko & Ishyura na MoMo (${selectedVipPlan === 'weekly_vip' ? '500 RWF' : '2,000 RWF'})` : `Accept Terms & Pay with MoMo (${selectedVipPlan === 'weekly_vip' ? '500 RWF' : '2,000 RWF'})`)}
                  </span>
                </button>
              </form>
            ) : (
              /* PIN Entry Step */
              <div className="space-y-4 animate-fadeIn bg-zinc-950 p-4 rounded-xl border border-amber-500/40">
                <div className="flex items-center space-x-2.5 text-amber-300 border-b border-zinc-800 pb-3">
                  <Smartphone className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-white">📲 {lang === 'rw' ? 'MoMo PIN Push Screen Alert' : 'MoMo PIN Push Prompt Sent'}</p>
                    <p className="text-zinc-400 text-[11px]">Bwohererejwe kuri telefoni: <span className="text-amber-400 font-mono font-bold">{momoPhone}</span></p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lang === 'rw'
                    ? 'Ubusabe bwo kwishyura bwohererejwe kuri telefoni yawe. Injiza PIN ya MoMo hanyuma ukande button iri hasi kugira ngo kumanura bitangire muri ako kanya!'
                    : 'Payment prompt sent to your phone screen. Enter your MoMo PIN and click the button below to complete activation & unlock movie downloads!'}
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400 block flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{lang === 'rw' ? 'Injiza PIN ya MoMo (Enter MoMo PIN):' : 'Enter MoMo PIN (Simulation):'}</span>
                  </label>
                  <input
                    id="download-modal-momo-pin"
                    type="password"
                    maxLength={5}
                    value={momoPin}
                    onChange={(e) => setMomoPin(e.target.value)}
                    placeholder="****"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-amber-500/60 rounded-xl text-white font-mono text-center text-base tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="button"
                  id="confirm-pin-unlock-download-btn"
                  onClick={handleConfirmPinAndActivate}
                  disabled={isProcessingSub}
                  className="w-full py-3.5 rounded-xl font-black bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white shadow-lg flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>
                    {isProcessingSub
                      ? (lang === 'rw' ? 'Kwerekana ko VIP yishyuwe & Kumanura...' : 'Activating VIP & Unlocking Download...')
                      : (lang === 'rw' ? 'Emeza PIN -> Tangira Kumanura filme (Unlock Download)' : 'Confirm PIN & Start Download Now')}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : false ? (
          <>
            {/* Step 1: CDN Peer Node Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center space-x-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>{lang === 'rw' ? '1. Hitamo Server / CDN y\'Umuduko:' : '1. Select CDN High-Speed Server Node:'}</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* Kigali Peer Node */}
                <div
                  onClick={() => setSelectedServer('kigali_cdn')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedServer === 'kigali_cdn'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/40'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-amber-400">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Kigali Direct CDN</span>
                    </div>
                    {selectedServer === 'kigali_cdn' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    Optimized for MTN, Airtel, CanalBox & Liquid Telecom. (50-100 Mbps)
                  </p>
                </div>

                {/* Global Multi Thread */}
                <div
                  onClick={() => setSelectedServer('global_multi')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedServer === 'global_multi'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/40'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-blue-400">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Multi-Thread Node</span>
                    </div>
                    {selectedServer === 'global_multi' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    4 Parallel Stream Threads for ultra stable downloading.
                  </p>
                </div>

                {/* Cloudflare Edge */}
                <div
                  onClick={() => setSelectedServer('cloudflare_edge')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedServer === 'cloudflare_edge'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/40'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Cloudflare Edge</span>
                    </div>
                    {selectedServer === 'cloudflare_edge' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    Global Edge Caching with automated retry failover.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Quality & Size Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>{lang === 'rw' ? '2. Hitamo Ubwinshi bw\'Amashusho (Quality & Size):' : '2. Select Video Quality & File Size:'}</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['480p', '720p', '1080p', '4k'] as const).map((q) => {
                  const info = qualityInfo[q];
                  const active = selectedQuality === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuality(q)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        active
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-lg shadow-amber-950/50'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs uppercase">{q}</span>
                        {active && <Check className="w-4 h-4 text-zinc-950" />}
                      </div>
                      <p className={`text-[11px] font-semibold ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {info.size}
                      </p>
                      <p className={`text-[9px] mt-1 ${active ? 'text-zinc-950 font-bold' : 'text-amber-400'}`}>
                        ⚡ {info.estTime}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Turbo Speed Booster Toggle */}
            <div 
              onClick={() => setTurboBoostEnabled(!turboBoostEnabled)}
              className="flex items-center justify-between bg-gradient-to-r from-amber-950/60 to-zinc-950 p-3.5 rounded-2xl border border-amber-500/30 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sparkles className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">
                    {lang === 'rw' ? 'Turbo Multi-Thread Speed Accelerator (Yagutse)' : 'Turbo Speed Accelerator (Active)'}
                  </h5>
                  <p className="text-[10px] text-amber-300">
                    {lang === 'rw' ? 'Inganji ya speed yikuba inshuro 3-5 ku murongo w\'intaneti' : 'Accelerates throughput by up to 5x with parallel chunk streams'}
                  </p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full p-1 transition-colors ${turboBoostEnabled ? 'bg-amber-500' : 'bg-zinc-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${turboBoostEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleStartDownload}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 rounded-2xl font-black text-sm shadow-xl shadow-amber-950/50 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-5 h-5 fill-zinc-950" />
              <span>
                {lang === 'rw' 
                  ? `Tangira Manura i Vuba (${qualityInfo[selectedQuality].size})`
                  : `Start High-Speed Download (${qualityInfo[selectedQuality].size})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Live Downloading Progress UI */
          <div className="space-y-5 py-4">
            <div className="bg-zinc-950 p-5 rounded-3xl border border-amber-500/40 text-center space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 px-2">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 animate-pulse fill-amber-400" />
                  <span>{turboBoostEnabled ? 'TURBO BOOST 50Mbps+' : 'STANDARD DIRECT'}</span>
                </span>
                <span className="text-white font-mono text-sm">{currentSpeed} MB/s</span>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/50"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>{downloadProgress}% Completed</span>
                <span>Quality: {selectedQuality.toUpperCase()}</span>
              </div>

              <div className="pt-2 text-xs text-amber-300 font-medium flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{downloadStep}</span>
              </div>
            </div>

            {isCompleted ? (
              <div className="space-y-3">
                <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {lang === 'rw' ? 'Filme yamanuwe neza kuri telefoni/mudasobwa!' : 'Movie successfully downloaded to your device!'}
                    </p>
                    <p>
                      {lang === 'rw' ? 'Niba kumanuka bitatangiye ku buryo bwite, kanda kuri buto iri hano hasi.' : 'If automatic download did not start, click the button below to save manually.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`/api/download?url=${encodeURIComponent(activeUrl)}&title=${encodeURIComponent(displayTitle)}&quality=${encodeURIComponent(selectedQuality)}`}
                    download={`${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedQuality}_Turbo.mp4`}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50"
                  >
                    <Download className="w-4 h-4 fill-zinc-950" />
                    <span>{lang === 'rw' ? 'Manura MP4 Muri Telefoni (Save MP4 File)' : 'Save Video MP4 File'}</span>
                  </a>

                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 border border-zinc-700"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'rw' ? 'Fungura Source Link' : 'Open Source Link'}</span>
                  </a>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl font-bold text-xs border border-zinc-800"
                >
                  {lang === 'rw' ? 'Funga (Close)' : 'Done & Close'}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 text-center italic">
                {lang === 'rw' ? 'Mureke ikomeze gukurura niyo waba udakeneye gukanda ahandi...' : 'Please hold on while high-speed multi-threaded buffer completes...'}
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="text-[10px] text-zinc-500 text-center pt-2 border-t border-zinc-800/80">
          Best Films Direct CDN Accelerator • Optimized for Rwanda Mobile Networks & Broadband
        </div>

      </div>
    </div>
  );
};
