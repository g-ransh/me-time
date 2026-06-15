import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Film, Tv } from 'lucide-react';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const WatchlistPage: React.FC = () => {
  const { watchlist } = useStore();
  
  // Navigation active filter states
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Dynamic content payload filtering rules
  const filteredWatchlist = watchlist.filter((item) => {
    if (mediaFilter === 'movies') return item.media_type === 'movie' || !item.media_type;
    if (mediaFilter === 'series') return item.media_type === 'tv';
    return true;
  });

  // Premium Translucent Fluid Water design token with matching 20px blur distributions
  const fluidWaterStyle: React.CSSProperties = {
    backgroundColor: 'rgba(16, 16, 20, 0.3)',
    backdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
    fontFamily: '"Inter", sans-serif',
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 px-8 md:px-16 lg:px-24 pb-24 text-white select-none">
      <div className="max-w-[1400px] mx-auto">
        
        {/* ── Page Header Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-[34px] font-bold tracking-tight text-white antialiased">
            My Lists
          </h1>
        </motion.div>

        {/* ── Grid Interface Render Arena ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key="watchlist-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {watchlist.length === 0 ? (
              /* Empty Watchlist State */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center justify-center py-36 text-center"
              >
                <div className="text-white/90 mb-5 select-none">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/80">
                    <circle cx="8" cy="12" r="2.5" fill="currentColor"/>
                    <circle cx="8" cy="24" r="2.5" fill="currentColor"/>
                    <circle cx="8" cy="36" r="2.5" fill="currentColor"/>
                    <path d="M18 12H42" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M18 24H42" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M18 36H42" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-white/80 mb-1.5 tracking-wide font-sans">Your lists are empty</h3>
                <p className="text-white/35 text-[13.5px] max-w-sm font-medium leading-normal tracking-wide font-sans">
                  Add movies and series using the '+' icon on their cards.
                </p>
              </motion.div>
            ) : (
              /* Watchlist Active Layout Display */
              <>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 font-sans">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMediaFilter('all')} className="h-7 px-3.5 rounded-full text-[12px] font-bold border cursor-pointer" style={{ backgroundColor: mediaFilter === 'all' ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderColor: mediaFilter === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: mediaFilter === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)' }}>All</button>
                    <button onClick={() => setMediaFilter('movies')} className="h-7 px-3.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 border cursor-pointer" style={{ backgroundColor: mediaFilter === 'movies' ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderColor: mediaFilter === 'movies' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: mediaFilter === 'movies' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)' }}><Film size={11} /><span>Movies</span></button>
                    <button onClick={() => setMediaFilter('series')} className="h-7 px-3.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 border cursor-pointer" style={{ backgroundColor: mediaFilter === 'series' ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderColor: mediaFilter === 'series' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: mediaFilter === 'series' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)' }}><Tv size={11} /><span>Series</span></button>
                    <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} className="h-7 px-3.5 rounded-full text-[12px] font-bold bg-transparent border border-white/[0.05] text-white/45 flex items-center gap-1.5 hover:text-white/80 transition-colors cursor-pointer"><ArrowUpDown size={11} /><span className="capitalize">{sortOrder}</span></button>
                  </div>
                </motion.div>

                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
                  <AnimatePresence mode="popLayout">
                    {(sortOrder === 'newest' ? filteredWatchlist : [...filteredWatchlist].reverse()).map((movie, index) => (
                      <motion.div key={movie.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-xl overflow-hidden">
                        <MediaCard movie={movie} index={index} size="md" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default WatchlistPage;