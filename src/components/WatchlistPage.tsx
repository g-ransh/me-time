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

  // Premium Translucent Crystal Glass Shared Tokens (Matching your exact global app language)
  const crystalGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)',
    backdropFilter: 'blur(4px) saturate(170%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(170%) brightness(100%)',
    border: '1px solid rgba(255, 255, 255, 0.13)',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
  };

  return (
    <div 
      className="min-h-screen pt-32 px-8 md:px-16 lg:px-24 pb-24 text-white select-none transition-colors duration-500"
      style={{
        background: 'radial-gradient(circle at 50% -20%, rgba(249, 115, 22, 0.45) 0%, rgba(2, 2, 4, 1) 65%)',
        backgroundColor: '#020204'
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* ── Page Header Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-[34px] font-bold tracking-tight text-white antialiased">
            Watch List
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
              /* Empty Watchlist State styled matching premium container tokens */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center justify-center py-36 text-center rounded-2xl"
                style={{
                  backgroundColor: 'rgba(10, 10, 14, 0.05)',
                  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(4px) saturate(180%) brightness(100%)',
                  WebkitBackdropFilter: 'blur(4px) saturate(180%) brightness(100%)',
                  border: 'none',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)'
                }}
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
                <h3 className="text-[17px] font-medium text-white/80 mb-1.5 tracking-wide font-sans">Your list is empty</h3>
                <p className="text-white/35 text-[13.5px] max-w-sm font-medium leading-normal tracking-wide font-sans">
                  Add movies and series using the '+' icon on their cards.
                </p>
              </motion.div>
            ) : (
              /* Watchlist Active Layout Display */
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 4 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex items-center justify-between mb-8 font-sans pointer-events-auto"
                >
                  {/* Dynamic control rows adjusted with precise Golden Ratio parameters */}
                  <div className="flex items-center gap-[10px]">
                    <motion.button 
                      onClick={() => setMediaFilter('all')} 
                      className="h-9 px-[21px] rounded-full text-[12px] font-medium transition-all cursor-pointer flex items-center justify-center text-white" 
                      style={{ 
                        ...crystalGlassStyle,
                        backgroundColor: mediaFilter === 'all' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.05)', 
                        borderColor: mediaFilter === 'all' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0)',
                        color: mediaFilter === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      All
                    </motion.button>
                    
                    <motion.button 
                      onClick={() => setMediaFilter('movies')} 
                      className="h-9 px-[21px] rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer text-white" 
                      style={{ 
                        ...crystalGlassStyle,
                        backgroundColor: mediaFilter === 'movies' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.04)', 
                        borderColor: mediaFilter === 'movies' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0)',
                        color: mediaFilter === 'movies' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Film size={12} />
                      <span>Movies</span>
                    </motion.button>

                    <motion.button 
                      onClick={() => setMediaFilter('series')} 
                      className="h-9 px-[21px] rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer text-white" 
                      style={{ 
                        ...crystalGlassStyle,
                        backgroundColor: mediaFilter === 'series' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.04)', 
                        borderColor: mediaFilter === 'series' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0)',
                        color: mediaFilter === 'series' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Tv size={12} />
                      <span>Series</span>
                    </motion.button>

                    <motion.button 
                      onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} 
                      className="h-9 px-[21px] rounded-full text-[12px] font-medium flex items-center gap-1.5 text-white/50 transition-all cursor-pointer"
                      style={{ 
                        ...crystalGlassStyle,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                        borderColor: 'rgba(255, 255, 255, 0.13)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}
                      whileHover={{ scale: 1.03, color: '#ffffff' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ArrowUpDown size={12} />
                      <span className="capitalize">{sortOrder}</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Media Cards Canvas Layout Grid */}
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
                  <AnimatePresence mode="popLayout">
                    {(sortOrder === 'newest' ? filteredWatchlist : [...filteredWatchlist].reverse()).map((movie, index) => (
                      <motion.div 
                        key={movie.id} 
                        layout 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl overflow-hidden"
                      >
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