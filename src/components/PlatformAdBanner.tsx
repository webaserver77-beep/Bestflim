import React, { useState, useEffect } from 'react';
import { PlatformAd } from '../types';
import { getStoredAds, recordAdClick } from '../data/adsAndMessages';
import { Megaphone, ExternalLink, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PlatformAdBannerProps {
  location?: 'banner_top' | 'home_hero';
}

export const PlatformAdBanner: React.FC<PlatformAdBannerProps> = ({ location = 'banner_top' }) => {
  const { lang } = useLanguage();
  const [ads, setAds] = useState<PlatformAd[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const active = getStoredAds().filter(ad => ad.isActive && (!location || ad.location === location || ad.location === 'banner_top'));
    setAds(active);
  }, [location]);

  if (dismissed || ads.length === 0) return null;

  const currentAd = ads[currentAdIndex % ads.length];

  const handleAdClick = () => {
    recordAdClick(currentAd.id);
    if (currentAd.targetUrl) {
      window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/80 border border-amber-500/30 p-4 shadow-xl my-4">
      {/* Background Image Accent overlay */}
      {currentAd.imageUrl && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
        />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5 flex-1">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-zinc-950 shadow-md shrink-0 mt-0.5 sm:mt-0">
            <Megaphone className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>SPONSORED AD</span>
              </span>
              <span className="text-zinc-400 text-[11px]">Best Films Rwanda</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
              {currentAd.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {currentAd.targetUrl && (
            <button
              onClick={handleAdClick}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 active:scale-95 transition-all"
            >
              <span>{lang === 'rw' ? 'Kanda Hano' : 'Learn More'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg bg-zinc-950/40 hover:bg-zinc-800 transition-colors"
            title="Dismiss Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
