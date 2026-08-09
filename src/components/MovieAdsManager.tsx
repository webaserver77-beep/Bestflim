import React, { useState } from 'react';
import { MovieAd } from '../types';
import { Megaphone, Plus, Trash2, Upload, Play, Film, Clock, ExternalLink, Check } from 'lucide-react';

interface MovieAdsManagerProps {
  ads: MovieAd[];
  onChangeAds: (updatedAds: MovieAd[]) => void;
}

const SAMPLE_LOCAL_ADS = [
  {
    title: 'MTN MoMo Pay Promo Ad',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    advertiserName: 'MTN Mobile Money Rwanda',
    targetUrl: 'https://www.mtn.co.rw',
  },
  {
    title: 'Canal+ Agasobanuye Special Deal',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    advertiserName: 'Canal+ Rwanda',
    targetUrl: 'https://www.canalplus.rw',
  },
  {
    title: 'Airtel 4G Turbo Speed Ad',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    advertiserName: 'Airtel Rwanda',
    targetUrl: 'https://www.airtel.co.rw',
  },
  {
    title: 'RebaMovie VIP Fast Pass Promo',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    advertiserName: 'RebaMovie Official',
    targetUrl: '/pricing',
  },
];

export const MovieAdsManager: React.FC<MovieAdsManagerProps> = ({ ads = [], onChangeAds }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [placement, setPlacement] = useState<'preroll' | 'midroll' | 'postroll'>('preroll');
  const [timestampMinutes, setTimestampMinutes] = useState('02');
  const [timestampSeconds, setTimestampSeconds] = useState('00');
  const [skipAfterSeconds, setSkipAfterSeconds] = useState<number>(5);
  const [videoUrl, setVideoUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewingAdId, setPreviewingAdId] = useState<string | null>(null);

  // Convert mm:ss to seconds
  const getCalculatedSeconds = (): number => {
    const mins = parseInt(timestampMinutes, 10) || 0;
    const secs = parseInt(timestampSeconds, 10) || 0;
    return mins * 60 + secs;
  };

  // Convert seconds to mm:ss format for display
  const formatSecondsToMMSS = (totalSecs: number): string => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle local video file upload from admin's device
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localObjUrl = URL.createObjectURL(file);
      setVideoUrl(localObjUrl);
      setFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!advertiserName) {
        setAdvertiserName('Local File Ad');
      }
    }
  };

  // Handle selecting preset sample local video ad
  const handleSelectSampleAd = (sampleIndex: number) => {
    const sample = SAMPLE_LOCAL_ADS[sampleIndex];
    if (sample) {
      setTitle(sample.title);
      setAdvertiserName(sample.advertiserName);
      setVideoUrl(sample.videoUrl);
      setTargetUrl(sample.targetUrl);
      setFileName('');
    }
  };

  // Submit new ad to movie
  const handleAddAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    const newAd: MovieAd = {
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim() || 'Video Advertisement',
      advertiserName: advertiserName.trim() || 'Sponsor',
      videoUrl: videoUrl.trim(),
      placement: placement,
      midrollTimestamp: placement === 'midroll' ? getCalculatedSeconds() : undefined,
      skipAfterSeconds: Number(skipAfterSeconds),
      targetUrl: targetUrl.trim() || undefined,
    };

    onChangeAds([...ads, newAd]);

    // Reset form
    setTitle('');
    setAdvertiserName('');
    setVideoUrl('');
    setTargetUrl('');
    setFileName('');
    setShowAddForm(false);
  };

  const handleRemoveAd = (adId: string) => {
    onChangeAds(ads.filter(a => a.id !== adId));
  };

  return (
    <div className="bg-zinc-950 p-4 rounded-2xl border border-amber-900/30 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-amber-400 text-xs">
            Injangwe z'Anonsi / Movie Video Ads ({ads.length} Ads Attached)
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Funga Form' : '+ Ongeraho Ad Nshya'}</span>
        </button>
      </div>

      {/* List of Attached Ads */}
      {ads.length === 0 ? (
        <p className="text-[11px] text-zinc-500 italic py-1">
          Nta ad irongerwa kuri iyi filme (Optional). Kanda "+ Ongeraho Ad Nshya" niba ushaka gushyiraho ad mbere, mu hagati, cyangwa inyuma ya video.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    ad.placement === 'preroll' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    ad.placement === 'midroll' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-purple-950 text-purple-400 border border-purple-800'
                  }`}>
                    {ad.placement === 'preroll' ? 'PREROLL (Mbere)' :
                     ad.placement === 'midroll' ? `MIDROLL @ ${formatSecondsToMMSS(ad.midrollTimestamp || 0)}` :
                     'POSTROLL (Inyuma)'}
                  </span>

                  <span className="font-bold text-white truncate max-w-[180px]">
                    {ad.title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewingAdId(previewingAdId === ad.id ? null : ad.id)}
                    className="p-1 text-xs text-amber-400 hover:text-amber-300 font-bold bg-zinc-800 rounded px-2 flex items-center space-x-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-amber-400" />
                    <span>{previewingAdId === ad.id ? 'Close' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveAd(ad.id)}
                    className="p-1 text-red-400 hover:text-red-300 bg-red-950/60 hover:bg-red-950 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {ad.advertiserName && (
                <p className="text-[10px] text-zinc-400 flex items-center space-x-2">
                  <span>Advertiser: <strong className="text-zinc-200">{ad.advertiserName}</strong></span>
                  <span>•</span>
                  <span>Skip delay: <strong className="text-amber-400">{ad.skipAfterSeconds ?? 5}s</strong></span>
                </p>
              )}

              {/* Preview Ad Video Player if toggled */}
              {previewingAdId === ad.id && (
                <div className="pt-2">
                  <video
                    src={ad.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-36 bg-black rounded-lg border border-amber-500/30 object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORM: ADD NEW VIDEO AD */}
      {showAddForm && (
        <form onSubmit={handleAddAdSubmit} className="bg-zinc-900 border border-amber-800/40 p-3.5 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h5 className="font-bold text-amber-300 text-xs flex items-center space-x-1">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Ongeraho Injangwe y'Anonsi (Ad Config)</span>
            </h5>
            <span className="text-[10px] text-zinc-500">Supports Local Files & Preset Videos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Izina ry'Anonsi (Ad Title):</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MTN MoMo Special Offer"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Company / Advertiser Name:</label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="e.g. MTN Rwanda / Canal+ / Local Biz"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Ad Placement (Aho Izagenda):</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 font-semibold text-xs"
              >
                <option value="preroll">Preroll (Imbere - Mbere y'uko filme itangira)</option>
                <option value="midroll">Midroll (Mu hagati ya filme - At specific timestamp)</option>
                <option value="postroll">Postroll (Inyuma - Umaze kureba filme yose)</option>
              </select>
            </div>

            {placement === 'midroll' && (
              <div>
                <label className="font-bold text-amber-400 block mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Igihe cyo kuyicuranga (Timestamp MM:SS):</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={timestampMinutes}
                    onChange={(e) => setTimestampMinutes(e.target.value)}
                    className="w-16 px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-center text-white font-mono font-bold"
                  />
                  <span className="font-bold text-amber-400">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timestampSeconds}
                    onChange={(e) => setTimestampSeconds(e.target.value)}
                    className="w-16 px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-center text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">
                    ({getCalculatedSeconds()}s in video)
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Skip Ad Delay (Gusimbuka):</label>
              <select
                value={skipAfterSeconds}
                onChange={(e) => setSkipAfterSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                <option value={5}>5 Seconds (Standard Skip)</option>
                <option value={3}>3 Seconds (Fast Skip)</option>
                <option value={10}>10 Seconds (Longer Ad)</option>
                <option value={0}>Non-skippable (Must Watch All)</option>
              </select>
            </div>
          </div>

          {/* VIDEO SOURCE SELECTION (FILE UPLOAD OR PRESET OR LINK) */}
          <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="font-bold text-amber-300 block text-xs">
              Choose Video File Source:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option 1: Upload Local Video File */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 block">1. Hitamo File ku Mashini / Telefone:</label>
                <label className="flex items-center justify-center space-x-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-amber-500/50 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="truncate max-w-[150px]">{fileName || 'Upload Local Video File'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleLocalFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option 2: Select Sample Local Preset */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 block">2. Cyangwa Hitamo Sample Ad:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      handleSelectSampleAd(Number(e.target.value));
                    }
                  }}
                  className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-amber-300 text-xs font-bold"
                >
                  <option value="">-- Hitamo Preset Ad --</option>
                  {SAMPLE_LOCAL_ADS.map((s, idx) => (
                    <option key={idx} value={idx}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Option 3: Custom Link */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">3. Or Direct Video URL / MP4 Link:</label>
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/... or local blob URL"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">Advertiser Target URL (Optional Website Link):</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. https://mtn.co.rw or https://canalplus.rw"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-black shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ongeraho Ad Kuri Filme</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
