import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History, Trash2 } from 'lucide-react';
import { Movie } from '../types';
import { searchMulti } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const LOCAL_STORAGE_KEY = 'vibe_stream_recent_media_cards';

const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentMedia, setRecentMedia] = useState<Movie[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load interactive media history metadata records out of storage channels on mounting
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setRecentMedia(JSON.parse(stored));
    } catch (err) {
      console.error("Failed loading search history storage layers:", err);
    }
  }, []);

  // Structural execution debouncer - Exactly 300ms delay window pass rule
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();
      try {
        const data = await searchMulti(trimmedQuery);
        const filtered = data.results.filter(r => r.media_type !== 'person');
        setResults(filtered);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  /**
   * Commits full object properties straight to storage when card interactivity triggers
   */
  const handleMediaSelectionSave = (selectedMovie: Movie) => {
    setRecentMedia((prev) => {
      const filtered = prev.filter((item) => item.id !== selectedMovie.id);
      const updated = [selectedMovie, ...filtered].slice(0, 6); // Cap list view output matrix at top 6 items
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setRecentMedia([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const liquidGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(32px) saturate(160%)',
    WebkitBackdropFilter: 'blur(32px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  };

  return (
    /* FIXED: Enforced universal Inter typography system across all parent and nested child segments */
    <div className="relative min-h-screen w-full bg-[#020204] text-white overflow-x-hidden flex flex-col justify-start" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Immersive Backdrop Cinematic Aura Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1400px] h-[750px] opacity-40 blur-[160px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,110,0,0.35) 0%, rgba(255,40,100,0.12) 45%, rgba(12,8,24,0) 80%)'
          }}
        />
      </div>

      {/* Main Structural Centered Viewport Wrapper */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col items-center pt-40">
        
        {/* Exact Image Styled Title Header */}
        <h1 className="text-4xl md:text-[40px] font-black tracking-tight text-white text-center mb-5 select-none">
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
            className="bg-transparent text-white/90 placeholder-white/20 text-base outline-none flex-1 font-medium tracking-wide"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dynamic Context Recent Search Results Stage using functional MediaCard Components */}
        <div className="w-full mb-20 select-none">
          <AnimatePresence>
            {!searchQuery && recentMedia.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col gap-8 items-start"
              >
                {/* MODIFIED: Sized up textual instructions layout framework and removed all transform uppercase properties */}
                <div className="w-full flex items-center justify-between text-white/50 text-sm md:text-base font-semibold tracking-wide px-1">
                  <div className="flex items-center gap-2.5">
                    <History size={16} className="text-white/40" />
                    <span>Recent searches</span>
                  </div>
                  <button 
                    onClick={clearAllHistory}
                    className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer text-sm md:text-base font-semibold tracking-wide"
                  >
                    <Trash2 size={14} />
                    <span>Clear</span>
                  </button>
                </div>
                
                {/* Premium Golden Ratio Spaced Shelf Row for History Items - Extracted absolute crosses */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 w-full">
                  {recentMedia.map((movie) => (
                    <div key={`history-${movie.id}`} className="relative group/historyCard">
                      <div onClickCapture={() => handleMediaSelectionSave(movie)}>
                        <MediaCard movie={movie} size="lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  /* Shimmer Loading Skeletons State - Enforcing Golden Proportional Gaps */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 w-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-full aspect-[2/3] rounded-2xl animate-pulse bg-white/[0.02] border border-white/5" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  /* Data Render Grid - Reconstructed to deliver home showcase display logic metrics */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 w-full">
                    {results.map((movie, i) => (
                      <div key={movie.id} onClickCapture={() => handleMediaSelectionSave(movie)}>
                        <MediaCard movie={movie} index={i} size="lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State fallback container */
                  <div className="text-center py-20 w-full flex flex-col items-center">
                    <div style={liquidGlassStyle} className="w-16 h-16 mb-6 rounded-full flex items-center justify-center shadow-xl">
                      <Search size={24} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white/40">
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