import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles, X, Filter, Tv, Film } from 'lucide-react';
import { Movie } from '../types';
import { searchMulti, getTrending } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const CATEGORIES = ['Oppenheimer', 'The Last of Us', 'Dune', 'Breaking Bad', 'Inception', 'Interstellar', 'Succession', 'The Boys'];

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
      } catch (err) {
        console.error("Search failed", err);
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
    <div className="min-h-screen pt-32 px-6 md:px-12 pb-24 max-w-[1600px] mx-auto">
      
      {/* Search Hero Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-20 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
          Find your next obsession.
        </h1>

        <motion.div
          className="liquid-glass-strong rounded-full flex items-center gap-4 px-8 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 focus-within:border-white/30 transition-all group"
        >
          <Search size={28} className="text-white/40 group-focus-within:text-white transition-colors" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Movies, Series, or Keywords..."
            className="bg-transparent text-white placeholder-white/30 text-xl md:text-2xl outline-none flex-1 font-medium"
          />
          {searchQuery && (
            <motion.button
              onClick={() => setSearchQuery('')}
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={20} />
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Conditional Content */}
      <AnimatePresence mode="wait">
        {!hasSearched ? (
          <motion.div
            key="featured"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Trending Section */}
            <section className="mb-20">
              <div className="flex items-center gap-4 mb-10 px-6 md:px-10">
                <div className="w-14 h-14 rounded-3xl liquid-glass flex items-center justify-center border border-white/10">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Trending Now</h2>
                  <p className="text-white/50 text-sm font-medium">The most popular titles this week</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 px-6 md:px-10">
                {trending.map((movie, i) => (
                  <MediaCard key={movie.id} movie={movie} index={i} size="md" />
                ))}
              </div>
            </section>

            {/* Quick Categories */}
            <section className="px-6 md:px-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-3xl liquid-glass flex items-center justify-center border border-white/10">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Quick Categories</h2>
                  <p className="text-white/50 text-sm font-medium">Jump straight into the action</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CATEGORIES.map((term, i) => (
                  <motion.button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="liquid-glass px-6 py-6 rounded-3xl text-white/80 text-base font-bold text-left hover:text-white transition-all border border-white/5 hover:border-white/20"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-10 px-6 md:px-10">
              <p className="text-white/50 text-lg font-medium">
                {loading ? 'Searching...' : `Found ${displayResults.length} matches`}
              </p>
              
              <div className="liquid-glass-strong rounded-full p-1.5 flex gap-1 shadow-lg">
                {[
                  { id: 'all', icon: null },
                  { id: 'movie', icon: Film },
                  { id: 'tv', icon: Tv }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-6 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                      filter === f.id ? 'btn-primary text-white shadow-lg' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {f.icon && <f.icon size={14} />}
                    {f.id === 'all' ? 'All Content' : f.id === 'movie' ? 'Movies' : 'Series'}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 px-6 md:px-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[2/3] rounded-2xl liquid-glass animate-pulse" />
                ))}
              </div>
            ) : displayResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 px-6 md:px-10">
                {displayResults.map((movie, i) => (
                  <MediaCard key={movie.id} movie={movie} index={i} size="lg" />
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full liquid-glass flex items-center justify-center">
                  <Search size={40} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-black text-white/50">No results found for "{searchQuery}"</h3>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;