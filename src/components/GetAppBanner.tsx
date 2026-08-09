import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles, X, CheckCircle2, ArrowDownCircle, ShieldCheck, Bell, Share2, PlusSquare, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { requestPushNotificationPermission } from '../lib/pushNotifications';

export const GetAppBanner: React.FC = () => {
  const { lang } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running as an installed standalone app on home screen
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleGetAppClick = async () => {
    // Request push notifications permission automatically
    try {
      const granted = await requestPushNotificationPermission();
      if (granted) setPushEnabled(true);
    } catch (e) {
      console.log('Push notification permission request');
    }

    // If browser triggered PWA beforeinstallprompt event, invoke native OS installer!
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => setInstallSuccess(false), 5000);
        }
        setDeferredPrompt(null);
      } catch (e) {
        console.log('PWA installation prompt handling:', e);
        setShowInstallModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Show interactive App Installation Modal with 1-click setup & instructions
      setShowInstallModal(true);
    }
  };

  const handlePushNotificationsClick = async () => {
    const granted = await requestPushNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      alert(lang === 'rw' 
        ? '🔔 Push Notifications zemejwe neza! Uzajya ubona firime nshya n\'amakuru.' 
        : '🔔 Push Notifications enabled! You will receive alerts for new movies and series.');
    }
  };

  if (isDismissed || isStandalone) return null;

  return (
    <>
      {/* Top Sticky Get App Banner */}
      <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white shadow-xl border-b border-amber-400/50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          
          {/* Left Side App Info */}
          <div className="flex items-center space-x-2.5 min-w-0 cursor-pointer" onClick={() => setShowInstallModal(true)}>
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-amber-400 flex items-center justify-center shadow-md overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=192&h=192&fit=crop&crop=faces" 
                  alt="Best Films App Icon" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white truncate">
                  {lang === 'rw' ? 'Best Films App' : 'Best Films Mobile App'}
                </span>
                <span className="bg-amber-400 text-zinc-950 font-black text-[9px] uppercase px-1.5 py-0.2 rounded-full tracking-wider shrink-0 shadow-sm">
                  OFFICIAL APP
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-100/90 truncate hidden xs:block">
                {lang === 'rw' 
                  ? 'Shyira App ku gakoresho kawe (Home Screen) irebe nta interineti' 
                  : 'Install App on your phone home screen for fast viewing'}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Push Notifications Toggle */}
            <button
              type="button"
              onClick={handlePushNotificationsClick}
              className={`p-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer hidden sm:flex items-center space-x-1 ${
                pushEnabled
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                  : 'bg-black/30 border-amber-300/60 hover:bg-black/50 text-amber-200'
              }`}
              title="Enable Push Notifications"
            >
              <Bell className={`w-3.5 h-3.5 ${pushEnabled ? 'text-emerald-400 fill-emerald-400' : 'text-amber-300'}`} />
              <span className="text-[10px] hidden md:inline">
                {pushEnabled ? (lang === 'rw' ? 'Alerts On' : 'Alerts On') : (lang === 'rw' ? 'Kora Alerts' : 'Enable Push')}
              </span>
            </button>

            {/* GET APP Main Installation Button */}
            <button
              id="btn-get-app-top-sticky"
              type="button"
              onClick={handleGetAppClick}
              disabled={isInstalling}
              className={`px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer transition-all transform active:scale-95 shadow-lg ${
                installSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-900/50 ring-2 ring-emerald-300'
                  : 'bg-white hover:bg-amber-100 text-red-700 shadow-red-950/40 ring-2 ring-amber-300 hover:scale-105'
              }`}
            >
              {isInstalling ? (
                <>
                  <ArrowDownCircle className="w-4 h-4 text-red-700 animate-bounce" />
                  <span>{lang === 'rw' ? 'Kushyiramo...' : 'Installing...'}</span>
                </>
              ) : installSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{lang === 'rw' ? 'Yashyizwe Muri Phone!' : 'App Installed!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-red-700 animate-bounce" />
                  <span className="uppercase tracking-wider text-red-700 font-extrabold">
                    GET APP
                  </span>
                </>
              )}
            </button>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Banner Notice */}
        {installSuccess && (
          <div className="bg-zinc-950 text-amber-300 border-t border-amber-500/50 text-[11px] font-bold px-4 py-1.5 flex items-center justify-center space-x-2 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'rw'
                ? '🎉 Best Films App yashyizwe muri telefoni yawe neza! Ushobora kuyifungura ku mashusho ya Home Screen.'
                : '🎉 Best Films App successfully installed on your device! You can launch it directly from your Home Screen.'}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Mobile App Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-100 shadow-2xl relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Header */}
            <div className="text-center space-y-3 mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-950 border-2 border-red-600 overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=192&h=192&fit=crop&crop=faces" 
                  alt="Best Films App" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {lang === 'rw' ? 'Shyira Best Films App Muri Telefoni' : 'Install Best Films Mobile App'}
                </h3>
                <p className="text-xs text-amber-400 font-semibold mt-1">
                  {lang === 'rw' ? 'Muri Apps z\'agakoresho kawe (Home Screen)' : 'App icon on your Home Screen & App Launcher'}
                </p>
              </div>
            </div>

            {/* Direct 1-Click Install Button if Prompt Ready */}
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleGetAppClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transform active:scale-98 transition-all mb-4"
              >
                <Download className="w-5 h-5" />
                <span>{lang === 'rw' ? 'Kanda hano Ushyiremo App Sura' : 'Tap Here to Install App Instantly'}</span>
              </button>
            ) : null}

            {/* Installation Instructions for Android & iOS */}
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'rw' ? 'Uburyo bwa Android / Chrome:' : 'For Android / Chrome Browser:'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] pl-1">
                  <li>
                    {lang === 'rw' 
                      ? 'Kanda ku dukpoint 3 twa browser (top-right menu ⋮)' 
                      : 'Tap the 3 dots menu button (top-right ⋮)'}
                  </li>
                  <li>
                    {lang === 'rw' 
                      ? 'Hitamo "Add to Home screen" cyangwa "Install app"' 
                      : 'Select "Add to Home screen" or "Install app"'}
                  </li>
                  <li>
                    {lang === 'rw' 
                      ? 'App ihita ijya mu zindi App zawe ku kio!' 
                      : 'Best Films icon will appear directly in your local phone apps!'}
                  </li>
                </ol>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-300">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'rw' ? 'Uburyo bwa iPhone / iOS Safari:' : 'For iPhone / iOS Safari:'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] pl-1">
                  <li>
                    {lang === 'rw' 
                      ? 'Kanda ikimenyetso cya Share (⎘ ikirango cyo gusangira)' 
                      : 'Tap the Share button at the bottom of Safari (⎘)'}
                  </li>
                  <li>
                    {lang === 'rw' 
                      ? 'Kina ushake "Add to Home Screen" (+)' 
                      : 'Scroll down and tap "Add to Home Screen" (+)'}
                  </li>
                  <li>
                    {lang === 'rw' 
                      ? 'Kanda "Add". Best Films ihita iba App yawe!' 
                      : 'Tap "Add". Best Films installs as an app on your iOS home screen!'}
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer Close */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'rw' ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
