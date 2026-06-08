import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { searchMulti, getTrending } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [trending, setTrending] = useState<Movie[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    // Load trending for featured section
    getTrending('all', 'week').then(data => {
      setTrending(data.results.slice(0, 12));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(searchQuery);
        const filtered = data.results.filter(r => r.media_type !== 'person');
        setResults(filtered);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  const displayResults = filter === 'all'
    ? results
    : results.filter(r => r.media_type === filter);

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-20">
      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-3xl mx-auto mb-16 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-6xl font-black gradient-text tracking-tight mb-3">
            Search
          </h1>
          <p className="text-white/40 text-base">Discover movies, series, and more</p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass-strong rounded-full flex items-center gap-3 px-6 py-4 shadow-2xl shadow-red-900/10"
        >
          <Search size={20} className="text-red-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies, series..."
            className="bg-transparent text-white placeholder-white/30 text-base outline-none flex-1"
          />
          {searchQuery && (
            <motion.button
              onClick={() => setSearchQuery('')}
              className="liquid-glass px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Results or Featured */}
      {!hasSearched ? (
        <>
          {/* Featured Trending */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  <p className="text-white/40 text-sm">What everyone is watching</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((movie, i) => (
                <MediaCard key={movie.id} movie={movie} index={i} size="md" />
              ))}
            </div>
          </motion.section>

          {/* Quick Categories */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Popular Searches</h2>
                <p className="text-white/40 text-sm">Jump into trending content</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {['Oppenheimer', 'The Last of Us', 'Breaking Bad', 'Inception', 'Dune', 'Game of Thrones', 'Interstellar', 'Succession'].map((term, i) => (
                <motion.button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="liquid-glass px-5 py-4 rounded-2xl text-white/80 text-sm font-medium hover:text-white text-left transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </motion.section>
        </>
      ) : (
        <>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 flex-wrap gap-3"
          >
            <p className="text-white/50 text-sm">
              {loading ? 'Searching...' : `${displayResults.length} results for "${searchQuery}"`}
            </p>
            <div className="liquid-glass rounded-full p-1 flex">
              {(['all', 'movie', 'tv'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                    filter === f ? 'btn-primary text-white' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'Series'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-72 rounded-3xl animate-shimmer" />
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && (
            <AnimatePresence mode="wait">
              {displayResults.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                >
                  {displayResults.map((movie, i) => (
                    <MediaCard key={movie.id} movie={movie} index={i} size="md" />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full liquid-glass flex items-center justify-center">
                    <Search size={28} className="text-white/40" />
                  </div>
                  <h3 className="text-xl font-bold text-white/60 mb-2">No results found</h3>
                  <p className="text-white/30 text-sm">Try a different search term</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
