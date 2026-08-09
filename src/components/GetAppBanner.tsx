import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles, X, CheckCircle2, ArrowDownCircle, ShieldCheck, Bell, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { requestPushNotificationPermission } from '../lib/pushNotifications';

export const GetAppBanner: React.FC = () => {
  const { lang } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleGetAppClick = async () => {
    setIsDownloading(true);

    // Request push notifications automatically as well
    try {
      const granted = await requestPushNotificationPermission();
      if (granted) setPushEnabled(true);
    } catch (e) {
      console.log('Push notification auto-request');
    }

    // 1. Trigger direct APK download immediately without any prompts/storage dialogs
    try {
      const apkUrl = `/api/download-apk?title=BestFilms_Mobile_App_v2.4`;
      
      // Create hidden link and trigger download instantly
      const link = document.createElement('a');
      link.href = apkUrl;
      link.setAttribute('download', 'BestFilms_v2.4_Mobile.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('APK direct download error:', err);
    }

    // 2. If browser supports PWA installation prompt, also invoke it
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA app installation');
        }
        setDeferredPrompt(null);
      } catch (e) {
        console.log('PWA prompt skipped, APK download handled');
      }
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);

    setTimeout(() => {
      setDownloadSuccess(false);
    }, 6000);
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

  if (isDismissed) return null;

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white shadow-xl border-b border-amber-400/50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          
          {/* Left Side Info */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-950/80 border border-amber-400/60 flex items-center justify-center shadow-inner">
                <Smartphone className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white truncate">
                  {lang === 'rw' ? 'Best Films App ya Mobile' : 'Best Films Mobile App'}
                </span>
                <span className="bg-amber-400 text-zinc-950 font-black text-[9px] uppercase px-1.5 py-0.2 rounded-full tracking-wider shrink-0 shadow-sm">
                  iOS & Android
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-100/90 truncate hidden xs:block">
                {lang === 'rw' 
                  ? 'Yihuta 100%, irebe offline na video zidatinda' 
                  : '100% Ultra fast WebView/APK, offline viewing & push notifications'}
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

            {/* Build Guide Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-amber-300/60 text-amber-200 text-xs font-bold transition-all cursor-pointer hidden md:flex items-center space-x-1"
              title="iOS & Android Publishing Guide"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px]">App Store Setup</span>
            </button>

            {/* Main GET APP Button */}
            <button
              id="btn-get-app-top-sticky"
              type="button"
              onClick={handleGetAppClick}
              disabled={isDownloading}
              className={`px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer transition-all transform active:scale-95 shadow-lg ${
                downloadSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-900/50 ring-2 ring-emerald-300'
                  : 'bg-white hover:bg-amber-100 text-red-700 shadow-red-950/40 ring-2 ring-amber-300 hover:scale-105'
              }`}
            >
              {isDownloading ? (
                <>
                  <ArrowDownCircle className="w-4 h-4 text-red-700 animate-bounce" />
                  <span>{lang === 'rw' ? 'Kumanura...' : 'Downloading...'}</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{lang === 'rw' ? 'Yarangiye!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-red-700 animate-bounce" />
                  <span className="uppercase tracking-wider text-red-700 font-extrabold">
                    {lang === 'rw' ? 'GET APP' : 'GET APP'}
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

        {/* Download Alert Toast Notification */}
        {downloadSuccess && (
          <div className="bg-zinc-950 text-amber-300 border-t border-amber-500/50 text-[11px] font-bold px-4 py-1.5 flex items-center justify-center space-x-2 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'rw'
                ? '🚀 Mobile App download started! Reba muri browser downloads kugirango uyishyiremo.'
                : '🚀 Mobile App download started! Open your browser downloads to install BestFilms.apk'}
            </span>
          </div>
        )}
      </div>

      {/* Build & Packaging Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-100 shadow-2xl max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Cross-Platform Mobile App Guide</h3>
                <p className="text-xs text-zinc-400">iOS & Android Capacitor / Play Store & App Store Publishing</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-zinc-300">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>1. Capacitor Native Wrapper Setup</span>
                </h4>
                <p className="text-xs text-zinc-400">Run these commands in your project directory:</p>
                <pre className="bg-zinc-900 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
{`npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Best Films" "com.bestfilms.mobile" --web-dir "dist"
npm run build
npx cap add android
npx cap add ios
npx cap sync`}
                </pre>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>2. Google Play Store & Android APK</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Run <code className="text-amber-300 font-mono">npx cap open android</code> to launch Android Studio. Go to Build &gt; Generate Signed Bundle / APK to build production AAB for Google Play Store.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>3. Apple App Store & iOS IPA</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Run <code className="text-amber-300 font-mono">npx cap open ios</code> on macOS to launch Xcode. Select your Developer account and archive the app for TestFlight & App Store distribution.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

