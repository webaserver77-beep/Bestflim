import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Movie, Episode, MoviePart, MovieAd } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from './MovieCard';
import { DownloadSpeedModal } from './DownloadSpeedModal';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, 
  Settings, Clock, Heart, Share2, ArrowLeft, Star, Subtitles, 
  Check, Volume1, Film, Tv, Sparkles, Download, Zap, Layers, ListVideo, Server,
  Megaphone, SkipForward, ExternalLink
} from 'lucide-react';

interface VideoPlayerProps {
  movie: Movie;
  allMovies: Movie[];
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, allMovies, onBack, onSelectMovie }) => {
  const { lang, t } = useLanguage();
  const { isFavorite, toggleFavorite, isInWatchLater, toggleWatchLater, updateWatchHistory } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active episode if series
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(
    movie.episodes && movie.episodes.length > 0 ? movie.episodes[0] : null
  );

  // Active part if movie has parts
  const [activePart, setActivePart] = useState<MoviePart | null>(
    movie.parts && movie.parts.length > 0 ? movie.parts[0] : null
  );

  // Active Season Number
  const [selectedSeason, setSelectedSeason] = useState<number>(
    activeEpisode ? activeEpisode.seasonNumber : 1
  );

  // Computed unique seasons list
  const availableSeasons = useMemo(() => {
    if (!movie.episodes || movie.episodes.length === 0) return [1];
    const seasonsSet = new Set<number>();
    movie.episodes.forEach((ep) => seasonsSet.add(ep.seasonNumber || 1));
    return Array.from(seasonsSet).sort((a, b) => a - b);
  }, [movie.episodes]);

  // Episodes for current selected season
  const filteredEpisodes = useMemo(() => {
    if (!movie.episodes) return [];
    return movie.episodes.filter((ep) => ep.seasonNumber === selectedSeason);
  }, [movie.episodes, selectedSeason]);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [useNativeControls, setUseNativeControls] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Video Ads Engine State
  const [activeAd, setActiveAd] = useState<MovieAd | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adSkipCountdown, setAdSkipCountdown] = useState<number>(5);
  const [canSkipAd, setCanSkipAd] = useState<boolean>(false);
  const [playedAdIds, setPlayedAdIds] = useState<Set<string>>(new Set());
  const adVideoRef = useRef<HTMLVideoElement>(null);

  const movieAds = useMemo(() => {
    return movie.ads || [];
  }, [movie.ads]);

  // Handle initial preroll ad when movie is loaded or changes - disabled auto-blocking black screen overlay
  useEffect(() => {
    setPlayedAdIds(new Set());
    setActiveAd(null);
    setIsAdPlaying(false);
  }, [movie.id, activeVideoUrl, movie.ads]);

  // Skip countdown interval
  useEffect(() => {
    let timer: any = null;
    if (isAdPlaying && activeAd) {
      if (adSkipCountdown > 0) {
        timer = setTimeout(() => {
          setAdSkipCountdown((prev) => {
            if (prev <= 1) {
              setCanSkipAd(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setCanSkipAd(true);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAdPlaying, activeAd, adSkipCountdown]);

  const handleFinishAd = () => {
    if (activeAd) {
      setPlayedAdIds((prev) => new Set(prev).add(activeAd.id));
    }
    setIsAdPlaying(false);
    setActiveAd(null);

    // Resume main video
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.log('Resume main video after ad:', err));
      setIsPlaying(true);
    }
  };
  
  // Settings dropdowns
  const [audioTrack, setAudioTrack] = useState<'original' | 'agasobanuye'>(
    movie.isAgasobanuye ? 'agasobanuye' : 'original'
  );
  const [subtitles, setSubtitles] = useState<'off' | 'rw' | 'en'>('off');
  const [quality, setQuality] = useState<'360p' | '720p' | '1080p' | '4k'>('1080p');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const { user } = useAuth();

  const handleDownloadMovie = () => {
    setShowDownloadModal(true);
  };

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    activeEpisode ? activeEpisode.videoUrl : (activePart ? activePart.videoUrl : movie.videoUrl)
  );

  useEffect(() => {
    const url = activeEpisode ? activeEpisode.videoUrl : (activePart ? activePart.videoUrl : movie.videoUrl);
    setActiveVideoUrl(url);

    // Track movie view count for real analytics
    if (movie?.id) {
      try {
        const raw = localStorage.getItem('bestfilms_movie_views');
        const viewsMap = raw ? JSON.parse(raw) : {};
        viewsMap[movie.id] = (viewsMap[movie.id] || 0) + 1;
        localStorage.setItem('bestfilms_movie_views', JSON.stringify(viewsMap));
        window.dispatchEvent(new Event('bestfilms_views_updated'));
      } catch (e) {
        console.error('Track view error:', e);
      }
    }
  }, [activeEpisode, activePart, movie]);

  const favorite = isFavorite(movie.id);
  const inWatchLater = isInWatchLater(movie.id);

  const displayTitle = lang === 'rw' && movie.kinyarwandaTitle ? movie.kinyarwandaTitle : movie.title;
  const displayDescription = lang === 'rw' && movie.kinyarwandaDescription ? movie.kinyarwandaDescription : movie.description;

  // Server Selector State & Multi-Platform Player Mode
  const [activeServer, setActiveServer] = useState<number>(1);
  const [playerMode, setPlayerMode] = useState<'auto' | 'html5' | 'iframe'>('auto');

  // Detect platform name for display
  const getPlatformName = (url: string): { name: string; color: string; icon: string } => {
    if (!url) return { name: 'Video Stream', color: 'bg-zinc-800 text-zinc-300', icon: '🎥' };
    const u = url.toLowerCase();
    
    if (u.includes('youtube.com') || u.includes('youtu.be')) return { name: 'YouTube HD Stream', color: 'bg-red-600/20 text-red-400 border-red-500/40', icon: '▶️' };
    if (u.includes('drive.google.com')) return { name: 'Google Drive Stream', color: 'bg-blue-600/20 text-blue-400 border-blue-500/40', icon: '📁' };
    if (u.includes('vimeo.com')) return { name: 'Vimeo Ultra HD', color: 'bg-sky-600/20 text-sky-400 border-sky-500/40', icon: '🎞️' };
    if (u.includes('facebook.com') || u.includes('fb.watch')) return { name: 'Facebook Video', color: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40', icon: '🌐' };
    if (u.includes('tiktok.com')) return { name: 'TikTok Stream', color: 'bg-pink-600/20 text-pink-400 border-pink-500/40', icon: '🎵' };
    if (u.includes('twitch.tv')) return { name: 'Twitch Clip', color: 'bg-purple-600/20 text-purple-400 border-purple-500/40', icon: '👾' };
    if (u.includes('dailymotion.com') || u.includes('dai.ly')) return { name: 'Dailymotion', color: 'bg-amber-600/20 text-amber-400 border-amber-500/40', icon: '⚡' };
    if (u.includes('rumble.com')) return { name: 'Rumble Video', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40', icon: '🟢' };
    if (u.includes('ok.ru')) return { name: 'OK.ru Video Stream', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟠' };
    if (u.includes('archive.org')) return { name: 'Archive.org Cinema', color: 'bg-amber-700/20 text-amber-400 border-amber-600/40', icon: '🏛️' };
    if (u.includes('streamable.com')) return { name: 'Streamable HD', color: 'bg-blue-500/20 text-blue-300 border-blue-400/40', icon: '⚡' };
    if (u.includes('bilibili.com')) return { name: 'Bilibili Stream', color: 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40', icon: '📺' };
    if (u.includes('.mp4') || u.includes('.m3u8') || u.includes('.webm') || u.includes('commondatastorage')) {
      return { name: 'Direct MP4 / CDN Fast Stream', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40', icon: '🚀' };
    }
    return { name: 'Universal Embedded Stream', color: 'bg-purple-600/20 text-purple-300 border-purple-500/40', icon: '🎬' };
  };

  // Universal Video Embed Link Extractor for ANY platform or custom link
  const getEmbedUrl = (rawUrl: string): string | null => {
    if (!rawUrl) return null;
    let url = rawUrl.trim();

    // 0. If user pasted iframe HTML string directly <iframe src="..."></iframe>
    if (url.startsWith('<iframe') || url.includes('src=')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    // Convert http to https for browser security iframe
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    // 1. YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&enablejsapi=1`;
    }

    // 2. Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // 3. Google Drive
    const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // 4. Dropbox (Convert view link to direct raw embed)
    if (url.includes('dropbox.com')) {
      return url.replace('dl=0', 'raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    // 5. Dailymotion
    const dailyMatch = url.match(/(?:dailymotion\.com\/(?:video\/|embed\/video\/)|dai\.ly\/)([a-zA-Z0-9]+)/);
    if (dailyMatch && dailyMatch[1]) {
      return `https://www.dailymotion.com/embed/video/${dailyMatch[1]}?autoplay=1`;
    }

    // 6. Facebook Video
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=true`;
    }

    // 7. TikTok Video
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/([0-9]+)/);
    if (tiktokMatch && tiktokMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
    }

    // 8. Twitch Clip
    const twitchClip = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    if (twitchClip && twitchClip[1]) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return `https://clips.twitch.tv/embed?clip=${twitchClip[1]}&parent=${hostname}`;
    }

    // 9. Rumble Video
    if (url.includes('rumble.com')) {
      if (url.includes('/embed/')) return url;
      const rumbleMatch = url.match(/rumble\.com\/(v[a-zA-Z0-9_-]+)/);
      if (rumbleMatch && rumbleMatch[1]) {
        return `https://rumble.com/embed/${rumbleMatch[1]}/`;
      }
    }

    // 10. Bilibili
    const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (biliMatch && biliMatch[1]) {
      return `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&high_quality=1&danmaku=0`;
    }

    // 11. OK.ru
    const okMatch = url.match(/ok\.ru\/(?:video|videoembed)\/([0-9]+)/);
    if (okMatch && okMatch[1]) {
      return `https://ok.ru/videoembed/${okMatch[1]}`;
    }

    // 12. Archive.org
    const archiveMatch = url.match(/archive\.org\/(?:details|embed)\/([a-zA-Z0-9_-]+)/);
    if (archiveMatch && archiveMatch[1]) {
      return `https://archive.org/embed/${archiveMatch[1]}`;
    }

    // 13. Streamable
    const streamableMatch = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
    if (streamableMatch && streamableMatch[1]) {
      return `https://streamable.com/e/${streamableMatch[1]}?autoplay=1`;
    }

    // 14. Loom
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    // 15. Direct MP4, HLS, WebM, Ogg files -> return null so HTML5 <video> renders directly
    if (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.m3u8') ||
      url.endsWith('.mov') ||
      url.endsWith('.mkv') ||
      url.endsWith('.ogg') ||
      url.includes('.mp4?') ||
      url.includes('commondatastorage.googleapis.com') ||
      url.includes('cloudinary.com') ||
      url.includes('firebasestorage')
    ) {
      return null;
    }

    // 16. Generic Embed / Web iFrame URLs
    if (
      url.includes('embed') ||
      url.includes('iframe') ||
      url.includes('player') ||
      url.includes('view') ||
      url.includes('plugin') ||
      url.includes('watch')
    ) {
      return url;
    }

    return null;
  };

  const detectedEmbedUrl = getEmbedUrl(activeVideoUrl);
  const platformInfo = getPlatformName(activeVideoUrl);

  // Final determination whether to use iFrame or HTML5 Video
  const isIframeMode = playerMode === 'iframe' || (playerMode === 'auto' && detectedEmbedUrl !== null);

  // Server switch handler
  const handleSelectServer = (serverNum: number) => {
    setActiveServer(serverNum);
    setVideoError(false);
    setIsBuffering(false);
    
    let base = activeEpisode ? activeEpisode.videoUrl : (activePart ? activePart.videoUrl : movie.videoUrl);
    if (serverNum === 1) {
      setActiveVideoUrl(base);
    } else if (serverNum === 2) {
      setActiveVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    } else if (serverNum === 3) {
      setActiveVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');
    } else if (serverNum === 4) {
      setActiveVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    } else if (serverNum === 5) {
      setActiveVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
    }
  };

  // Attempt autoplay when video changes
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current && !isIframeMode) {
      videoRef.current.currentTime = 0;
      if (videoRef.current.readyState === 0) {
        videoRef.current.load();
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay blocked by browser policy, user play required:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [activeVideoUrl, isIframeMode]);

  // Track watch progress
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const pct = Math.round((currentTime / duration) * 100);
      updateWatchHistory(movie.id, pct);
    }
  }, [currentTime, duration, movie.id]);

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          if (videoRef.current.readyState === 0) {
            videoRef.current.load();
          }
          await videoRef.current.play();
          setIsPlaying(true);
          setVideoError(false);
        } catch (err) {
          console.log('Play attempt 1 unmuted failed, trying muted play:', err);
          try {
            videoRef.current.muted = true;
            setIsMuted(true);
            await videoRef.current.play();
            setIsPlaying(true);
            setVideoError(false);
          } catch (err2) {
            console.warn('Play attempt unmuted & muted blocked by browser sandbox policy:', err2);
            // Fallback to native controls if iframe/browser blocks custom play trigger
            setUseNativeControls(true);
            setVideoError(false);
            setIsPlaying(false);
          }
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime;
      setCurrentTime(curTime);
      setDuration(videoRef.current.duration || 0);

      // Check for midroll ads
      if (!isAdPlaying && movieAds.length > 0) {
        const midroll = movieAds.find(
          (a) =>
            a.placement === 'midroll' &&
            a.midrollTimestamp !== undefined &&
            Math.abs(curTime - a.midrollTimestamp) <= 1.2 &&
            !playedAdIds.has(a.id)
        );

        if (midroll) {
          videoRef.current.pause();
          setIsPlaying(false);
          setPlayedAdIds((prev) => new Set(prev).add(midroll.id));
          setActiveAd(midroll);
          setIsAdPlaying(true);
          const delay = midroll.skipAfterSeconds !== undefined ? midroll.skipAfterSeconds : 5;
          setAdSkipCountdown(delay);
          setCanSkipAd(delay <= 0);
        }
      }
    }
  };

  const handleMainVideoEnded = () => {
    setIsPlaying(false);
    const postroll = movieAds.find((a) => a.placement === 'postroll' && !playedAdIds.has(a.id));
    if (postroll) {
      setPlayedAdIds((prev) => new Set(prev).add(postroll.id));
      setActiveAd(postroll);
      setIsAdPlaying(true);
      const delay = postroll.skipAfterSeconds !== undefined ? postroll.skipAfterSeconds : 5;
      setAdSkipCountdown(delay);
      setCanSkipAd(delay <= 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      videoRef.current.muted = nextMute;
    }
  };

  const handleFullscreen = async () => {
    if (containerRef.current) {
      try {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } else {
          const elem = containerRef.current as any;
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        }
      } catch (err) {
        console.warn('Fullscreen operation not supported or denied in iframe:', err);
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleShare = async () => {
    await copyToClipboard(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainSecs = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remainSecs < 10 ? '0' : ''}${remainSecs}`;
  };

  // Related movies
  const relatedMovies = allMovies
    .filter((m) => m.id !== movie.id && (m.genres.some((g) => movie.genres.includes(g)) || m.type === movie.type))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* Top back button header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          id="video-player-back-btn"
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center space-x-2">
          {movie.isAgasobanuye && (
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-zinc-950 font-black text-xs uppercase">
              Agasobanuye ({movie.interpreterName})
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-bold text-xs">
            {movie.year}
          </span>
        </div>
      </div>

      {/* Main Video Player Canvas Container */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        
        {/* Multi-Source Stream Bar & Platform Detector */}
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2 bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-300 pl-1">
              <Server className="w-4 h-4 text-red-500" />
              <span>{lang === 'rw' ? 'Isoko ya Stream:' : 'Stream Source:'}</span>
            </div>

            {/* Platform Tag */}
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black border ${platformInfo.color}`}>
              <span>{platformInfo.icon}</span>
              <span>{platformInfo.name}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Player Engine Switcher */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
              <span className="text-zinc-500 px-2 text-[10px] hidden sm:inline">{lang === 'rw' ? 'Player Engine:' : 'Engine:'}</span>
              <button
                type="button"
                onClick={() => setPlayerMode('auto')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerMode === 'auto'
                    ? 'bg-red-600 text-white font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('iframe')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerMode === 'iframe'
                    ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                iFrame Embed
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('html5')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerMode === 'html5'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                HTML5 MP4
              </button>
            </div>

            {/* Server Mirror Buttons */}
            <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
              {[
                { num: 1, label: lang === 'rw' ? 'Server 1 (Primary)' : 'Server 1' },
                { num: 2, label: lang === 'rw' ? 'Server 2 (CDN)' : 'Server 2' },
                { num: 3, label: lang === 'rw' ? 'Server 3 (1080p)' : 'Server 3' },
                { num: 4, label: lang === 'rw' ? 'Server 4 (Backup)' : 'Server 4' },
              ].map((srv) => (
                <button
                  key={srv.num}
                  onClick={() => handleSelectServer(srv.num)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    activeServer === srv.num
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          id="video-container"
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group"
        >
          {/* ACTIVE VIDEO AD OVERLAY ENGINE */}
          {isAdPlaying && activeAd && (
            <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between animate-fadeIn">
              {/* Video element for Ad */}
              <video
                ref={adVideoRef}
                src={activeAd.videoUrl}
                autoPlay
                playsInline
                onEnded={handleFinishAd}
                className="w-full h-full object-contain"
              />

              {/* Top Header of Ad Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
                <div className="flex items-center space-x-2 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/50 text-amber-400 font-extrabold text-xs shadow-2xl">
                  <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Injangwe y'Anonsi (Ad) • {activeAd.advertiserName || activeAd.title}</span>
                </div>

                {activeAd.targetUrl && (
                  <a
                    href={activeAd.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-lg"
                  >
                    <span>Sura Advertiser</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Bottom Control / Skip Ad Button */}
              <div className="absolute bottom-6 right-6 z-10 pointer-events-auto">
                {canSkipAd ? (
                  <button
                    onClick={handleFinishAd}
                    className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm px-5 py-2.5 rounded-2xl shadow-2xl transition-all transform hover:scale-105 cursor-pointer animate-pulse"
                  >
                    <span>Simbuka Ad (Skip Ad)</span>
                    <SkipForward className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                  </button>
                ) : (
                  <div className="bg-zinc-950/90 text-zinc-200 font-mono text-xs px-4 py-2 rounded-xl border border-zinc-700 shadow-xl">
                    Ushobora gusimbuka anonsi mu masagonda {adSkipCountdown}s...
                  </div>
                )}
              </div>
            </div>
          )}

          {isIframeMode ? (
            /* Universal Embed IFRAME Player (YouTube, Vimeo, Google Drive, Facebook, TikTok, Dailymotion, Streamable, Rumble, OK.ru, Archive.org, etc.) */
            <iframe
              src={detectedEmbedUrl || activeVideoUrl}
              title={displayTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          ) : (
            /* Standard HTML5 Media Video Player */
            <>
              <video
                ref={videoRef}
                src={activeVideoUrl}
                poster={activeEpisode?.thumbnailUrl || movie.backdropUrl || movie.posterUrl}
                preload="auto"
                playsInline
                controls={useNativeControls}
                onPlay={() => {
                  setIsPlaying(true);
                  setVideoError(false);
                }}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onError={() => {
                  setVideoError(true);
                  setIsPlaying(false);
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleMainVideoEnded}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Buffering Spinner Overlay */}
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-20">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-zinc-300">Streaming Full HD...</span>
                  </div>
                </div>
              )}

              {/* Video Error Fallback */}
              {videoError && (
                <div className="absolute inset-0 bg-zinc-950/95 flex items-center justify-center p-6 z-40 text-center">
                  <div className="max-w-md space-y-3">
                    <Film className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-base font-bold text-white">Video Stream Switch Needed</h3>
                    <p className="text-xs text-zinc-400">
                      Link ya video ntirimo gucuranga neza kuri uyu murongo. Kanda hano Uhindure Server ya Backup vuba cyangwa koresha Native Player:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => handleSelectServer(2)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                      >
                        ⚡ Switch to Fast Server 2 (CDN)
                      </button>
                      <button
                        onClick={() => handleSelectServer(3)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                      >
                        ⚡ Switch to Backup Server 3
                      </button>
                      <button
                        onClick={() => {
                          setUseNativeControls(true);
                          setVideoError(false);
                          if (videoRef.current) {
                            videoRef.current.play().catch((err) => console.log('Native play response:', err));
                          }
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 cursor-pointer"
                      >
                        Koresha Native Player
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Central Big Play Banner when Paused / Stopped */}
              {!isPlaying && !videoError && !useNativeControls && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-black/50 flex items-center justify-center p-4 cursor-pointer z-30 animate-fadeIn"
                >
                  <div className="flex flex-col items-center text-center space-y-4 max-w-lg transform hover:scale-105 transition-transform">
                    {/* Glowing Big Play Button */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-red-600/40 rounded-full blur-xl animate-pulse" />
                      <button
                        id="play-overlay-center-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-950/90 border-2 border-red-400/50"
                      >
                        <Play className="w-10 h-10 md:w-12 md:h-12 fill-white text-white ml-1.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md">
                        {lang === 'rw' ? 'Kanda hano urebe filme yose' : 'Click to Watch Full Movie'}
                      </h3>
                      <p className="text-xs md:text-sm text-amber-400 font-bold">
                        {movie.isAgasobanuye ? `Agasobanuye ka ${movie.interpreterName}` : 'Original Cinema HD'} • {movie.runtime || 'Full Movie'}
                      </p>
                    </div>

                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'rw' ? 'Isaha n\'umunota: 1080p Ultra HD' : 'Full HD 1080p Streaming'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtitles Overlay Simulation */}
              {subtitles !== 'off' && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-amber-300 px-4 py-1.5 rounded-lg text-sm font-semibold max-w-xl text-center pointer-events-none border border-amber-500/30 z-20">
                  {subtitles === 'rw' ? (
                    <span>[Subtitles Kinyarwanda]: {activeEpisode ? activeEpisode.kinyarwandaTitle : displayTitle} - Komeza urebe sinema ku RebaMovie</span>
                  ) : (
                    <span>[Subtitles English]: Streaming in high definition on RebaMovie platform</span>
                  )}
                </div>
              )}

              {/* Player Custom Controls Overlay */}
              {!useNativeControls && (
                <div 
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      togglePlay();
                    }
                  }}
                  className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 transition-opacity duration-300 flex flex-col justify-between p-4 md:p-6 pointer-events-none ${
                    !isPlaying ? 'opacity-100 pointer-events-auto z-20' : 'opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto'
                  }`}
                >
                
                {/* Top Bar of Overlay */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-white drop-shadow">
                      {displayTitle}
                    </h2>
                    {activeEpisode && (
                      <p className="text-xs text-amber-400 font-medium">
                        {lang === 'rw' ? activeEpisode.kinyarwandaTitle : activeEpisode.title}
                      </p>
                    )}
                  </div>

                  {/* Settings Dropdown Button */}
                  <div className="relative">
                    <button
                      id="player-settings-btn"
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-all pointer-events-auto"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {/* Settings Menu Popup */}
                    {showSettings && (
                      <div className="absolute right-0 top-12 z-50 w-72 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl text-xs space-y-4 pointer-events-auto">
                        
                        {/* Audio Track Option */}
                        <div>
                          <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {t('audioTrack')}
                          </span>
                          <div className="space-y-1">
                            <button
                              onClick={() => setAudioTrack('original')}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                audioTrack === 'original' ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span>{t('originalAudio')}</span>
                              {audioTrack === 'original' && <Check className="w-4 h-4" />}
                            </button>

                            {movie.isAgasobanuye && (
                              <button
                                onClick={() => setAudioTrack('agasobanuye')}
                                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                  audioTrack === 'agasobanuye' ? 'bg-amber-500 text-zinc-950 font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                <span>{t('agasobanuyeAudio')}</span>
                                {audioTrack === 'agasobanuye' && <Check className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subtitles Option */}
                        <div>
                          <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {t('subtitles')}
                          </span>
                          <div className="space-y-1">
                            <button
                              onClick={() => setSubtitles('off')}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                subtitles === 'off' ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span>Off</span>
                              {subtitles === 'off' && <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setSubtitles('rw')}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                subtitles === 'rw' ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span>Kinyarwanda</span>
                              {subtitles === 'rw' && <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setSubtitles('en')}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                subtitles === 'en' ? 'bg-red-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span>English</span>
                              {subtitles === 'en' && <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Quality Selector */}
                        <div>
                          <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {t('quality')}
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            {(['360p', '720p', '1080p', '4k'] as const).map((q) => (
                              <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`px-2 py-1 rounded text-center font-bold ${
                                  quality === q ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {q === '360p' ? t('dataSaver') : q.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Speed Selector */}
                        <div>
                          <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {t('playbackSpeed')}
                          </span>
                          <div className="flex justify-between gap-1">
                            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => changeSpeed(s)}
                                className={`px-2 py-1 rounded text-center text-xs font-bold ${
                                  playbackSpeed === s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Player Controls Style */}
                        <div>
                          <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {lang === 'rw' ? 'Ubwoko bw\'ibifunguzo (Player Controls)' : 'Player Controls'}
                          </span>
                          <button
                            onClick={() => setUseNativeControls(!useNativeControls)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                              useNativeControls ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            <span>{useNativeControls ? (lang === 'rw' ? 'Native Browser Controls' : 'Native Browser Controls') : (lang === 'rw' ? 'Custom RebaMovie Player' : 'Custom Player')}</span>
                            {useNativeControls && <Check className="w-4 h-4 text-zinc-950" />}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Big Play/Pause Toggle */}
                <div className="flex items-center justify-center space-x-6 pointer-events-auto">
                  <button
                    onClick={() => skipTime(-10)}
                    className="p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 backdrop-blur-md transition-all"
                    title="Seek Back 10s"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>

                  <button
                    id="player-main-play-btn"
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-950/90 transition-all transform hover:scale-110"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 backdrop-blur-md transition-all"
                    title="Seek Forward 10s"
                  >
                    <RotateCw className="w-6 h-6" />
                  </button>
                </div>

                {/* Bottom Controls Bar */}
                <div className="space-y-2 pointer-events-auto">
                  {/* Progress Slider Bar */}
                  <div className="flex items-center space-x-3 text-xs font-mono font-bold text-zinc-300">
                    <span>{formatTime(currentTime)}</span>
                    <div className="relative w-full flex items-center">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full accent-red-600 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                      />
                      {/* Midroll Ad Yellow Indicators */}
                      {duration > 0 &&
                        movieAds
                          .filter((a) => a.placement === 'midroll' && a.midrollTimestamp !== undefined)
                          .map((ad) => {
                            const leftPct = Math.min(100, Math.max(0, ((ad.midrollTimestamp || 0) / duration) * 100));
                            return (
                              <div
                                key={ad.id}
                                title={`Ad: ${ad.title} (${formatTime(ad.midrollTimestamp || 0)})`}
                                style={{ left: `${leftPct}%` }}
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-3 bg-amber-400 rounded-sm pointer-events-none shadow-md z-10 border border-black/30"
                              />
                            );
                          })}
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Bottom buttons: Volume, Fullscreen, Quality Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={toggleMute} className="text-zinc-300 hover:text-white">
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 accent-red-600 h-1 bg-zinc-700 rounded-lg cursor-pointer hidden sm:block"
                        />
                      </div>

                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                        {quality.toUpperCase()}
                      </span>
                    </div>

                    <button
                      id="player-fullscreen-btn"
                      onClick={handleFullscreen}
                      className="text-zinc-300 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Primary Action Toolbar & Details Section */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Title, Action Buttons ("Sankara", "Yirebe", "Yirebe Nyuma"), Synopsis, Episodes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Toolbar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {displayTitle}
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {movie.year} • {movie.runtime} • {movie.genres.join(', ')}
                </p>
              </div>

              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{movie.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Action Buttons: Watch Later, Favorites, Share, Download */}
            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-6">
              
              {/* Watch Later */}
              <button
                id="btn-yirebe-nyuma-watch-later"
                onClick={() => toggleWatchLater(movie.id)}
                className={`px-5 py-3 rounded-xl font-semibold border transition-all flex items-center space-x-2 ${
                  inWatchLater
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{inWatchLater ? (lang === 'rw' ? 'Isimbujwe muri Yirebe Nyuma' : 'In Watch Later') : t('watchLater')}</span>
              </button>

              {/* Add to Favorites */}
              <button
                id="btn-toggle-favorite"
                onClick={() => toggleFavorite(movie.id)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                  favorite
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                }`}
                title={t('addToFavorites')}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-white' : ''}`} />
              </button>

              {/* Share */}
              <button
                id="btn-share-movie"
                onClick={handleShare}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors relative"
                title={t('share')}
              >
                <Share2 className="w-5 h-5" />
                {copiedToast && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap font-bold">
                    Copied link!
                  </span>
                )}
              </button>

              {/* Download Movie */}
              <button
                id="btn-download-movie"
                onClick={handleDownloadMovie}
                className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold border border-amber-400/40 transition-transform active:scale-95 flex items-center space-x-2 relative shadow-lg shadow-amber-950/40"
                title="Download Movie"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">{lang === 'rw' ? 'Manura (Download)' : 'Download'}</span>
                {downloadToast && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-[10px] px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap font-black animate-bounce border border-amber-300">
                    📥 Download started ({quality})!
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Description & Cast Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">
              {t('moreDetails')}
            </h3>
            
            <p className="text-zinc-300 leading-relaxed text-sm">
              {displayDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-800/80">
              <div>
                <span className="text-zinc-400 font-bold block mb-1">Director:</span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-bold block mb-1">Cast:</span>
                <span className="text-white font-medium">{movie.cast.join(', ')}</span>
              </div>
              {movie.isAgasobanuye && (
                <div>
                  <span className="text-amber-400 font-bold block mb-1">Umusobanuzi (Interpreter):</span>
                  <span className="text-amber-300 font-bold">{movie.interpreterName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Series Episodes List & Season Selector */}
          {movie.type === 'series' && movie.episodes && movie.episodes.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
              
              {/* Header with Season Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-950/80 border border-red-800/60 rounded-xl">
                    <Tv className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      {t('episodes')} ({filteredEpisodes.length} {lang === 'rw' ? 'muri Season' : 'in Season'} {selectedSeason})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {lang === 'rw' ? 'Hitamo Season n\'Igice wifuza kureba' : 'Select a season and episode to stream'}
                    </p>
                  </div>
                </div>

                {/* Season Pills Selector */}
                {availableSeasons.length > 0 && (
                  <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    {availableSeasons.map((seasonNum) => {
                      const count = movie.episodes?.filter((e) => e.seasonNumber === seasonNum).length || 0;
                      const isSelected = selectedSeason === seasonNum;
                      return (
                        <button
                          key={seasonNum}
                          onClick={() => {
                            setSelectedSeason(seasonNum);
                            const seasonEps = movie.episodes?.filter((e) => e.seasonNumber === seasonNum);
                            if (seasonEps && seasonEps.length > 0) {
                              setActiveEpisode(seasonEps[0]);
                              setActivePart(null);
                              setIsPlaying(true);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/80 scale-105'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{lang === 'rw' ? `Season ${seasonNum}` : `Season ${seasonNum}`}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Episodes Grid for Selected Season */}
              <div className="space-y-3">
                {filteredEpisodes.map((ep) => {
                  const isActive = activeEpisode?.id === ep.id;
                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        setActiveEpisode(ep);
                        setActivePart(null);
                        setIsPlaying(true);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 ${
                        isActive
                          ? 'bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-900 border-red-600 shadow-xl shadow-red-950/30 ring-1 ring-red-500/50'
                          : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="relative w-full md:w-36 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 group">
                        <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isActive ? 'bg-red-900/40 opacity-100' : 'bg-black/30 opacity-80 group-hover:opacity-100'}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-red-600 text-white shadow-lg animate-pulse' : 'bg-white/20 hover:bg-red-600 text-white'}`}>
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {ep.runtime}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                              S{ep.seasonNumber} : E{ep.episodeNumber}
                            </span>
                            <h4 className={`font-extrabold text-sm truncate ${isActive ? 'text-red-400 font-black' : 'text-white'}`}>
                              {lang === 'rw' ? ep.kinyarwandaTitle : ep.title}
                            </h4>
                          </div>

                          {isActive && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                              {lang === 'rw' ? 'Irarekana' : 'Playing Now'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {lang === 'rw' ? ep.kinyarwandaDescription : ep.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Movie Parts Section (Paki za Filme 1, 2, 3...) */}
          {((movie.parts && movie.parts.length > 0) || movie.type === 'movie') && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-950/80 border border-amber-800/60 rounded-xl">
                    <ListVideo className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      {lang === 'rw' ? 'Ibyiciro n\'Ibyigenewe bya Filme (Parts / Paki)' : 'Movie Parts & Sequel Saga'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {lang === 'rw' ? 'Kanda hano ku gice (Part) cyangwa Paki ushaka kureba' : 'Select a movie part or sequel to watch'}
                    </p>
                  </div>
                </div>

                {movie.franchiseName && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {movie.franchiseName}
                  </span>
                )}
              </div>

              {movie.parts && movie.parts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {movie.parts.map((part) => {
                    const isPartActive = activePart?.id === part.id && !activeEpisode;
                    return (
                      <div
                        key={part.id}
                        onClick={() => {
                          setActivePart(part);
                          setActiveEpisode(null);
                          setIsPlaying(true);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isPartActive
                            ? 'bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-900 border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-400'
                            : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                          <img
                            src={part.thumbnailUrl || movie.posterUrl}
                            alt={part.title}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center ${isPartActive ? 'bg-amber-950/40' : 'bg-black/30'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPartActive ? 'bg-amber-500 text-zinc-950' : 'bg-white/20 text-white'}`}>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                            Part {part.partNumber}
                          </span>
                          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {part.runtime}
                          </span>
                        </div>

                        <div>
                          <h4 className={`font-bold text-xs line-clamp-1 ${isPartActive ? 'text-amber-400' : 'text-white'}`}>
                            {lang === 'rw' ? part.kinyarwandaTitle : part.title}
                          </h4>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            {lang === 'rw' ? `Igice cya ${part.partNumber}` : `Part ${part.partNumber}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    {lang === 'rw'
                      ? 'Iyi filme ifite igice kimwe kiboneka mu buryo buze (Single Full Movie Stream HD).'
                      : 'This movie is available in a single full feature HD stream.'}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Col: Related Movies & Quick Suggestions */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{t('relatedMovies')}</span>
            </h3>

            <div className="space-y-4">
              {relatedMovies.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectMovie(rel)}
                  className="flex space-x-3 p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group"
                >
                  <img
                    src={rel.posterUrl}
                    alt={rel.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-red-500 transition-colors line-clamp-1">
                        {lang === 'rw' && rel.kinyarwandaTitle ? rel.kinyarwandaTitle : rel.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {rel.year} • {rel.runtime}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rel.rating.toFixed(1)}</span>
                      </span>
                      {rel.isAgasobanuye && (
                        <span className="text-amber-300 font-black">Agasobanuye</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showDownloadModal && (
        <DownloadSpeedModal
          movie={movie}
          videoUrl={activeVideoUrl}
          customTitle={
            activeEpisode 
              ? `${lang === 'rw' && movie.kinyarwandaTitle ? movie.kinyarwandaTitle : movie.title} - S${activeEpisode.seasonNumber}E${activeEpisode.episodeNumber}: ${lang === 'rw' ? activeEpisode.kinyarwandaTitle : activeEpisode.title}`
              : activePart
              ? `${lang === 'rw' && movie.kinyarwandaTitle ? movie.kinyarwandaTitle : movie.title} - ${lang === 'rw' ? activePart.kinyarwandaTitle : activePart.title}`
              : (lang === 'rw' && movie.kinyarwandaTitle ? movie.kinyarwandaTitle : movie.title)
          }
          onClose={() => setShowDownloadModal(false)}
        />
      )}

    </div>
  );
};
