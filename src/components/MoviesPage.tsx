import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Play, Plus, Check, Info } from 'lucide-react';
import { getPopularMovies, getTopRatedMovies, getNowPlaying, getUpcomingMovies, getBackdropUrl, getMovieDetails } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import { GlassButton } from './ui/GlassButton';

const TABS = [
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top rated' },
  { id: 'now_playing', label: 'In theaters' },
  { id: 'upcoming', label: 'Coming soon' },
];

const LOGO_BASE = 'https://image.tmdb.org/t/p/w500';

const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [deckIndex, setDeckIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const { data: popular, isLoading: l1 } = useQuery({ queryKey: ['movies', 'popular'], queryFn: () => getPopularMovies(1), enabled: activeTab === 'popular' });
  const { data: topRated, isLoading: l2 } = useQuery({ queryKey: ['movies', 'top_rated'], queryFn: () => getTopRatedMovies(1), enabled: activeTab === 'top_rated' });
  const { data: nowPlaying, isLoading: l3 } = useQuery({ queryKey: ['movies', 'now_playing'], queryFn: () => getNowPlaying(1), enabled: activeTab === 'now_playing' });
  const { data: upcoming, isLoading: l4 } = useQuery({ queryKey: ['movies', 'upcoming'], queryFn: () => getUpcomingMovies(1), enabled: activeTab === 'upcoming' });

  const dataMap: Record<string, typeof popular> = { popular, top_rated: topRated, now_playing: nowPlaying, upcoming };
  const loadingMap: Record<string, boolean> = { popular: l1, top_rated: l2, now_playing: l3, upcoming: l4 };

  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];
  const movies = currentData?.results?.slice(0, 12).map(m => ({ ...m, media_type: 'movie' })) || [];

  const currentMovie = movies[deckIndex];

  useEffect(() => {
    if (!currentMovie) return;
    setCurrentLogoPath(null);

    (async () => {
      try {
        const detailPayload = await getMovieDetails(currentMovie.id);
        const logos = (detailPayload as any).images?.logos || [];
        const englishLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0] || null;
        if (englishLogo) {
          setCurrentLogoPath(englishLogo.file_path);
        }
      } catch (err) {
        console.error("Failed fetching structural logo layers:", err);
      }
    })();
  }, [currentMovie?.id]);

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

  const nextCard = () => { if (deckIndex < movies.length - 1) setDeckIndex(p => p + 1); };
  const prevCard = () => { if (deckIndex > 0) setDeckIndex(p => p - 1); };

  const activeTabLabel = TABS.find(t => t.id === activeTab)?.label || 'Select';

  // Configured to exactly 5% dark overlay tint (0.05 opacity) with a borderless crystal glass setup
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.05)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  const globalDropdownGlassClass = "absolute top-full mt-[0.618rem] rounded-[0.618rem] p-[0.618rem] z-50 overflow-hidden";

  return (
    <div 
      className="h-screen w-full bg-[#020204] text-white relative select-none flex flex-col justify-between overflow-hidden animate-fade-in"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        paddingTop: '4.236rem',
        paddingBottom: '4.236rem'
      }}
    >
      {/* ── Immersive Cinematic Blurred Poster Background Layer ── */}
      <AnimatePresence mode="wait">
        {currentMovie && !isLoading && (
          <motion.div 
            key={`bg-${currentMovie.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <img 
              src={getBackdropUrl(currentMovie.backdrop_path || currentMovie.poster_path)} 
              alt="" 
              className="w-full h-full object-cover blur-md scale-105 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-[#020204]/70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout Wrapper ── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 flex-1 flex flex-col justify-between min-h-0 relative z-10">
        
        {/* ── Page Header Controls Row ── */}
        <div className="w-full flex items-center justify-between mb-4 relative z-50 shrink-0 px-16">

          <div className="relative" ref={dropdownRef}>
            <GlassButton
              variant="text"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ padding: '0.618rem 1rem', ...navbarMatchGlassStyle }}
              className="flex items-center text-xs font-medium !rounded-[0.618rem] text-white min-w-[150px] justify-between"
            >
              <span>{activeTabLabel}</span>
              <ChevronDown size={12} className="opacity-40 ml-[0.382rem]" />
            </GlassButton>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  style={navbarMatchGlassStyle}
                  className={`${globalDropdownGlassClass} right-0 w-[12.36rem]`}
                >
                  <div className="flex flex-col gap-0.5">
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <GlassButton
                          key={tab.id}
                          variant="text"
                          onClick={() => { 
                            setActiveTab(tab.id); 
                            setIsDropdownOpen(false); 
                          }}
                          className={`w-full justify-between items-center !rounded-[0.382rem] text-xs font-medium !bg-transparent transition-all duration-200 ${
                            isActive ? '!text-white' : '!text-white/50'
                          } hover:!bg-white/10 hover:!text-white`}
                          style={{ padding: '0.382rem 0.618rem', boxShadow: 'none', border: 'none' }}
                        >
                          <span>{tab.label}</span>
                          {isActive && <Check size={12} />}
                        </GlassButton>
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
          
          {/* Left Flank Navigation Pill Button */}
          <div className="w-12 shrink-0 flex items-center justify-start z-30">
            <GlassButton
              variant="icon"
              onClick={prevCard}
              disabled={deckIndex === 0 || isLoading}
              style={navbarMatchGlassStyle}
              className="!w-10 !h-10 !rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all disabled:!opacity-0 disabled:!pointer-events-none"
            >
              <ChevronLeft size={18} />
            </GlassButton>
          </div>

          {/* Center Frame Space */}
          <div className="flex-1 aspect-video max-w-[1200px] relative mx-4 z-10 my-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" />
              ) : currentMovie ? (
                <motion.div
                  key={`${activeTab}-${deckIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/[0.04] shadow-2xl"
                >
                  <img 
                    src={getBackdropUrl(currentMovie.backdrop_path || currentMovie.poster_path)} 
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
                    
                    {/* Actual Movie Logo Asset Container */}
                    <div className="min-h-[96px] md:min-h-[128px] flex items-end">
                      {currentLogoPath ? (
                        <img 
                          src={`${LOGO_BASE}${currentLogoPath}`}
                          alt={currentMovie.title || currentMovie.name}
                          className="max-h-[110px] md:max-h-[150px] object-contain select-none pointer-events-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                        />
                      ) : (
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                          {currentMovie.title || currentMovie.name}
                        </h2>
                      )}
                    </div>

                    {/* Action Cluster Row */}
                    <div className="flex items-center gap-3">
                      <GlassButton
                        variant="text"
                        onClick={() => {
                          setPlayerMedia({ id: currentMovie.id, type: 'movie' });
                          setIsPlayerOpen(true);
                        }}
                        style={navbarMatchGlassStyle}
                        className="!h-[40px] !px-5 !rounded-full text-white font-medium text-sm tracking-wide"
                      >
                        <Play size={14} className="fill-current text-white mr-2" />
                        <span>Play</span>
                      </GlassButton>

                      <GlassButton
                        variant="text"
                        onClick={() => {
                          setSelectedMedia(currentMovie);
                          setIsModalOpen(true);
                        }}
                        style={navbarMatchGlassStyle}
                        className="!h-[40px] !px-4 !rounded-full text-white font-medium text-sm tracking-wide"
                      >
                        <Info size={14} className="text-white mr-2" />
                        <span>Info</span>
                      </GlassButton>

                      <GlassButton
                        variant="icon"
                        onClick={() => isInWatchlist(currentMovie.id) ? removeFromWatchlist(currentMovie.id) : addToWatchlist(currentMovie)}
                        style={navbarMatchGlassStyle}
                        className="!w-[40px] !h-[40px] !rounded-full"
                      >
                        {isInWatchlist(currentMovie.id) ? <Check size={14} className="text-green-400" /> : <Plus size={14} />}
                      </GlassButton>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Right Flank Navigation Pill Button */}
          <div className="w-12 shrink-0 flex items-center justify-end z-30">
            <GlassButton
              variant="icon"
              onClick={nextCard}
              disabled={deckIndex === movies.length - 1 || movies.length === 0 || isLoading}
              style={navbarMatchGlassStyle}
              className="!w-10 !h-10 !rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all disabled:!opacity-0 disabled:!pointer-events-none"
            >
              <ChevronRight size={18} />
            </GlassButton>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MoviesPage;