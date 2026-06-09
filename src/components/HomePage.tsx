import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroBanner from './HeroBanner';
import MediaRow from './MediaRow';
import { useStore } from '../store/useStore';
import {
  getTrending,
  getPopularMovies,
  getNowPlaying,
  getPopularTV,
} from '../lib/tmdb';

const SkeletonRow: React.FC = () => (
  <div className="py-2 px-6 md:px-12">
    <div className="h-6 w-40 rounded-md bg-white/5 animate-pulse mb-3" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="w-[180px] h-[270px] rounded-2xl shrink-0 animate-pulse bg-white/5" />
      ))}
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { setActiveTab } = useStore();

  // Core Data Storage Queries
  const { data: trendingAll, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  const { data: trendingMovies } = useQuery({
    queryKey: ['trending', 'movie', 'week'],
    queryFn: () => getTrending('movie', 'week'),
  });

  const { data: trendingTV } = useQuery({
    queryKey: ['trending', 'tv', 'week'],
    queryFn: () => getTrending('tv', 'week'),
  });

  const { data: platformMovies } = useQuery({
    queryKey: ['discover', 'movie', 'netflix-static'],
    queryFn: async () => {
      const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_watch_providers=8&watch_region=US`);
      return res.json();
    }
  });

  const { data: platformSeries } = useQuery({
    queryKey: ['discover', 'tv', 'netflix-static'],
    queryFn: async () => {
      const res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_watch_providers=8&watch_region=US`);
      return res.json();
    }
  });

  const { data: nowPlaying } = useQuery({ queryKey: ['nowPlaying'], queryFn: () => getNowPlaying() });
  const { data: popularMovies } = useQuery({ queryKey: ['popular', 'movie'], queryFn: () => getPopularMovies() });
  const { data: popularTV } = useQuery({ queryKey: ['popular', 'tv'], queryFn: () => getPopularTV() });

  const heroMovies = trendingAll?.results?.filter((m: any) => m.backdrop_path).slice(0, 5) || [];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white antialiased font-sans select-none">
      
      {/* Hero Header Banner Slider Layer */}
      {loadingTrending ? (
        <div className="h-[80vh] w-full animate-pulse bg-white/5" />
      ) : heroMovies.length > 0 ? (
        <HeroBanner movies={heroMovies} />
      ) : null}

      {/* Main Grid Shelf Layout */}
      <div className="relative z-10 pt-12 space-y-7 pb-24">
        {loadingTrending && <SkeletonRow />}

        {/* Row 1: Trending Movies */}
        {trendingMovies?.results && (
          <div>
            <div className="px-6 md:px-12 mb-1.5 flex items-center justify-between">
              <h2 className="text-lg md:text-[20px] font-bold text-white/95 tracking-normal flex items-center gap-2">
                <span>Trending Movies</span>
                <span className="relative pb-0.5 text-white/70">
                  This Week
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500 rounded-full" />
                </span>
              </h2>
              <button 
                onClick={() => setActiveTab('movies')}
                className="text-xs text-white/45 hover:text-white transition-colors font-medium tracking-wide cursor-pointer"
              >
                View All ▷
              </button>
            </div>
            <MediaRow title="" movies={trendingMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {/* Row 2: Trending Series */}
        {trendingTV?.results && (
          <div>
            <div className="px-6 md:px-12 mb-1.5 flex items-center justify-between">
              <h2 className="text-lg md:text-[20px] font-bold text-white/95 tracking-normal flex items-center gap-2">
                <span>Trending Series</span>
                <span className="relative pb-0.5 text-white/70">
                  This Week
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500 rounded-full" />
                </span>
              </h2>
              <button 
                onClick={() => setActiveTab('series')}
                className="text-xs text-white/45 hover:text-white transition-colors font-medium tracking-wide cursor-pointer"
              >
                View All ▷
              </button>
            </div>
            <MediaRow title="" movies={trendingTV.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}

        {/* Row 3: Movies on Netflix */}
        {platformMovies?.results && (
          <div>
            <div className="px-6 md:px-12 mb-1.5 flex items-center justify-between">
              <h2 className="text-lg md:text-[20px] font-bold text-white/95 tracking-normal">Movies on Netflix</h2>
              <button 
                onClick={() => setActiveTab('movies')}
                className="text-xs text-white/45 hover:text-white transition-colors font-medium tracking-wide cursor-pointer"
              >
                View All ▷
              </button>
            </div>
            <MediaRow title="" movies={platformMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {/* Row 4: Series on Netflix */}
        {platformSeries?.results && (
          <div>
            <div className="px-6 md:px-12 mb-1.5 flex items-center justify-between">
              <h2 className="text-lg md:text-[20px] font-bold text-white/95 tracking-normal">Series on Netflix</h2>
              <button 
                onClick={() => setActiveTab('series')}
                className="text-xs text-white/45 hover:text-white transition-colors font-medium tracking-wide cursor-pointer"
              >
                View All ▷
              </button>
            </div>
            <MediaRow title="" movies={platformSeries.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}

        {/* Static Classics rows handle their custom titles via MediaRow internal parameters */}
        {nowPlaying?.results && <MediaRow title="In Theaters" movies={nowPlaying.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />}
        {popularMovies?.results && <MediaRow title="Popular Movies" movies={popularMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />}
        {popularTV?.results && <MediaRow title="Popular Series" movies={popularTV.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />}
      </div>

      <div className="h-20" />
    </div>
  );
};

export default HomePage;