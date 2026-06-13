import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Play, Plus, Check, Info } from 'lucide-react';
import { getPopularTV, getTopRatedTV, getAiringTodayTV, getOnTheAirTV, getBackdropUrl, getTVDetails } from '../lib/tmdb';
import { useStore } from '../store/useStore';

const TABS = [
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top rated' },
  { id: 'airing_today', label: 'On air today' },
  { id: 'on_the_air', label: 'Current shows' },
];

const LOGO_BASE = 'https://image.tmdb.org/t/p/w500';

const SeriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [deckIndex, setDeckIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic tracking variables to hold logo strings extracted from the secondary append layer
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>(null);

  const { 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist, 
    setPlayerMedia, 
    setIsPlayerOpen,
    setIsModalOpen,
    setSelectedMedia 
  } = useStore();

  const { data: popular, isLoading: l1 } = useQuery({ queryKey: ['tv', 'popular'], queryFn: () => getPopularTV(1), enabled: activeTab === 'popular' });
  const { data: topRated, isLoading: l2 } = useQuery({ queryKey: ['tv', 'top_rated'], queryFn: () => getTopRatedTV(1), enabled: activeTab === 'top_rated' });
  const { data: airingToday, isLoading: l3 } = useQuery({ queryKey: ['tv', 'airing_today'], queryFn: () => getAiringTodayTV(1), enabled: activeTab === 'airing_today' });
  const { data: onTheAir, isLoading: l4 } = useQuery({ queryKey: ['tv', 'on_the_air'], queryFn: () => getOnTheAirTV(1), enabled: activeTab === 'on_the_air' });

  const dataMap: Record<string, typeof popular> = { popular, top_rated: topRated, airing_today: airingToday, on_the_air: onTheAir };
  const loadingMap: Record<string, boolean> = { popular: l1, top_rated: l2, airing_today: l3, on_the_air: l4 };

  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];
  const series = currentData?.results?.slice(0, 12).map(s => ({ ...s, media_type: 'tv' })) || [];

  const currentShow = series[deckIndex];

  // Secondary sub-effect resolution layer fetching full asset arrays to parse network logos matching HeroBanner styles
  useEffect(() => {
    if (!currentShow) return;
    setCurrentLogoPath(null);

    (async () => {
      try {
        const detailPayload = await getTVDetails(currentShow.id);
        const logos = (detailPayload as any).images?.logos || [];
        const englishLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0] || null;
        if (englishLogo) {
          setCurrentLogoPath(englishLogo.file_path);
        }
      } catch (err) {
        console.error("Failed fetching structural logo layers:", err);
      }
    })();
  }, [currentShow?.id]);

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

  // Uniform translucent liquid glass style dictionary
  const liquidGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  return (
    <div 
      className="h-screen w-full bg-[#020204] text-white relative select-none flex flex-col justify-between overflow-hidden animate-fade-in"
      style={{ 
        fontFamily: 'Helvetica, Arial, sans-serif',
        paddingTop: '4.236rem',
        paddingBottom: '4.236rem'
      }}
    >
      {/* ── Immersive Cinematic Blurred Poster Background Layer ── */}
      <AnimatePresence mode="wait">
        {currentShow && !isLoading && (
          <motion.div 
            key={`bg-${currentShow.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <img 
              src={getBackdropUrl(currentShow.backdrop_path || currentShow.poster_path)} 
              alt="" 
              className="w-full h-full object-cover blur-md scale-105 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-[#020204]/70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout Wrapper matching Card alignment constraints ── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 flex-1 flex flex-col justify-between min-h-0 relative z-10">
        
        {/* ── Page Header Controls Row ── */}
        <div className="w-full flex items-center justify-between mb-4 relative z-50 shrink-0 px-16">
          <h1 
            className="text-[36px] md:text-[40px] font-bold tracking-tight text-white/95 text-left shrink-0"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            Series
          </h1>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ ...liquidGlassStyle, fontFamily: 'Helvetica, Arial, sans-serif' }}
              className="px-6 py-3 rounded-[0.618rem] font-bold text-sm tracking-wide text-white hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer min-w-[210px] justify-between transform active:scale-98"
            >
              <span>{activeTabLabel}</span>
              <ChevronDown size={16} className={`transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  style={{ ...liquidGlassStyle, fontFamily: 'Helvetica, Arial, sans-serif' }}
                  className="absolute right-0 top-full overflow-hidden rounded-[0.618rem] bg-[#07070a]/95 w-[210px] z-50"
                >
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {TABS.map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { 
                            setActiveTab(tab.id); 
                            setIsDropdownOpen(false); 
                          }}
                          className={`px-4 py-2.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 w-full text-left cursor-pointer ${
                            isActive ? 'text-black bg-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Main Stage Area ── */}
        <div className="w-full flex-1 flex items-center justify-between relative min-h-0">
          
          {/* Left Flank Navigation Pill Button (Scaled to 50%) */}
          <div className="w-12 shrink-0 flex items-center justify-start z-30">
            <button
              onClick={prevCard}
              disabled={deckIndex === 0 || isLoading}
              style={liquidGlassStyle}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none shadow-xl"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Center Frame Space */}
          <div className="flex-1 aspect-video max-w-[1200px] relative mx-4 z-10 my-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" />
              ) : currentShow ? (
                <motion.div
                  key={`${activeTab}-${deckIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/[0.04] shadow-2xl"
                >
                  <img 
                    src={getBackdropUrl(currentShow.backdrop_path || currentShow.poster_path)} 
                    alt="" 
                    className="w-full h-full object-cover pointer-events-none absolute inset-0 select-none"
                  />

                  <div 
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background: 'linear-gradient(to top, rgba(2, 2, 4, 0.9) 0%, rgba(2, 2, 4, 0.4) 40%, transparent 100%), linear-gradient(to right, rgba(2, 2, 4, 0.7) 0%, transparent 50%)'
                    }}
                  />

                  {/* Custom Overlay Interface Elements */}
                  <div className="absolute bottom-16 left-16 z-40 flex flex-col gap-6 items-start text-left max-w-4xl">
                    
                    {/* Actual Show Logo Asset (Kept original large size specifications) */}
                    <div className="min-h-[96px] md:min-h-[128px] flex items-end">
                      {currentLogoPath ? (
                        <img 
                          src={`${LOGO_BASE}${currentLogoPath}`}
                          alt={currentShow.name || currentShow.title}
                          className="max-h-[110px] md:max-h-[150px] object-contain select-none pointer-events-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                        />
                      ) : (
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                          {currentShow.name || currentShow.title}
                        </h2>
                      )}
                    </div>

                    {/* Action Cluster Row (Pills Scaled to 50% of the maximum giant size) */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPlayerMedia({ id: currentShow.id, type: 'tv', season: 1, episode: 1 });
                          setIsPlayerOpen(true);
                        }}
                        style={{ ...liquidGlassStyle, fontFamily: 'Helvetica, Arial, sans-serif' }}
                        className="h-[40px] px-5 rounded-full text-white font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-xl"
                      >
                        <Play size={14} className="fill-current text-white" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMedia(currentShow);
                          setIsModalOpen(true);
                        }}
                        style={{ ...liquidGlassStyle, fontFamily: 'Helvetica, Arial, sans-serif' }}
                        className="h-[40px] px-4 rounded-full text-white font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-xl"
                      >
                        <Info size={14} className="text-white" />
                        <span>Info</span>
                      </button>

                      <button
                        onClick={() => isInWatchlist(currentShow.id) ? removeFromWatchlist(currentShow.id) : addToWatchlist(currentShow)}
                        style={{
                          ...liquidGlassStyle,
                          width: '40px',
                          height: '40px'
                        }}
                        className="rounded-full flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer hover:bg-white/10 shadow-xl"
                      >
                        {isInWatchlist(currentShow.id) ? <Check size={14} className="text-green-400" /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Right Flank Navigation Pill Button (Scaled to 50%) */}
          <div className="w-12 shrink-0 flex items-center justify-end z-30">
            <button
              onClick={nextCard}
              disabled={deckIndex === series.length - 1 || series.length === 0 || isLoading}
              style={liquidGlassStyle}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none shadow-xl"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeriesPage;