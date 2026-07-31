import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, Heart, Star, Volume2, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies, onSelectMovie }) => {
  const { lang, t } = useLanguage();
  const { isFavorite, toggleFavorite, isInWatchLater, toggleWatchLater } = useAuth();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const featuredList = movies.filter((m) => m.isFeatured || m.isTrending).slice(0, 4);
  const currentMovie = featuredList[currentIndex] || movies[0];

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredList.length]);

  if (!currentMovie) return null;

  const title = currentMovie.title;
  const description = lang === 'rw' && currentMovie.kinyarwandaDescription ? currentMovie.kinyarwandaDescription : currentMovie.description;
  const favorite = isFavorite(currentMovie.id);
  const inWatchLater = isInWatchLater(currentMovie.id);

  return (
    <div className="relative w-full h-[520px] md:h-[600px] rounded-2xl overflow-hidden bg-zinc-950 my-4 border border-zinc-800/80 shadow-2xl group">
      {/* Backdrop Image */}
      <img
        src={currentMovie.backdropUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        referrerPolicy="no-referrer"
      />

      {/* Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

      {/* Hero Info Container */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-12">
        <div className="max-w-2xl space-y-4">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow">
              {t('featuredTitle')}
            </span>

            {currentMovie.isAgasobanuye && (
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-500 text-zinc-950 text-xs font-black uppercase tracking-wider shadow">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Agasobanuye ({currentMovie.interpreterName})</span>
              </span>
            )}

            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/90 text-amber-400 text-xs font-bold border border-zinc-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentMovie.rating.toFixed(1)}</span>
            </div>

            <span className="text-xs font-semibold text-zinc-300">
              {currentMovie.year} • {currentMovie.runtime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {title}
          </h1>

          {/* Description */}
          <p className="text-zinc-300 text-sm md:text-base line-clamp-3 leading-relaxed drop-shadow">
            {description}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentMovie.genres.map((g) => (
              <span key={g} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900/80 text-zinc-300 border border-zinc-700/60 font-medium">
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons: Sankara (Play) / Yirebe Nyuma (Watch Later) / Details */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            
            {/* Play Button ("Sankara" / "Yirebe") */}
            <button
              id={`hero-play-btn-${currentMovie.id}`}
              onClick={() => onSelectMovie(currentMovie)}
              className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-950/60 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{t('play')}</span>
            </button>

            {/* Watch Later ("Yirebe Nyuma") */}
            <button
              id={`hero-watch-later-btn-${currentMovie.id}`}
              onClick={() => toggleWatchLater(currentMovie.id)}
              className={`px-5 py-3.5 rounded-xl font-semibold border transition-all flex items-center space-x-2 ${
                inWatchLater
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-950/50'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200 backdrop-blur-md'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('watchLater')}</span>
            </button>

            {/* Favorite button */}
            <button
              id={`hero-favorite-btn-${currentMovie.id}`}
              onClick={() => toggleFavorite(currentMovie.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
                favorite
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200 backdrop-blur-md'
              }`}
              title={t('addToFavorites')}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-white' : ''}`} />
            </button>

            {/* Details */}
            <button
              id={`hero-details-btn-${currentMovie.id}`}
              onClick={() => onSelectMovie(currentMovie)}
              className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 backdrop-blur-md transition-all"
              title={t('moreDetails')}
            >
              <Info className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>

      {/* Carousel Navigation Arrows & Indicators */}
      {featuredList.length > 1 && (
        <>
          <button
            id="hero-prev-btn"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:border-red-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            id="hero-next-btn"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:border-red-500"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 right-6 z-20 flex items-center space-x-2">
            {featuredList.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};
