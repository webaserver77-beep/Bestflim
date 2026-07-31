import React from 'react';
import { Movie } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { HeroCarousel } from '../HeroCarousel';
import { MovieRow } from '../MovieRow';
import { PlatformAdBanner } from '../PlatformAdBanner';
import { Flame, Tv, Volume2, Sparkles, Film } from 'lucide-react';

interface HomeViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onExploreMore?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ movies, onSelectMovie }) => {
  const { t } = useLanguage();

  const trendingMovies = movies.filter((m) => m.type === 'movie' && (m.isTrending || m.rating >= 4.8));
  const trendingSeries = movies.filter((m) => m.type === 'series');
  const agasobanuyeMovies = movies.filter((m) => m.isAgasobanuye);
  const rwandanMovies = movies.filter((m) => m.genres.includes('Rwandan Cinema'));
  const newReleases = movies.filter((m) => m.isNew);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Featured Carousel */}
      <HeroCarousel movies={movies} onSelectMovie={onSelectMovie} />

      {/* Platform Sponsored Banner Ad */}
      <div className="px-4">
        <PlatformAdBanner location="banner_top" />
      </div>

      {/* Section 1: Filme zigezweho (Trending Movies) */}
      <MovieRow
        title={t('trendingMovies')}
        subtitle="Filme zikunzwe cyane ku RebaMovie mur’iyi cyumweru"
        movies={trendingMovies}
        onSelectMovie={onSelectMovie}
        icon={<Flame className="w-5 h-5 text-red-500" />}
      />

      {/* Section 2: Serie zigezweho (Trending Series) */}
      <MovieRow
        title={t('trendingSeries')}
        subtitle="Serie z\'amateka n\'ibyivugo bikunzwe mu Rwanda"
        movies={trendingSeries}
        onSelectMovie={onSelectMovie}
        icon={<Tv className="w-5 h-5 text-blue-500" />}
      />

      {/* Section 3: Agasobanuye ka Rocky & Junior */}
      <MovieRow
        title={t('agasobanuyeSection')}
        subtitle="Filme zihinduwe mu Kinyarwanda n\'abasobanuzi b\'ingirakamaro"
        movies={agasobanuyeMovies}
        onSelectMovie={onSelectMovie}
        icon={<Volume2 className="w-5 h-5 text-amber-500" />}
      />

      {/* Section 4: Filme Nyarwanda (Rwandan Cinema) */}
      <MovieRow
        title={t('rwandaLocalSection')}
        subtitle="Sinema nyarwanda y\'umwimerere ku rugamba rwo gutsinda"
        movies={rwandanMovies}
        onSelectMovie={onSelectMovie}
        icon={<Film className="w-5 h-5 text-emerald-500" />}
      />

      {/* Section 5: Izasohotse vuba (New Releases) */}
      <MovieRow
        title={t('newReleases')}
        subtitle="Zinjijwe mu rukurikirane vuba aha"
        movies={newReleases}
        onSelectMovie={onSelectMovie}
        icon={<Sparkles className="w-5 h-5 text-purple-500" />}
      />

    </div>
  );
};
