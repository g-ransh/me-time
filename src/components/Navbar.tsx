import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Bookmark, Tv, Film, Home, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchMulti } from '../lib/tmdb';
import { SearchResult } from '../types';
import { getThumbUrl, getTitle } from '../lib/tmdb';

const Navbar: React.FC = () => {
  const {
    activeTab, setActiveTab,
    isSearchOpen, setIsSearchOpen,
    searchQuery, setSearchQuery,
    watchlist,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(searchQuery);
        setSuggestions(data.results.filter(r => r.media_type !== 'person').slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, [searchQuery]);

  const handleSearchSelect = (item: SearchResult) => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchOpen(false);
    setActiveTab('search');
    useStore.setState({ selectedMedia: item, isModalOpen: true });
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'movies' as const, label: 'Movies', icon: Film },
    { id: 'series' as const, label: 'Series', icon: Tv },
    { id: 'genres' as const, label: 'Genres', icon: Layers },
  ];

  return (
    <motion.div
      className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-[90%] z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Floating pill header with red-tinted liquid glass */}
      <div
        className={`flex items-center justify-between gap-3 md:gap-4 px-3 md:px-5 py-2.5 md:py-3 rounded-full transition-all duration-500 ${
          scrolled ? 'shadow-2xl shadow-red-950/40' : 'shadow-xl shadow-red-950/20'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.06) 40%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: scrolled
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 20px 60px rgba(239, 68, 68, 0.15), 0 8px 24px rgba(0, 0, 0, 0.4)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 10px 40px rgba(239, 68, 68, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Inner top sheen */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent)',
          }}
        />

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0 relative z-10"
          onClick={() => setActiveTab('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-black text-lg tracking-tight gradient-text hidden sm:block">me-time</span>
        </motion.div>

        {/* Nav Pills (Desktop) */}
        <div className="hidden md:flex items-center gap-0.5 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === item.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-rose-500/30 border border-red-400/30 rounded-full"
                    layoutId="navActive"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 relative z-10">
          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="relative"
                >
                  <div
                    className="rounded-full flex items-center gap-2 px-4 py-2"
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <Search size={14} className="text-red-400 flex-shrink-0" />
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="bg-transparent text-white placeholder-white/30 text-sm outline-none flex-1 w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          setSuggestions([]);
                        }
                        if (e.key === 'Enter' && searchQuery) {
                          setActiveTab('search');
                          setIsSearchOpen(false);
                          setSuggestions([]);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSuggestions([]);
                      }}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Autocomplete */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute top-full right-0 mt-3 w-80 liquid-glass-strong rounded-3xl overflow-hidden z-50 shadow-2xl"
                      >
                        {suggestions.map((item, i) => (
                          <motion.button
                            key={item.id}
                            onClick={() => handleSearchSelect(item)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                              {item.poster_path ? (
                                <img
                                  src={getThumbUrl(item.poster_path)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film size={14} className="text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{getTitle(item)}</p>
                              <p className="text-white/40 text-xs capitalize">{item.media_type}</p>
                            </div>
                            {item.vote_average > 0 && (
                              <span className="text-amber-400 text-xs font-medium">
                                ⭐ {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors hover:bg-white/5"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Search size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Watchlist */}
          <motion.button
            onClick={() => setActiveTab('genres')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors hover:bg-white/5 relative"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Bookmark size={15} />
            {watchlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg shadow-red-500/50">
                {watchlist.length}
              </span>
            )}
          </motion.button>

          {/* Avatar */}
          <motion.div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center cursor-pointer text-sm font-bold shadow-lg shadow-red-500/40"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            M
          </motion.div>
        </div>
      </div>

      {/* Mobile Nav Bar (bottom pill) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div
          className="flex items-center justify-around py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.06) 40%, rgba(255, 255, 255, 0.04) 100%)',
            backdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 10px 40px rgba(239, 68, 68, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all ${
                  activeTab === item.id
                    ? 'text-white bg-gradient-to-r from-red-500/30 to-rose-500/20'
                    : 'text-white/40'
                }`}
              >
                <Icon size={16} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
