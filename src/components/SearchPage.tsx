import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Movie } from '../types';
import { searchMulti } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!searchQuery || searchQuery.trim().length < 2) {
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

  const liquidGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(32px) saturate(160%)',
    WebkitBackdropFilter: 'blur(32px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  };

  return (
    /* FIXED: Swapped parent container layout token from global select-none to user-select-auto so forms take focus */
    <div className="relative min-h-screen w-full bg-[#020204] text-white overflow-x-hidden flex flex-col justify-start" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Ambient Backdrop Aura Glow Bleed Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-35 blur-[140px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,140,0,0.5) 0%, rgba(255,165,0,0.15) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>

      {/* Main Structural Centered Viewport Wrapper */}
      {/* FIXED: isolated select-none to everything outside of the search inputs to ensure native keyboard entry flows cleanly */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-0 flex flex-col items-center pt-48">
        
        {/* Exact Image Styled Title Header */}
        <h1 className="text-4xl md:text-[44px] font-black tracking-tight text-white font-sans text-center mb-5 select-none">
          What's your next obsession?
        </h1>

        {/* Expanded Panoramic Search Bar Terminal Input Box */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)'
          }}
          className="w-full max-w-[680px] rounded-full flex items-center gap-3.5 px-6 py-4 transition-all duration-300 focus-within:border-white/10 group mb-16"
        >
          <Search size={18} className="text-white/20 group-focus-within:text-white/60 transition-colors shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies & TV shows..."
            className="bg-transparent text-white/90 placeholder-white/20 text-base outline-none flex-1 font-medium tracking-wide font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dynamic Context Results Grid Stage */}
        <div className="w-full relative min-h-[200px] select-none">
          <AnimatePresence mode="wait">
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {loading ? (
                  /* Shimmer Loading Skeletons State */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-full aspect-[2/3] rounded-2xl animate-pulse bg-white/[0.02] border border-white/5" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  /* Data Render List Grid */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
                    {results.map((movie, i) => (
                      <MediaCard key={movie.id} movie={movie} index={i} size="lg" />
                    ))}
                  </div>
                ) : (
                  /* Empty State fallback container */
                  <div className="text-center py-20 w-full flex flex-col items-center">
                    <div style={liquidGlassStyle} className="w-16 h-16 mb-6 rounded-full flex items-center justify-center shadow-xl">
                      <Search size={24} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white/40 font-sans">
                      No results found for "{searchQuery}"
                    </h3>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default SearchPage;