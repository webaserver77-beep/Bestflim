import React, { useRef } from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  icon?: React.ReactNode;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, subtitle, movies, onSelectMovie, icon }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="my-8 relative group">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-2">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Scroll Control Arrows */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Row Container */}
      <div
        ref={rowRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent scroll-smooth px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="w-[170px] sm:w-[200px] md:w-[220px] flex-shrink-0">
            <MovieCard movie={movie} onSelectMovie={onSelectMovie} />
          </div>
        ))}
      </div>
    </div>
  );
};
