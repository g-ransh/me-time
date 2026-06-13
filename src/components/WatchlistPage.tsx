import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ArrowUpDown, Film, Tv, Clock, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const WatchlistPage: React.FC = () => {
  const { watchlist } = useStore();
  
  // Navigation active tab states
  const [activeSubTab, setActiveSubTab] = useState<'watchlist' | 'history'>('watchlist');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Operational state for the playback history logs stream
  const [historyList, setHistoryList] = useState<any[]>(watchlist.slice(0, 2));

  // Dynamic content payload filtering rules
  const filteredWatchlist = watchlist.filter((item) => {
    if (mediaFilter === 'movies') return item.media_type === 'movie' || !item.media_type;
    if (mediaFilter === 'series') return item.media_type === 'tv';
    return true;
  });

  const subTabs = [
    { id: 'watchlist' as const, label: 'Watchlist', count: watchlist.length, icon: List },
    { id: 'history' as const, label: 'History', count: historyList.length || null, icon: Clock }
  ];

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

        {/* ── Sub-Navigation Structural Bar (Watchlist & History Only) ── */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6 font-sans">
          <div className="flex items-center gap-6">
            {subTabs.map((tab) => {
              const IsSelected = activeSubTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className="relative flex items-center gap-2 pb-3 text-[14px] font-bold tracking-wide transition-colors cursor-pointer outline-none"
                  style={{ color: IsSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.38)' }}
                >
                  <TabIcon size={14} className="shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="text-[11px] font-medium opacity-55 pl-0.5">{tab.count}</span>
                  )}
                  {IsSelected && (
                    <motion.div 
                      layoutId="activeWatchlistLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Grid Interface Render Arena ── */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'watchlist' && (
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
          )}

          {/* ── Active History Media Log Tab View ── */}
          {activeSubTab === 'history' && (
            <motion.div key="history-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {historyList.length === 0 ? (
                <div className="text-center py-24 text-white/30 text-sm flex flex-col items-center gap-3">
                  <Clock size={36} className="text-white/10" />
                  <span>Your playback history is completely clear.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
                  {historyList.map((movie, index) => (
                    <div key={`hist-${movie.id}`} className="relative group rounded-xl overflow-hidden">
                      <MediaCard movie={movie} index={index} size="md" />
                      
                      {/* Secondary utility control layer explicitly positioned for item drop actions */}
                      <button 
                        onClick={() => setHistoryList(prev => prev.filter(h => h.id !== movie.id))}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 border border-white/10 text-white/60 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 z-30 cursor-pointer"
                        title="Remove from history"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default WatchlistPage;