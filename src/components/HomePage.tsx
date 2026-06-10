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
  <div className="py-2 px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
    <div className="h-6 w-40 rounded-md bg-white/5 animate-pulse mb-4" />
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
    <div 
      className="relative min-h-screen bg-[#020204] text-white overflow-x-hidden flex flex-col justify-start pb-24 select-none"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      
      {/* Hero Header Banner Slider Layer */}
      {loadingTrending ? (
        <div className="h-[80vh] w-full animate-pulse bg-white/5" />
      ) : heroMovies.length > 0 ? (
        <div className="w-full shrink-0 relative z-10">
          <HeroBanner movies={heroMovies} />
        </div>
      ) : null }

      {/* Main Grid Shelf Layout */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 flex flex-col gap-12 mt-10 relative z-20">
        {loadingTrending && <SkeletonRow />}

        {/* Row 1: Trending Movies */}
        {trendingMovies?.results && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
                Trending Movies
              </h2>
              <button 
                onClick={() => setActiveTab('movies')}
                className="text-xs text-white/45 hover:text-white transition-colors font-bold tracking-wide cursor-pointer uppercase"
              >
                View All
              </button>
            </div>
            <MediaRow title="" movies={trendingMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {/* Row 2: Trending Series */}
        {trendingTV?.results && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
                Trending Series
              </h2>
              <button 
                onClick={() => setActiveTab('series')}
                className="text-xs text-white/45 hover:text-white transition-colors font-bold tracking-wide cursor-pointer uppercase"
              >
                View All
              </button>
            </div>
            <MediaRow title="" movies={trendingTV.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}

        {/* Row 3: Movies on Netflix */}
        {platformMovies?.results && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
                Movies on Netflix
              </h2>
              <button 
                onClick={() => setActiveTab('movies')}
                className="text-xs text-white/45 hover:text-white transition-colors font-bold tracking-wide cursor-pointer uppercase"
              >
                View All
              </button>
            </div>
            <MediaRow title="" movies={platformMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {/* Row 4: Series on Netflix */}
        {platformSeries?.results && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
                Series on Netflix
              </h2>
              <button 
                onClick={() => setActiveTab('series')}
                className="text-xs text-white/45 hover:text-white transition-colors font-bold tracking-wide cursor-pointer uppercase"
              >
                View All
              </button>
            </div>
            <MediaRow title="" movies={platformSeries.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}

        {/* Classic Media Rows */}
        {nowPlaying?.results && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
              In Theaters
            </h2>
            <MediaRow title="" movies={nowPlaying.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {popularMovies?.results && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
              Popular Movies
            </h2>
            <MediaRow title="" movies={popularMovies.results.map((m: any) => ({ ...m, media_type: 'movie' }))} />
          </div>
        )}

        {popularTV?.results && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white font-sans text-left">
              Popular Series
            </h2>
            <MediaRow title="" movies={popularTV.results.map((m: any) => ({ ...m, media_type: 'tv' }))} />
          </div>
        )}
      </div>

    </div>
  );
};

export default HomePage;