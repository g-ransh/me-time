import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History } from 'lucide-react';
import { Movie } from '../types';
import { searchMulti } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';
import { GlassButton } from './ui/GlassButton';

const LOCAL_STORAGE_KEY = 'vibe_stream_recent_media_cards';

const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentMedia, setRecentMedia] = useState<Movie[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setRecentMedia(JSON.parse(stored));
    } catch (err) {
      console.error("Failed loading search history storage layers:", err);
    }
  }, []);

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

  const handleMediaSelectionSave = (selectedMovie: Movie) => {
    setRecentMedia((prev) => {
      const filtered = prev.filter((item) => item.id !== selectedMovie.id);
      const updated = [selectedMovie, ...filtered].slice(0, 6);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

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

  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.05)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  const appleNewYorkMediumStyle = {
    fontFamily: '-apple-system-serif, "New York", "Apple Garamond", Georgia, serif',
    fontWeight: 500,
  };

  const interSerifStyle = {
    fontFamily: '"Inter Serif", "Inter", "Helvetica Neue", Arial, sans-serif',
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020204] text-white overflow-x-hidden flex flex-col justify-start" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── Mathematical Brownian Gaussian/Bell Curve Orange Plasma Canvas ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#020204]">
        <div className="absolute inset-0 bg-[#020204]/40 z-10" />

        {/* Primary Gaussian Bell Distribution Node */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 0.95, 1],
            x: ['-50%', '-46%', '-52%', '-50%'],
            y: [0, 30, -15, 0],
            opacity: [0.65, 0.75, 0.55, 0.65]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-30%] left-1/2 w-[1600px] h-[900px] blur-[110px] rounded-[45%_55%_50%_50%] mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,90,0,0.6) 0%, rgba(245,158,11,0.25) 50%, rgba(251,146,60,0) 75%)'
          }}
        />

        {/* Secondary Brownian Random Walk Simulator Waveform */}
        <motion.div 
          animate={{
            scale: [1.15, 0.98, 1.08, 1.15],
            x: ['-44%', '-54%', '-46%', '-44%'],
            y: [15, -30, 25, 15],
            opacity: [0.4, 0.5, 0.35, 0.4]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-20%] left-1/2 w-[1300px] h-[800px] blur-[130px] rounded-[50%_45%_55%_45%] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(234,88,12,0.45) 0%, rgba(217,119,6,0.18) 60%, transparent 85%)'
          }}
        />

        {/* Asymmetric Light Deflection Layer */}
        <motion.div 
          animate={{
            opacity: [0.2, 0.3, 0.25, 0.2]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 inset-x-0 h-[650px] mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,130,0,0.4) 0%, transparent 85%)'
          }}
        />
      </div>

      {/* ── Main Structural Wrapper ── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col items-center pt-48">
        
        {/* Title configured precisely to Apple New York Serif Medium font maps */}
        <h1 
          style={appleNewYorkMediumStyle}
          className="text-4xl md:text-[44px] text-white text-center tracking-normal opacity-95 mt-6 mb-6 select-none"
        >
          What's your next obsession?
        </h1>

        {/* Expanded Panoramic Search Bar Terminal Input Box */}
        <div 
          style={navbarMatchGlassStyle}
          className="w-full max-w-[680px] rounded-full flex items-center gap-3.5 px-6 py-4 transition-all duration-300 focus-within:bg-white/[0.03] group mb-16"
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
            <GlassButton
              variant="icon"
              onClick={() => setSearchQuery('')}
              className="!w-7 !h-7 !rounded-full flex items-center justify-center text-white/30 hover:text-white/70"
              style={{ ...navbarMatchGlassStyle, boxShadow: 'none' }}
            >
              <X size={15} />
            </GlassButton>
          )}
        </div>

        {/* Dynamic Context Recent Search Results Stage */}
        <div className="w-full mb-20 select-none">
          <AnimatePresence>
            {!searchQuery && recentMedia.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col gap-8 items-start"
              >
                <div className="w-full flex items-center justify-between pl-[0.618rem] pr-[0.618rem]">
                  
                  {/* Left Pill: Inter Serif font rules applied cleanly without italics */}
                  <GlassButton 
                    variant="text"
                    style={{ ...navbarMatchGlassStyle, ...interSerifStyle }}
                    className="!h-9 !px-[1rem] !rounded-full flex items-center gap-2 text-white/90 text-xs font-serif tracking-wide font-medium"
                  >
                    <History size={13} className="text-white/50 shrink-0" />
                    <span>History</span>
                  </GlassButton>

                  {/* Right Pill: Inter Serif font rules applied cleanly without italics */}
                  <GlassButton 
                    variant="text"
                    onClick={clearAllHistory}
                    style={{ ...navbarMatchGlassStyle, ...interSerifStyle }}
                    className="!h-9 !px-[1rem] !rounded-full flex items-center gap-2 text-white/50 hover:!text-red-400 text-xs font-serif tracking-wide font-medium"
                  >
                    <X size={11} className="opacity-60 shrink-0" />
                    <span>Clear all</span>
                  </GlassButton>

                </div>
                
                {/* Unified history grid container applying Proportional Golden Margins */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-[0.618rem] gap-y-[1.618rem] w-full px-[0.618rem]">
                  {recentMedia.map((movie, index) => (
                    <div 
                      key={`history-${movie.id}`} 
                      className="relative group rounded-xl overflow-hidden"
                    >
                      {/* Crisp Perfect Circle Close/Cancel Trigger Glass Layer: Shifted to top-left corner to avoid overlaying components */}
                      <GlassButton 
                        variant="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(movie.id);
                        }}
                        className="absolute top-[0.618rem] left-[0.618rem] !w-6 !h-6 !p-0 flex items-center justify-center !rounded-full text-white/60 hover:!text-red-400 z-40 bg-[#0a0a0c]/40 layout-crisp"
                        style={navbarMatchGlassStyle}
                        title="Remove from history"
                      >
                        <X size={10} className="shrink-0" />
                      </GlassButton>

                      {/* External parent hover properties stripped entirely to respect internal MediaCard frames */}
                      <div 
                        onClickCapture={() => handleMediaSelectionSave(movie)}
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
          <AnimatePresence>
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 w-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-full aspect-[2/3] rounded-2xl animate-pulse bg-white/[0.02] border border-white/5" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 w-full">
                    {results.map((movie, i) => (
                      <div 
                        key={movie.id} 
                        onClickCapture={() => handleMediaSelectionSave(movie)}
                      >
                        <MediaCard movie={movie} index={i} size="lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 w-full flex flex-col items-center">
                    <GlassButton variant="icon" style={navbarMatchGlassStyle} className="!w-16 !h-16 mb-6 !rounded-full flex items-center justify-center pointer-events-none">
                      <Search size={24} className="text-white/20" />
                    </GlassButton>
                    <h3 className="text-xl font-medium text-white/40">
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