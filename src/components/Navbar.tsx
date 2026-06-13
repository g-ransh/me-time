import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Home, Compass, Settings, Bookmark, Tv } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchMulti } from '../lib/tmdb';
import { SearchResult } from '../types';
import { getThumbUrl, getTitle } from '../lib/tmdb';

const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchRef.current) searchRef.current.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(searchQuery);
        setSuggestions(data.results.filter(r => r.media_type !== 'person').slice(0, 6));
      } catch { setSuggestions([]); }
    }, 300);
  }, [searchQuery]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSearchSelect = (item: SearchResult) => {
    closeSearch();
    setActiveTab('search');
    useStore.setState({ selectedMedia: item, isModalOpen: true });
  };

  const navItems: { id: 'home' | 'movies' | 'series' | 'genres'; label: string }[] = [
    { id: 'home',   label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'Series' },
    { id: 'genres', label: 'Discover' },
  ];

  // Restructured Fluid Water Baseline with an increased +25% blurring pass (20px)
  const thinWaterStyle: React.CSSProperties = {
    backgroundColor: scrolled ? 'rgba(12, 12, 14, 0.55)' : 'rgba(16, 16, 20, 0.3)',
    backdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(105%)',
    fontFamily: '"Inter", sans-serif',
  };

  return (
    <>
      {/* ── Top Custom Fluid Navigation Dock ── */}
      <motion.header
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex justify-center w-auto max-w-[95vw]"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        <div
          className="flex items-center gap-[24px] px-[22px] py-2 rounded-full select-none border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          style={thinWaterStyle}
        >
          {/* Movie Reel Logo Emblem Layout Anchor */}
          <motion.button
            className="flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0 text-white/80 hover:text-white"
            onClick={() => setActiveTab('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="7" r="1" fill="currentColor" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
              <circle cx="7" cy="12" r="1" fill="currentColor" />
              <circle cx="17" cy="12" r="1" fill="currentColor" />
            </svg>
          </motion.button>

          {/* Main Navigation Row — Golden Ratio Proportion Scaling Matrix */}
          <nav className="hidden md:flex items-center gap-[24px]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="text-[14px] tracking-wide transition-all duration-200 relative py-0.5 cursor-pointer"
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.38)',
                    fontWeight: isActive ? 700 : 600,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.38)'; }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Interface Utilities Section Block */}
          <div className="flex items-center gap-3.5 text-white/35">
            
            {/* Search Input Box Area (Direct Search Navigation State Attachment Fixed) */}
            <div className="relative flex items-center">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="input"
                    initial={{ width: 30, opacity: 0 }}
                    animate={{ width: 170, opacity: 1 }}
                    exit={{ width: 30, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.06]"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <Search size={13} className="text-white/40 shrink-0" />
                      <input
                        ref={searchRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="bg-transparent text-white text-[12px] placeholder-white/20 outline-none w-full font-semibold"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') closeSearch();
                          if (e.key === 'Enter' && searchQuery) {
                            setActiveTab('search');
                            closeSearch();
                          }
                        }}
                      />
                      <button onClick={closeSearch} className="shrink-0 cursor-pointer">
                        <X size={11} className="text-white/30 hover:text-white/70 transition-colors" />
                      </button>
                    </div>

                    {/* Auto-suggestions list panel */}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl overflow-hidden z-50 shadow-xl p-1 border border-white/[0.06]"
                          style={{
                            backgroundColor: 'rgba(14, 14, 16, 0.98)',
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          {suggestions.map((item, i) => (
                            <button
                              key={item.id}
                              onClick={() => handleSearchSelect(item)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/5 transition-colors group cursor-pointer"
                              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.01)' : 'none' }}
                            >
                              <div className="w-7 h-10 rounded bg-white/5 border border-white/5 overflow-hidden shrink-0">
                                {item.poster_path ? (
                                  <img src={getThumbUrl(item.poster_path)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Film size={11} className="text-white/20" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-[12px] font-semibold truncate group-hover:text-white transition-colors">{getTitle(item)}</p>
                                <p className="text-[10px] capitalize text-white/30 font-semibold">{item.media_type}</p>
                              </div>
                              {item.vote_average > 0 && (
                                <span className="text-[10px] font-bold text-amber-500 shrink-0">★ {item.vote_average.toFixed(1)}</span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    key="icon"
                    onClick={() => setActiveTab('search')}
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-white/5 cursor-pointer ${
                      activeTab === 'search' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Search size={15} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Watchlist Bookmark Capsule Shortcut — Exchanged to be first in order */}
            <motion.button
              onClick={() => setActiveTab('watchlist')}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-white/5 cursor-pointer ${
                activeTab === 'watchlist' ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'text-white/40 hover:text-white'
              }`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              title="Watchlist Directory"
            >
              <Bookmark size={15} className={activeTab === 'watchlist' ? 'fill-current text-white' : ''} />
            </motion.button>

            {/* Config Node — Exchanged to be second in order */}
            <motion.button
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5 cursor-pointer text-white/40"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={15} />
            </motion.button>

          </div>
        </div>
      </motion.header>

      {/* ── Compact Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div
          className="flex items-center justify-around py-2 rounded-xl border border-white/[0.05] shadow-md"
          style={thinWaterStyle}
        >
          {[
            { id: 'home' as const,   label: 'Home',    icon: Home },
            { id: 'movies' as const, label: 'Movies',   icon: Film },
            { id: 'series' as const, label: 'Series',   icon: Tv },
            { id: 'genres' as const, label: 'Discover', icon: Compass },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-all cursor-pointer"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.25)' }}
              >
                <Icon size={15} />
                <span className="text-[10px] font-bold tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;