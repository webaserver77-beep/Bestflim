import React, { useState, useMemo } from 'react';
import { Movie } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Search, X, Play, Sparkles, Film, Clock, Star, Tag, ChevronRight, Grid, List } from 'lucide-react';

interface SearchViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ movies, onSelectMovie, initialQuery = '' }) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState<string>(initialQuery);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Instant fast movie filtering as user types
  const filteredMovies = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return movies;

    return movies.filter((movie) => {
      const titleMatch = movie.title.toLowerCase().includes(q);
      const kinyarwandaMatch = movie.kinyarwandaTitle?.toLowerCase().includes(q);
      const interpreterMatch = movie.interpreterName?.toLowerCase().includes(q);
      const genreMatch = movie.genres.some((g) => g.toLowerCase().includes(q));
      const castMatch = movie.cast.some((c) => c.toLowerCase().includes(q));
      const directorMatch = movie.director?.toLowerCase().includes(q);
      const descMatch = movie.description?.toLowerCase().includes(q);

      return titleMatch || kinyarwandaMatch || interpreterMatch || genreMatch || castMatch || directorMatch || descMatch;
    });
  }, [movies, query]);

  // Top 5 closest instant preview items right under the search bar
  const instantPreviewMovies = useMemo(() => {
    return filteredMovies.slice(0, 5);
  }, [filteredMovies]);

  // Quick search keywords/chips for fast one-click search
  const popularKeywords = [
    { label: 'Agasobanuye ka Rocky', query: 'Rocky' },
    { label: 'Junior Giti', query: 'Junior' },
    { label: 'Action Movies', query: 'Action' },
    { label: 'Rwandan Cinema', query: 'Rwandan' },
    { label: 'Sci-Fi', query: 'Sci-Fi' },
    { label: 'Sankara', query: 'Sankara' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Search Header Banner & Instant Input Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/40 p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-wider">
              <Search className="w-4 h-4" />
              <span>{t('navSearch')} Best Films</span>
            </div>
            
            {/* View Mode Toggle Switch (Default: List view of movie names) */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
              <button
                id="search-viewmode-list-btn"
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="List of titles"
              >
                <List className="w-3.5 h-3.5" />
                <span>{lang === 'rw' ? 'Amazina' : 'Titles'}</span>
              </button>
              <button
                id="search-viewmode-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{lang === 'rw' ? 'Isura' : 'Grid'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {lang === 'rw' ? 'Shakisha Amazina ya Filme & Serie' : 'Search Movie Titles & Series'}
          </h1>

          {/* Search Input Bar with Instant Real-Time Typing Filter */}
          <div className="relative z-30">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 z-10" />
            <input
              id="search-input-field"
              type="text"
              autoFocus
              value={query}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              placeholder={lang === 'rw' ? 'Andika izina rya filme, agasobanuye, cyangwa umusobanuzi...' : 'Type movie title, interpreter, or actor name...'}
              className="w-full pl-12 pr-12 py-4 bg-zinc-950/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 text-sm md:text-base font-medium focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30 transition-all shadow-inner"
            />
            {query && (
              <button
                id="search-clear-btn"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors z-10 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Instant Floating Close Search Results Panel right attached to Search Bar */}
            {query.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-red-500/50 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-800/80 animate-fadeIn">
                <div className="px-4 py-2.5 bg-zinc-950/90 flex items-center justify-between border-b border-zinc-800">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-red-500">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      {lang === 'rw' 
                        ? `Amazina ahegereye gushaka (${instantPreviewMovies.length} mu ${filteredMovies.length})` 
                        : `Instant Close Matches (${instantPreviewMovies.length} of ${filteredMovies.length})`}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {lang === 'rw' ? 'Kanda kureba vuba' : 'Click title to stream'}
                  </span>
                </div>

                {instantPreviewMovies.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
                    {instantPreviewMovies.map((movie) => (
                      <div
                        key={`instant_${movie.id}`}
                        onClick={() => {
                          onSelectMovie(movie);
                          setIsFocused(false);
                        }}
                        className="p-3 hover:bg-zinc-800/90 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-10 h-14 rounded-lg object-cover border border-zinc-700 shrink-0 group-hover:border-red-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-red-400 transition-colors truncate">
                                {movie.title}
                              </h4>
                              {movie.isAgasobanuye && (
                                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-black rounded shrink-0">
                                  RW
                                </span>
                              )}
                            </div>

                            {movie.kinyarwandaTitle && (
                              <p className="text-[11px] text-zinc-400 truncate">
                                {movie.kinyarwandaTitle}
                              </p>
                            )}

                            <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
                              <span className="font-semibold text-zinc-300">{movie.year}</span>
                              {movie.interpreterName && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-bold">{movie.interpreterName}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="text-amber-400 font-bold flex items-center">
                                ★ {movie.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button className="px-3 py-1.5 bg-red-600 group-hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 shadow">
                          <Play className="w-3 h-3 fill-white" />
                          <span>{lang === 'rw' ? 'Reba' : 'Stream'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-300">
                      {lang === 'rw' ? 'Nta filme ibonetse kuyo washakishije.' : 'No instant match found.'}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {lang === 'rw' ? 'Gerageza kwandika izina rindi rya filme cyangwa umusobanuzi.' : 'Try typing a different movie title or interpreter name.'}
                    </p>
                  </div>
                )}

                {filteredMovies.length > 5 && (
                  <div className="px-4 py-2 bg-zinc-950 text-center border-t border-zinc-800">
                    <span className="text-[11px] text-zinc-400">
                      {lang === 'rw' 
                        ? `Izindi filme ${filteredMovies.length - 5} ziboneka muri liste iri hasi...` 
                        : `Scroll down to view ${filteredMovies.length - 5} more matching movies...`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-zinc-400 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{lang === 'rw' ? 'Ibikunze gushakishwa:' : 'Quick search:'}</span>
            </span>
            {popularKeywords.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(chip.query)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  query.toLowerCase().includes(chip.query.toLowerCase())
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-white flex items-center space-x-2">
          <Film className="w-5 h-5 text-red-500" />
          <span>
            {lang === 'rw' 
              ? `Amazina ya Filme Yabonetse (${filteredMovies.length})` 
              : `Movie Titles Found (${filteredMovies.length})`}
          </span>
        </h2>
        {query && (
          <span className="text-xs text-zinc-400">
            {lang === 'rw' ? 'Gushakisha' : 'Query'}: &quot;<span className="text-white font-semibold">{query}</span>&quot;
          </span>
        )}
      </div>

      {/* Related Movie Titles Display */}
      {filteredMovies.length > 0 ? (
        viewMode === 'list' ? (
          /* FAST CLEAN LIST OF MOVIE NAMES / TITLES */
          <div className="space-y-3">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="p-3.5 md:p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 hover:bg-zinc-850 flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                {/* Left side: Poster Thumbnail + Movie Title Details */}
                <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                  <div className="relative w-12 h-16 md:w-14 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 group-hover:border-red-500/50 transition-colors">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {movie.isAgasobanuye && (
                      <div className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[9px] font-black px-1 rounded shadow">
                        RW
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Primary Title + Kinyarwanda Title */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-white text-sm md:text-base group-hover:text-red-400 transition-colors truncate">
                        {movie.title}
                      </h3>
                      {movie.kinyarwandaTitle && (
                        <span className="text-xs text-zinc-400 font-medium truncate hidden sm:inline">
                          ({movie.kinyarwandaTitle})
                        </span>
                      )}
                    </div>

                    {/* Interpreter badge or details */}
                    {movie.isAgasobanuye && movie.interpreterName && (
                      <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3" />
                        <span>{movie.interpreterName}</span>
                      </div>
                    )}

                    {/* Meta info: Year, Runtime, Genres */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 pt-0.5">
                      <span className="font-semibold text-zinc-300">{movie.year}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{movie.runtime}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{movie.rating}</span>
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline text-zinc-400 font-medium">
                        {movie.genres.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Watch Button */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button className="px-3.5 py-2 md:px-5 md:py-2.5 rounded-xl bg-red-600 group-hover:bg-red-500 text-white text-xs md:text-sm font-bold shadow-md flex items-center space-x-1.5 transition-transform group-hover:scale-105">
                    <Play className="w-4 h-4 fill-white" />
                    <span className="hidden sm:inline">{lang === 'rw' ? 'Reba' : 'Watch'}</span>
                    <ChevronRight className="w-4 h-4 sm:hidden" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer group hover:border-red-600 transition-all p-2 space-y-2"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative bg-zinc-950">
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
                <h4 className="font-bold text-white text-xs line-clamp-1">
                  {movie.title}
                </h4>
                <p className="text-[10px] text-zinc-400">{movie.year} • {movie.genres[0]}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">{t('noResults')}</h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">
            {t('tryDifferentSearch')}
          </p>
          <button
            onClick={() => setQuery('')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all"
          >
            {lang === 'rw' ? 'Subira inyuma kureba zose' : 'Clear search and show all'}
          </button>
        </div>
      )}

    </div>
  );
};

