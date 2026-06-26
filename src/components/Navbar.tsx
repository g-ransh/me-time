import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Home, Compass, Settings, User, Tv } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchMulti } from '../lib/tmdb';
import { SearchResult } from '../types';
import { getThumbUrl, getTitle } from '../lib/tmdb';

const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSearchOpen,
    searchQuery,
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

  // Moved 'watchlist' directly into the primary navigation array for perfect text spacing
  const navItems: { id: 'home' | 'movies' | 'series' | 'genres' | 'watchlist'; label: string }[] = [
    { id: 'home',      label: 'Home' },
    { id: 'movies',    label: 'Movies' },
    { id: 'series',    label: 'Series' },
    { id: 'genres',    label: 'Discover' },
    { id: 'watchlist', label: 'My List' },
  ];

  // 1. MATERIAL METRICS
  const thinWaterStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.15)',
    backdropFilter: 'blur(5px) saturate(180%) brightness(100%)',
    WebkitBackdropFilter: 'blur(5px) saturate(180%) brightness(100%)',
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
          // 2. ADVANCED EMBOSSING & SHADOW DEEPLY PRESSED INTO THE SCENE (Removed border stroke blur with precise inline styles)
          className="flex items-center gap-[32px] p-[6px_10px] rounded-full select-none"
          style={{
            ...thinWaterStyle,
            border: 'none',
            boxShadow: '0 0px 1px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Movie Reel Logo Emblem Layout Anchor */}
          <motion.button
            className="flex items-center justify-center w-[34px] h-[34px] rounded-full shrink-0 text-white/80 hover:text-white"
            onClick={() => setActiveTab('home')}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 1.05 }}
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

          {/* Main Navigation Row — Space equally matched to all elements */}
          {/* 3. OPTICAL CONDENSED GAP CONFIGURATIONS */}
          <nav className="hidden md:flex items-center gap-[24px]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  // 4. TYPOGRAPHY ENGINE (Anti-aliased text configurations)
                  className="text-[14px] tracking-wide transition-all duration-200 relative py-0.5 cursor-pointer antialiased"
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: isActive ? 700 : 600,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Compact Interface Utilities Section Block — Tighter icon grouping */}
          <div className="flex items-center gap-[10px] text-white/35">
                  <motion.button
                    key="icon"
                    onClick={() => setActiveTab('search')}
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-white/5 cursor-pointer ${
                      activeTab === 'search' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.10 }}
                    whileTap={{ scale: 1.00 }}
                  >
                    <Search size={15} />
                  </motion.button>

            {/* Profile Action Node */}
            <motion.button
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5 cursor-pointer text-white/40"
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 1.00 }}
              title="Profile"
            >
              <User size={15} />
            </motion.button>

            {/* Settings Config Node */}
            <motion.button
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center hidden md:flex hover:text-white transition-colors border border-transparent hover:border-white/5 cursor-pointer text-white/40"
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 1.00 }}
              title="Settings"
            >
              <Settings size={15} />
            </motion.button>

          </div>
        </div>
      </motion.header>

      {/* ── Compact Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div
          // 2. ORGANIC MOBILE CONTAINER CORNER SYSTEM (rounded-xl) + Sharp Glass Bevel Style
          className="flex items-center justify-around py-2 rounded-xl"
          style={{
            ...thinWaterStyle,
            boxShadow: '0 1px 1000px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          }}
        >
          {[
            { id: 'home' as const,   label: 'Home',    icon: Home },
            { id: 'movies' as const, label: 'Movies',   icon: Film },
            { id: 'series' as const, label: 'Series',   icon: Tv },
            { id: 'genres' as const, label: 'Discover', icon: Compass },
            { id: 'watchlist' as const, label: 'My List', icon: User }, // Mobile fallback for the list tab
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-0.5 px-3 py-0.5 rounded-lg transition-all cursor-pointer antialiased"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.25)' }}
              >
                <Icon size={15} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;