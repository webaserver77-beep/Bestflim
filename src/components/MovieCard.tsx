import React, { useState } from 'react';
import { Movie } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Play, Star, Clock, Heart, Volume2, Download, Mic } from 'lucide-react';
import { DownloadSpeedModal } from './DownloadSpeedModal';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelectMovie }) => {
  const { lang, t } = useLanguage();
  const { isFavorite, toggleFavorite, isInWatchLater, toggleWatchLater } = useAuth();
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const favorite = isFavorite(movie.id);
  const inWatchLater = isInWatchLater(movie.id);

  const displayTitle = movie.title;

  return (
    <div 
      id={`movie-card-${movie.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 shadow-lg hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Poster Container */}
      <div 
        onClick={() => onSelectMovie(movie)}
        className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-zinc-950"
      >
        <img
          src={movie.posterUrl}
          alt={displayTitle}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
          {movie.isAgasobanuye ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-black tracking-wider uppercase shadow-md">
              <Volume2 className="w-3 h-3" />
              <span>Agasobanuye</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-md text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-zinc-700/50">
              {movie.type === 'series' ? 'Series' : 'Film'}
            </span>
          )}

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold border border-zinc-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom Poster Overlay Badge for Interpreter */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <div className="px-2 py-0.5 rounded-md bg-zinc-950/90 backdrop-blur-md text-amber-400 text-[10px] font-black flex items-center space-x-1 border border-amber-500/40 shadow-lg">
            <Mic className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[130px]">
              {movie.interpreterName || 'Original'}
            </span>
          </div>
        </div>

        {/* Hover Quick Action Buttons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
          <div className="flex items-center space-x-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            
            {/* Sankara / Play Button */}
            <button
              id={`quick-play-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectMovie(movie);
              }}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950/80 transition-all transform hover:scale-110"
              title={t('play')}
            >
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            </button>

            {/* Watch Later Button */}
            <button
              id={`quick-watch-later-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchLater(movie.id);
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                inWatchLater
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={t('watchLater')}
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* Favorite Button */}
            <button
              id={`quick-favorite-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie.id);
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                favorite
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={t('addToFavorites')}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />
            </button>

            {/* Turbo Download Button */}
            <button
              id={`quick-download-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadModal(true);
              }}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 border border-amber-400/80 flex items-center justify-center transition-all shadow-md hover:scale-105"
              title="Turbo Download"
            >
              <Download className="w-4 h-4 fill-zinc-950" />
            </button>

          </div>
        </div>
      </div>

      {showDownloadModal && (
        <DownloadSpeedModal
          movie={movie}
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      {/* Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-medium mb-1">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime}</span>
          </div>

          <h3 
            onClick={() => onSelectMovie(movie)}
            className="text-sm font-bold text-white line-clamp-1 hover:text-red-500 cursor-pointer transition-colors"
          >
            {displayTitle}
          </h3>

          {/* Interpreter / Umusobanuzi Name Label */}
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-400 mt-1">
            <Mic className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {lang === 'rw' ? 'Umusobanuzi:' : 'Interpreter:'}{' '}
              <span className="text-zinc-200 font-extrabold">
                {movie.interpreterName || 'Original'}
              </span>
            </span>
          </div>
        </div>

        {/* Genres & High-Speed Download Action Button */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-800/80">
          <div className="flex flex-wrap gap-1 min-w-0 flex-1">
            {movie.genres.slice(0, 1).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-800 truncate"
              >
                {genre}
              </span>
            ))}
          </div>

          <button
            id={`card-download-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDownloadModal(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-[11px] tracking-wide shadow-md shadow-amber-950/50 hover:scale-105 transition-all flex-shrink-0 cursor-pointer border border-amber-300/60"
            title="Download Movie (High-Speed Turbo CDN)"
          >
            <Download className="w-3.5 h-3.5 fill-zinc-950" />
            <span>{lang === 'rw' ? 'Manura' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
