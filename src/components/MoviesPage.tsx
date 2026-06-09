import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Clapperboard, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { getPopularMovies, getTopRatedMovies, getNowPlaying, getUpcomingMovies } from '../lib/tmdb';

const TABS = [
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'now_playing', label: 'In Theaters', icon: Clapperboard },
  { id: 'upcoming', label: 'Coming Soon', icon: Rocket },
];

const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [page, setPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, activeTab]);

  const { data: popular, isLoading: l1 } = useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => getPopularMovies(page),
    enabled: activeTab === 'popular',
  });

  const { data: topRated, isLoading: l2 } = useQuery({
    queryKey: ['movies', 'top_rated', page],
    queryFn: () => getTopRatedMovies(page),
    enabled: activeTab === 'top_rated',
  });

  const { data: nowPlaying, isLoading: l3 } = useQuery({
    queryKey: ['movies', 'now_playing', page],
    queryFn: () => getNowPlaying(page),
    enabled: activeTab === 'now_playing',
  });

  const { data: upcoming, isLoading: l4 } = useQuery({
    queryKey: ['movies', 'upcoming', page],
    queryFn: () => getUpcomingMovies(page),
    enabled: activeTab === 'upcoming',
  });

  const dataMap: Record<string, typeof popular> = {
    popular, top_rated: topRated, now_playing: nowPlaying, upcoming,
  };

  const loadingMap: Record<string, boolean> = {
    popular: l1, top_rated: l2, now_playing: l3, upcoming: l4,
  };

  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];
  const movies = currentData?.results?.map(m => ({ ...m, media_type: 'movie' })) || [];

  const handleTabChange = (id: string) => {
    if (activeTab === id) return;
    setActiveTab(id);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 lg:px-12 pb-24 max-w-[1600px] mx-auto">
      
      {/* Page Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 
            className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Movies
          </h1>
          <p className="text-white/50 font-medium text-lg">Explore the best of cinema</p>
        </div>

        {/* Premium Glass Tab Selector */}
        <div className="liquid-glass-strong rounded-full p-1.5 inline-flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full shadow-xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/90'
                }`}
                whileHover={{ scale: isActive ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMovieTab"
                    className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon size={16} className={`relative z-10 ${isActive ? 'text-white' : 'text-red-400/70'}`} />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Grid Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="w-full aspect-[2/3] rounded-2xl liquid-glass animate-pulse bg-gradient-to-br from-white/10 to-transparent border-white/5" 
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab + page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
          >
            {movies.map((movie, i) => (
              <div key={movie.id} className="w-full">
                {/* Passing 'lg' size will let it fill the grid container nicely.
                  The MediaCard component handles the hover glow perfectly.
                */}
                <MediaCard movie={movie} index={i} size="lg" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Pagination */}
      {currentData && currentData.total_pages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-16"
        >
          <motion.button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`liquid-glass px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              page === 1 
                ? 'opacity-30 cursor-not-allowed border-white/5' 
                : 'hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white'
            }`}
            whileHover={page > 1 ? { scale: 1.05 } : {}}
            whileTap={page > 1 ? { scale: 0.95 } : {}}
          >
            <ChevronLeft size={16} />
            Prev
          </motion.button>

          <div className="liquid-glass-strong px-6 py-3 rounded-full text-sm font-medium text-white/70 border border-white/10 shadow-lg">
            Page <span className="text-white font-black mx-1">{page}</span> of {Math.min(currentData.total_pages, 500)}
          </div>

          <motion.button
            onClick={() => setPage(p => Math.min(currentData.total_pages, p + 1))}
            disabled={page >= currentData.total_pages}
            className={`liquid-glass px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              page >= currentData.total_pages 
                ? 'opacity-30 cursor-not-allowed border-white/5' 
                : 'hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white'
            }`}
            whileHover={page < currentData.total_pages ? { scale: 1.05 } : {}}
            whileTap={page < currentData.total_pages ? { scale: 0.95 } : {}}
          >
            Next
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default MoviesPage;