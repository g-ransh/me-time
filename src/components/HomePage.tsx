import React, { useMemo, useRef } from 'react';
import { useQueries } from '@tanstack/react-query';
import HeroBanner from './HeroBanner';
import MediaRow from './MediaRow';
import { useStore } from '../store/useStore';
import { GlassButton } from './ui/GlassButton';
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

const LAYOUT_PADDING = 'px-6 md:px-16';
const MARGIN_STACK = 'my-8 md:my-12';
const ELEMENT_GAP = 'mb-4';

const MinimalSkeleton: React.FC = () => (
  <div className={`${LAYOUT_PADDING} ${MARGIN_STACK} animate-pulse`}>
    <div className={`h-5 w-36 rounded bg-[#222222] ${ELEMENT_GAP}`} />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[200px] h-[295px] rounded-xl bg-[#1A1A1A] flex-shrink-0" />
      ))}
    </div>
  </div>
);

const PremiumFunctionalRow: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollRow = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const track = containerRef.current.querySelector('.overflow-x-scroll') || 
                    containerRef.current.querySelector('[class*="overflow-x"]') ||
                    containerRef.current.querySelector('.flex');

      if (track) {
        const viewWidth = track.clientWidth;
        const scrollAmount = direction === 'left' ? -(viewWidth * 0.75) : (viewWidth * 0.75);
        
        track.scrollBy({ 
          left: scrollAmount, 
          behavior: 'smooth' 
        });
      }
    }
  };

  const appleNewYorkFont = {
    fontFamily: '"New York Medium", "New York", Georgia, Cambria, "Times New Roman", Times, serif'
  };

  // Your locked style variable configuration tokens
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.1)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  return (
    <section className={`group relative ${LAYOUT_PADDING} ${MARGIN_STACK}`}>
      {/* Optimized Title: Smooth base opacity shift that illuminates dynamically on container hover */}
      <h2 
        style={appleNewYorkFont}
        className="text-2xl md:text-[27px] font-medium tracking-tight text-[#ededed]/80 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:text-white group-hover:text-[#ffffff] group-hover:opacity-100 antialiased mb-5"
      >
        {title}
      </h2>

      <div ref={containerRef} className="relative w-full">
        {/* Left Floating Controller Switch — Fixed opacity collision parameters */}
        <GlassButton
          variant="icon"
          onClick={() => scrollRow('left')}
          className="absolute left-[-22px] top-1/2 -translate-y-1/2 z-30 !hidden md:!flex opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 !w-10 !h-10 !rounded-full !bg-transparent text-[#9b9b9b]/80 hover:text-white"
          style={navbarMatchGlassStyle}
          aria-label="Scroll Left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[15px] h-[15px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </GlassButton>

        {/* Media Container Track Layer */}
        <div className="w-full relative z-10">
          {children}
        </div>

        {/* Right Floating Controller Switch — Fixed opacity collision parameters */}
        <GlassButton
          variant="icon"
          onClick={() => scrollRow('right')}
          className="absolute right-[-22px] top-1/2 -translate-y-1/2 z-30 !hidden md:!flex opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 !w-10 !h-10 !rounded-full !bg-transparent text-[#9b9b9b]/80 hover:text-white"
          style={navbarMatchGlassStyle}
          aria-label="Scroll Right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[15px] h-[15px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </GlassButton>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const { continueWatching } = useStore();

  const results = useQueries({
    queries: [
      { queryKey: ['trending', 'all', 'week'], queryFn: () => getTrending('all', 'week') },
      { queryKey: ['popular', 'movie'], queryFn: () => getPopularMovies() },
      { queryKey: ['topRated', 'movie'], queryFn: () => getTopRatedMovies() },
      { queryKey: ['nowPlaying'], queryFn: () => getNowPlaying() },
      { queryKey: ['upcoming'], queryFn: () => getUpcomingMovies() },
      { queryKey: ['popular', 'tv'], queryFn: () => getPopularTV() },
      { queryKey: ['topRated', 'tv'], queryFn: () => getTopRatedTV() },
      { queryKey: ['airingToday'], queryFn: () => getAiringToday() },
    ],
  });

  const [trendingQ, popularMoviesQ, topRatedMoviesQ, nowPlayingQ, upcomingQ, popularTVQ, topRatedTVQ, airingTodayQ] = results;
  const isInitialLoading = trendingQ.isLoading;

  const processedData = useMemo(() => {
    const trendingResults = trendingQ.data?.results?.map((m: any) => ({ ...m, media_type: m.media_type || 'movie' })) || [];
    const heroMovies = trendingResults.filter((m: any) => m.backdrop_path);
    
    const continueMovies = continueWatching.map(c => {
      const baseMovieData = c?.movie || c;
      return { 
        ...baseMovieData, 
        media_type: c?.type || baseMovieData?.media_type || 'movie' 
      };
    });

    const mapWithMedia = (data: any, type: 'movie' | 'tv') => data?.results?.map((m: any) => ({ ...m, media_type: type })) || [];

    return {
      heroMovies,
      continueMovies,
      trending: trendingResults,
      nowPlaying: mapWithMedia(nowPlayingQ.data, 'movie'),
      popularMovies: mapWithMedia(popularMoviesQ.data, 'movie'),
      popularTV: mapWithMedia(popularTVQ.data, 'tv'),
      topRatedMovies: mapWithMedia(topRatedMoviesQ.data, 'movie'),
      airingToday: mapWithMedia(airingTodayQ.data, 'tv'),
      topRatedTV: mapWithMedia(topRatedTVQ.data, 'tv'),
      upcoming: mapWithMedia(upcomingQ.data, 'movie'),
    };
  }, [continueWatching, ...results.map(q => q.data)]);

  const sanFranciscoFontFamily = {
    fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
  };

  return (
    <div style={sanFranciscoFontFamily} className="min-h-screen bg-[#070708] text-[#E3E3E3] overflow-x-hidden antialiased select-none pb-12">
      
      {/* Full Screen Isolated Hero Banner Viewport */}
      <div className="relative w-screen h-screen z-0">
        {isInitialLoading ? (
          <div className="h-screen bg-[#070708] animate-pulse" />
        ) : processedData.heroMovies.length > 0 ? (
          <HeroBanner movies={processedData.heroMovies} />
        ) : null}
      </div>

      {/* Structured Content Layer Stack */}
      <div className="relative z-10 pt-12 bg-[#070708]">
        
        {processedData.continueMovies.length > 0 && (
          <PremiumFunctionalRow title="Continue watching">
            <MediaRow title="" movies={processedData.continueMovies} cardSize="md" />
          </PremiumFunctionalRow>
        )}

        {isInitialLoading ? (
          <MinimalSkeleton />
        ) : processedData.trending.length > 0 ? (
          <PremiumFunctionalRow title="Trending now">
            <MediaRow title="" movies={processedData.trending} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}

        {nowPlayingQ.isLoading ? <MinimalSkeleton /> : processedData.nowPlaying.length > 0 ? (
          <PremiumFunctionalRow title="In theaters">
            <MediaRow title="" movies={processedData.nowPlaying} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}

        {popularMoviesQ.isLoading ? <MinimalSkeleton /> : processedData.popularMovies.length > 0 ? (
          <PremiumFunctionalRow title="Popular movies">
            <MediaRow title="" movies={processedData.popularMovies} cardSize="md" showRank />
          </PremiumFunctionalRow>
        ) : null}

        {popularTVQ.isLoading ? <MinimalSkeleton /> : processedData.popularTV.length > 0 ? (
          <PremiumFunctionalRow title="Popular series">
            <MediaRow title="" movies={processedData.popularTV} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}

        {topRatedMoviesQ.isLoading ? <MinimalSkeleton /> : processedData.topRatedMovies.length > 0 ? (
          <PremiumFunctionalRow title="Top rated movies">
            <MediaRow title="" movies={processedData.topRatedMovies} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}

        {airingTodayQ.isLoading ? <MinimalSkeleton /> : processedData.airingToday.length > 0 ? (
          <PremiumFunctionalRow title="Airing today">
            <MediaRow title="" movies={processedData.airingToday} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}

        {topRatedTVQ.isLoading ? <MinimalSkeleton /> : processedData.topRatedTV.length > 0 ? (
          <PremiumFunctionalRow title="Top rated series">
            <MediaRow title="" movies={processedData.topRatedTV} cardSize="md" showRank />
          </PremiumFunctionalRow>
        ) : null}

        {upcomingQ.isLoading ? <MinimalSkeleton /> : processedData.upcoming.length > 0 ? (
          <PremiumFunctionalRow title="Coming soon">
            <MediaRow title="" movies={processedData.upcoming} cardSize="md" />
          </PremiumFunctionalRow>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;