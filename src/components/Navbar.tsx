import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Home, Compass, Settings, Bell, Users, MessageSquare, Tv } from 'lucide-react';
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

  return (
    <>
      {/* ── Top Navbar: High-End Liquid Glassmorphism Dock ── */}
      <motion.header
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex justify-center w-auto max-w-[95vw]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div
          className="flex items-center gap-6 px-6 py-2.5 rounded-full transition-all duration-500 select-none"
          style={{
            // High-precision blending setup for true glass panel light refraction
            backgroundColor: scrolled ? 'rgba(15, 15, 20, 0.45)' : 'rgba(20, 20, 25, 0.25)',
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(35px) saturate(210%) brightness(110%)',
            WebkitBackdropFilter: 'blur(35px) saturate(210%) brightness(110%)',
            // Liquid edge highlight ring (replicates premium 3D physical glass bevels)
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 12px 40px -10px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Logo element with premium ambient glare drop */}
          <motion.button
            className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            onClick={() => setActiveTab('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <span className="text-sm leading-none filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">🎥</span>
          </motion.button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="text-[13px] font-semibold tracking-normal transition-all duration-300 relative py-0.5"
                style={{
                  color: activeTab === item.id ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                  textShadow: activeTab === item.id ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                }}
                onMouseEnter={(e) => { if (activeTab !== item.id) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
                onMouseLeave={(e) => { if (activeTab !== item.id) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'; }}
              >
                {item.label}
                {activeTab === item.id && (
                  <motion.span 
                    layoutId="activeGlow"
                    className="absolute -bottom-1 left-1 right-1 h-2px bg-white rounded-full shadow-[0_0_8px_#fff]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Icon Dock Elements */}
          <div className="flex items-center gap-3 text-white/45">
            
            {/* Search Engine Dock Slider */}
            <div className="relative flex items-center">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="input"
                    initial={{ width: 32, opacity: 0 }}
                    animate={{ width: 190, opacity: 1 }}
                    exit={{ width: 32, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(20px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Search size={13} className="text-white/40 shrink-0" />
                      <input
                        ref={searchRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items..."
                        className="bg-transparent text-white text-xs placeholder-white/20 outline-none w-full py-0.5"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') closeSearch();
                          if (e.key === 'Enter' && searchQuery) {
                            setActiveTab('search');
                            closeSearch();
                          }
                        }}
                      />
                      <button onClick={closeSearch} className="shrink-0">
                        <X size={12} className="text-white/30 hover:text-white/70 transition-colors" />
                      </button>
                    </div>

                    {/* Glassmorphic Auto-Suggestions */}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl overflow-hidden z-50 shadow-2xl p-1"
                          style={{
                            backgroundColor: 'rgba(15, 15, 20, 0.75)',
                            backdropFilter: 'blur(40px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.9)',
                          }}
                        >
                          {suggestions.map((item, i) => (
                            <button
                              key={item.id}
                              onClick={() => handleSearchSelect(item)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}
                            >
                              <div className="w-8 h-11 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5">
                                {item.poster_path ? (
                                  <img src={getThumbUrl(item.poster_path)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Film size={12} className="text-white/20" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate group-hover:text-white transition-colors">{getTitle(item)}</p>
                                <p className="text-[10px] capitalize mt-0.5 text-white/30">{item.media_type}</p>
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
                    onClick={() => {
                      // Navigate straight to your dedicated SearchPage canvas
                      setActiveTab('search');
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-white/5 ${
                      activeTab === 'search' ? 'text-white bg-white/10' : 'text-white/45 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' } as any}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Search size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Utility Docks */}
            <motion.button
              className="w-8 h-8 rounded-full items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' } as any}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={14} />
            </motion.button>

            <motion.button
              className="w-8 h-8 rounded-full items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' } as any}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={14} />
            </motion.button>

            <motion.button
              className="w-8 h-8 rounded-full items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' } as any}
              whileTap={{ scale: 0.95 }}
            >
              <Users size={14} />
            </motion.button>

            <motion.button
              className="w-8 h-8 rounded-full items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' } as any}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare size={14} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Glass Tab Bar ── */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-40">
        <div
          className="flex items-center justify-around py-2 rounded-2xl"
          style={{
            backgroundColor: 'rgba(15, 15, 20, 0.45)',
            backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(35px) saturate(200%) brightness(105%)',
            WebkitBackdropFilter: 'blur(35px) saturate(200%) brightness(105%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 -10px 35px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {[
            { id: 'home' as const,   label: 'Home',     icon: Home },
            { id: 'movies' as const, label: 'Movies',   icon: Film },
            { id: 'series' as const, label: 'Series',   icon: Tv },
            { id: 'genres' as const, label: 'Discover', icon: Compass },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all"
              style={{ color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.32)' }}
            >
              <Icon size={16} className={activeTab === id ? 'filter drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;