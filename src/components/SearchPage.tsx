import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History } from 'lucide-react';
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

    if (loading === false) setLoading(true);
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

  // Cancels and drops a specific single entry out of the local history array
  const removeHistoryItem = (id: number) => {
    setRecentMedia((prev) => {
      const updated = prev.filter((item) => item.id !== id);
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

  // Helvetica Neue Medium precise font token assignment configurations
  const helveticaNeueMediumStyle = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 500,
  };

  const garamondSerifStyle = {
    fontFamily: '"Garamond", "Apple Garamond", "Baskerville", "Times New Roman", serif'
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020204] text-white overflow-x-hidden flex flex-col justify-start" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Immersive Backdrop Cinematic Aura Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1400px] h-[750px] opacity-40 blur-[10px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,110,0,0.35) 0%, rgba(255,40,100,0.12) 45%, rgba(12,8,24,0) 80%)'
          }}
        />
      </div>

      {/* Main Structural Wrapper */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col items-center pt-48">
        
        {/* Swapped to Helvetica Neue Medium, added clean spacing downward and pulled 2.5% vertically via transform inline configurations */}
        <h1 
          style={{ ...helveticaNeueMediumStyle, transform: 'translateY(2.5%)' }}
          className="text-4xl md:text-[44px] text-white text-center mt-6 mb-8 select-none tracking-normal opacity-95"
        >
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
                {/* Two perfectly mirrored glassmorphed layout pills sharing identical height, bounds, and aspects */}
                <div className="w-full flex items-center justify-between">
                  
                  {/* Left Pill: History contextual node display - Wording updated and icon scaled up to 20 */}
                  <div 
                    style={{ ...liquidGlassStyle, ...garamondSerifStyle }}
                    className="h-12 px-6 rounded-full flex items-center gap-3 text-white/80 text-base md:text-lg font-medium shadow-lg"
                  >
                    <History size={20} className="text-white/50 shrink-0" />
                    <span>History</span>
                  </div>

                  {/* Right Pill: Clear All functional control node layout with custom closure X icon */}
                  <button 
                    onClick={clearAllHistory}
                    style={{ ...liquidGlassStyle, ...garamondSerifStyle }}
                    className="h-12 px-6 rounded-full flex items-center gap-2.5 text-white/40 hover:text-red-400 transition-colors cursor-pointer text-base md:text-lg font-medium shadow-lg"
                  >
                    <X size={14} className="opacity-70 shrink-0" />
                    <span>Clear all</span>
                  </button>

                </div>
                
                {/* Unified history grid container applying a sleek 7.5% scale expansion strictly on component hover states */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 w-full">
                  {recentMedia.map((movie, index) => (
                    <div key={`history-${movie.id}`} className="relative group rounded-xl overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.075]">
                      
                      {/* Cancel button shifted precisely 5% right / 7.5% down (top 47.5% / left 45%) to accommodate the requested 2.5% drop */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(movie.id);
                        }}
                        className="peer absolute top-[47.5%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/90 backdrop-blur-md border border-white/10 text-white/60 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 z-30 cursor-pointer shadow-md"
                        title="Remove from history"
                      >
                        <X size={20} className="shrink-0" />
                      </button>

                      {/* Content target layer that catches precisely 10% gaussian filtering when the cancel sibling is actively focused */}
                      <div 
                        onClickCapture={() => handleMediaSelectionSave(movie)}
                        className="transition-all duration-300 ease-in-out origin-center peer-hover:blur-[4px]"
                      >
                        <MediaCard movie={movie} index={index} size="md" />
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
                  /* Data Render Grid */
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