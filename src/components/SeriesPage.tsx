import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Clapperboard, Rocket, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { MediaExhibitionDeck } from '../components/MediaExhibitionDeck';
import { getPopularTV, getTopRatedTV, getAiringTodayTV, getOnTheAirTV } from '../lib/tmdb';

const TABS = [
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'top_rated', label: 'Top rated', icon: Star },
  { id: 'airing_today', label: 'On air today', icon: Clapperboard },
  { id: 'on_the_air', label: 'Current shows', icon: Rocket },
];

const SeriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [deckIndex, setDeckIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: popular, isLoading: l1 } = useQuery({ queryKey: ['tv', 'popular'], queryFn: () => getPopularTV(1), enabled: activeTab === 'popular' });
  const { data: topRated, isLoading: l2 } = useQuery({ queryKey: ['tv', 'top_rated'], queryFn: () => getTopRatedTV(1), enabled: activeTab === 'top_rated' });
  const { data: airingToday, isLoading: l3 } = useQuery({ queryKey: ['tv', 'airing_today'], queryFn: () => getAiringTodayTV(1), enabled: activeTab === 'airing_today' });
  const { data: onTheAir, isLoading: l4 } = useQuery({ queryKey: ['tv', 'on_the_air'], queryFn: () => getOnTheAirTV(1), enabled: activeTab === 'on_the_air' });

  const dataMap: Record<string, typeof popular> = { popular, top_rated: topRated, airing_today: airingToday, on_the_air: onTheAir };
  const loadingMap: Record<string, boolean> = { popular: l1, top_rated: l2, airing_today: l3, on_the_air: l4 };

  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];
  const series = currentData?.results?.slice(0, 12).map(s => ({ ...s, media_type: 'tv' })) || [];

  useEffect(() => { setDeckIndex(0); }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextCard = () => { if (deckIndex < series.length - 1) setDeckIndex(p => p + 1); };
  const prevCard = () => { if (deckIndex > 0) setDeckIndex(p => p - 1); };

  const activeTabLabel = TABS.find(t => t.id === activeTab)?.label || 'Select';

  const liquidGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(32px) saturate(160%)',
    WebkitBackdropFilter: 'blur(32px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
  };

  return (
    <div className="h-screen w-full pt-24 pb-8 bg-[#020204] text-white overflow-hidden flex flex-col justify-start gap-6" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Golden Proportional Balanced Header Row */}
      <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-0 shrink-0 relative z-50">
        
        {/* Left Side: Page Title */}
        <h1 className="text-4xl font-black tracking-tighter uppercase text-white font-sans md:w-[250px] text-left">
          TV Series
        </h1>

        {/* Center Focus: Golden Ratio Glassmorphic Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={liquidGlassStyle}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white hover:bg-white/0.05 transition-all flex items-center gap-3 cursor-pointer shadow-xl min-w-[200px] justify-between transform active:scale-98"
          >
            <span className="font-sans">{activeTabLabel}</span>
            <ChevronDown size={16} className={`transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Glassmorphic Options Dropdown Menu Panel */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                style={liquidGlassStyle}
                className="absolute left-0 right-0 overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] bg-[#07070a]/90"
              >
                <div className="p-1 flex flex-col gap-0.5">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setIsDropdownOpen(false); }}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 w-full text-left cursor-pointer ${
                          isActive ? 'text-black bg-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={14} className={isActive ? 'text-black' : 'text-white/30'} />
                        <span className="font-sans">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Proportional Counter Component */}
        <div className="text-right md:w-[250px]">
          {!isLoading && series.length > 0 && (
            <div className="text-base font-bold text-white/40 tracking-wider font-sans">
              <span className="text-white font-black">{(deckIndex + 1).toString().padStart(2, '0')}</span> / {series.length.toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Main Exhibition Deck Stage */}
      <div className="relative w-full flex items-center justify-center grow overflow-hidden px-4 md:px-12 mt-2">
        
        {/* LEFT Flank Large Button */}
        <button 
          onClick={prevCard} 
          disabled={deckIndex === 0}
          style={liquidGlassStyle}
          className="absolute left-6 md:left-12 z-30 p-5 md:p-6 rounded-full transition-all text-white disabled:opacity-0 disabled:pointer-events-none hover:bg-white/10 hover:border-white/20 active:scale-90 cursor-pointer hidden sm:block shadow-2xl"
        >
          <ChevronLeft size={24} />
        </button>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="w-full max-w-[1200px] aspect-video bg-white/0.01 border border-white/5 rounded-3xl animate-pulse" />
          ) : series.length > 0 ? (
            <div className="w-full overflow-visible flex justify-center items-center">
              <div 
                className="w-full max-w-[1200px] flex justify-start items-center transition-transform duration-500 ease-out" 
                style={{ transform: `translateX(calc(-${deckIndex * 100}% - ${deckIndex * 32}px))` }}
              >
                {series.map((show, idx) => (
                  <div key={show.id} className="w-full shrink-0 mr-8 last:mr-0">
                    <MediaExhibitionDeck movie={show} isActive={idx === deckIndex} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* RIGHT Flank Large Button */}
        <button 
          onClick={nextCard} 
          disabled={deckIndex === series.length - 1}
          style={liquidGlassStyle}
          className="absolute right-6 md:right-12 z-30 p-5 md:p-6 rounded-full transition-all text-white disabled:opacity-0 disabled:pointer-events-none hover:bg-white/10 hover:border-white/20 active:scale-90 cursor-pointer hidden sm:block shadow-2xl"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
};

export default SeriesPage;