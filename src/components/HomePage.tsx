import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroBanner from './HeroBanner';
import MediaRow from './MediaRow';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlaying,
  getUpcomingMovies,
  getPopularTV,
  getTopRatedTV,
  getAiringToday,
} from '../lib/tmdb';

const SkeletonRow: React.FC = () => (
  <div className="py-6 px-6 md:px-10">
    <div className="h-6 w-40 rounded-full animate-shimmer mb-6" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-[200px] h-[295px] rounded-3xl flex-shrink-0 animate-shimmer" />
      ))}
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  const { data: popularMovies, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: () => getPopularMovies(),
  });

  const { data: topRatedMovies } = useQuery({
    queryKey: ['topRated', 'movie'],
    queryFn: () => getTopRatedMovies(),
  });

  const { data: nowPlaying } = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: () => getNowPlaying(),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['upcoming'],
    queryFn: () => getUpcomingMovies(),
  });

  const { data: popularTV } = useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => getPopularTV(),
  });

  const { data: topRatedTV } = useQuery({
    queryKey: ['topRated', 'tv'],
    queryFn: () => getTopRatedTV(),
  });

  const { data: airingToday } = useQuery({
    queryKey: ['airingToday'],
    queryFn: () => getAiringToday(),
  });

  const trendingResults = trending?.results?.map(m => ({
    ...m,
    media_type: m.media_type || 'movie',
  })) || [];

  const heroMovies = trendingResults.filter(m => m.backdrop_path);

  return (
    <div className="min-h-screen">
      {loadingTrending ? (
        <div className="h-screen bg-gradient-to-b from-red-950/20 to-[#0a0505] animate-shimmer" />
      ) : heroMovies.length > 0 ? (
        <HeroBanner movies={heroMovies} />
      ) : null}

      {loadingTrending ? (
        <SkeletonRow />
      ) : trendingResults.length > 0 ? (
        <MediaRow
          title="Trending"
          movies={trendingResults}
          cardSize="md"
        />
      ) : null}

      {nowPlaying?.results && (
        <MediaRow
          title="In Theaters"
          movies={nowPlaying.results.map(m => ({ ...m, media_type: 'movie' }))}
          cardSize="md"
        />
      )}

      {loadingPopular ? (
        <SkeletonRow />
      ) : popularMovies?.results ? (
        <MediaRow
          title="Popular Movies"
          movies={popularMovies.results.map(m => ({ ...m, media_type: 'movie' }))}
          cardSize="lg"
          showRank
        />
      ) : null}

      {popularTV?.results && (
        <MediaRow
          title="Popular Series"
          movies={popularTV.results.map(m => ({ ...m, media_type: 'tv' }))}
          cardSize="md"
        />
      )}

      {topRatedMovies?.results && (
        <MediaRow
          title="Top Rated"
          movies={topRatedMovies.results.map(m => ({ ...m, media_type: 'movie' }))}
          cardSize="md"
        />
      )}

      {airingToday?.results && (
        <MediaRow
          title="Airing Today"
          movies={airingToday.results.map(m => ({ ...m, media_type: 'tv' }))}
          cardSize="md"
        />
      )}

      {topRatedTV?.results && (
        <MediaRow
          title="Top Series"
          movies={topRatedTV.results.map(m => ({ ...m, media_type: 'tv' }))}
          cardSize="md"
          showRank
        />
      )}

      {upcoming?.results && (
        <MediaRow
          title="Coming Soon"
          movies={upcoming.results.map(m => ({ ...m, media_type: 'movie' }))}
          cardSize="md"
        />
      )}

      <div className="h-20" />
    </div>
  );
};

export default HomePage;
