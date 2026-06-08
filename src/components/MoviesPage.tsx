import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import MediaCard from './MediaCard';
import { getPopularMovies, getTopRatedMovies, getNowPlaying, getUpcomingMovies } from '../lib/tmdb';

const TABS = [
  { id: 'popular', label: 'Popular', emoji: '🔥' },
  { id: 'top_rated', label: 'Top Rated', emoji: '⭐' },
  { id: 'now_playing', label: 'In Theaters', emoji: '🎬' },
  { id: 'upcoming', label: 'Coming Soon', emoji: '🚀' },
];

const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [page, setPage] = useState(1);

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
    setActiveTab(id);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight">Movies</h1>
      </motion.div>

      <div className="liquid-glass rounded-full p-1 inline-flex items-center gap-1 mb-10 flex-wrap">
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'btn-primary text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <motion.div
          key={activeTab + page}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {movies.map((movie, i) => (
            <MediaCard key={movie.id} movie={movie} index={i} size="md" />
          ))}
        </motion.div>
      )}

      {currentData && currentData.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <motion.button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`liquid-glass px-5 py-2.5 rounded-full text-sm ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-300'}`}
            whileHover={page > 1 ? { scale: 1.02 } : {}}
            whileTap={page > 1 ? { scale: 0.98 } : {}}
          >
            ← Prev
          </motion.button>

          <div className="liquid-glass-strong px-5 py-2.5 rounded-full text-sm text-white/70">
            Page <span className="text-red-400 font-bold">{page}</span> of {Math.min(currentData.total_pages, 500)}
          </div>

          <motion.button
            onClick={() => setPage(p => Math.min(currentData.total_pages, p + 1))}
            disabled={page >= currentData.total_pages}
            className="liquid-glass px-5 py-2.5 rounded-full text-sm hover:text-red-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Next →
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
