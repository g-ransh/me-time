import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles, X, Filter, Tv, Film } from 'lucide-react';
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
    <div className="relative min-h-screen w-full bg-[#050507] overflow-x-hidden text-white antialiased flex flex-col justify-start pt-40 px-6 md:px-12 pb-24 select-none">
      
      {/* Search Hero Area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl mx-auto mb-8 text-center flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-[40px] font-bold text-white tracking-normal mb-6">
          What's your next obsession?
        </h1>

        <motion.div
          className="w-full max-w-xl rounded-full flex items-center gap-3 px-5 py-3 transition-all group"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.02), 0 20px 40px -10px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Search size={16} className="text-white/30 group-focus-within:text-white/70 transition-colors shrink-0" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies & TV shows..."
            className="bg-transparent text-white/90 placeholder-white/20 text-sm outline-none flex-1 font-medium tracking-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Conditional Content */}
      <AnimatePresence mode="wait">
        {!hasSearched ? (
          <motion.div
            key="qol-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-4xl mx-auto px-4"
          >
            {/* QoL Quick Navigation Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { label: 'Continue Watching', desc: 'Pick up right where you left off', icon: '🍿', action: 'home' },
                { label: 'Your Watchlist', desc: 'Jump to your curated shelf', icon: '✨', action: 'list' },
                { label: 'Surprise Selection', desc: 'Let the system pick for you', icon: '🎲', action: 'genres' }
              ].map((hub) => (
                <button
                  key={hub.label}
                  onClick={() => {
                    // Update active tab context securely via store state 
                    useStore.setState({ activeTab: hub.action as any });
                  }}
                  className="flex flex-col text-left p-5 rounded-2xl bg-white/0.02 border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform w-fit">{hub.icon}</span>
                  <h3 className="text-sm font-bold text-white/90 mb-1">{hub.label}</h3>
                  <p className="text-white/40 text-xs font-medium leading-normal">{hub.desc}</p>
                </button>
              ))}
            </div>

            {/* Premium Recent Searches / History Tracking Pill Bar */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/30">Recent Searches</h3>
                <button 
                  onClick={() => useStore.setState({ searchQuery: '' })}
                  className="text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['Spider-Man', 'Batman', 'Sci-Fi Thrillers', 'Anime 2026'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Low-profile Item Counter */}
            <div className="mb-8 px-6 md:px-10">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                {loading ? 'Scanning server database...' : `Discovered ${displayResults.length} matches`}
              </p>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 px-6 md:px-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full aspect-2/3 rounded-2xl liquid-glass animate-pulse" />
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
                <div className="w-12 h-12 mx-auto mb-6 rounded-full liquid-glass flex items-center justify-center">
                  <Search size={20} className="text-white/20" />
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