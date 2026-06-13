import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Star, Calendar, Clock, Tv } from 'lucide-react';
import { Movie } from '../types';
import { getBackdropUrl, getTitle, getReleaseYear, getMovieDetails, getTVDetails, getLogoUrl } from '../lib/tmdb';
import { useStore } from '../store/useStore';

interface HeroBannerProps {
  movies?: Movie[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentDetails, setCurrentDetails] = useState<any>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(true);
  
  const [timerKey, setIframeKey] = useState(0);

  const {
    setSelectedMedia,
    setIsModalOpen,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setPlayerMedia,
    setIsPlayerOpen,
  } = useStore();

  const featured = movies.slice(0, 7).filter(m => m.backdrop_path);
  const current = featured[currentIndex];

  useEffect(() => {
    if (!current) return;
    setCurrentDetails(null);
    setLogoPath(null);
    setIsFetchingDetails(true);

    const fetch = async () => {
      try {
        const data = current.media_type === 'tv'
          ? await getTVDetails(current.id)
          : await getMovieDetails(current.id);
        setCurrentDetails(data);

        const unsealedData = data as any;
        if (unsealedData?.images?.logos && unsealedData.images.logos.length > 0) {
          const engLogo = unsealedData.images.logos.find((l: any) => l.iso_639_1 === 'en') || unsealedData.images.logos[0];
          setLogoPath(engLogo.file_path);
        }
      } catch {
        // ignore safely
      } finally {
        setIsFetchingDetails(false);
      }
    };
    fetch();
  }, [current?.id]);

  useEffect(() => {
    if (!isAutoPlaying || featured.length === 0) return;
    const t = setInterval(() => {
      setCurrentIndex(p => (p + 1) % featured.length);
      setIframeKey(k => k + 1);
    }, 8000);
    return () => clearInterval(t);
  }, [isAutoPlaying, featured.length, timerKey]);

  const goTo = (i: number) => {
    setCurrentIndex(i);
    setIframeKey(k => k + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!current) return null;

  const inWatchlist = isInWatchlist(current.id);
  const isTV = current.media_type === 'tv';

  const getRuntimeLabel = () => {
    if (isTV) {
      const seasons = currentDetails?.number_of_seasons;
      return seasons ? `${seasons} Season${seasons > 1 ? 's' : ''}` : 'Series';
    }
    const mins = currentDetails?.runtime;
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
  };

  const runtimeLabel = getRuntimeLabel();

  const uniformMetadataPillClass =
    'h-9 px-4 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-bold select-none ' +
    'border border-white/[0.08] tracking-wide shrink-0 ' +
    'shadow-[0_2px_12px_rgba(0,0,0,0.3)]';

  const upscaledActionPillClass =
    'h-[46px] px-6 rounded-full flex items-center justify-center gap-2 text-[15px] font-bold select-none ' +
    'border tracking-wide shrink-0 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4)]';

  const liquidGlassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.07)', 
    fontFamily: '"Inter", sans-serif',
  };

  return (
    <div
      className="relative h-screen min-h-[720px] max-h-[950px] w-full overflow-hidden bg-[#020204]"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* ── Cinematic Backdrop ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
        >
          <img
            src={getBackdropUrl(current.backdrop_path)}
            alt=""
            className="w-full h-full object-cover brightness-[1.04] contrast-[1.03]"
          />

          {/* Expanded Brownian Diffusion: Shifted gradient thresholds back to let ambient lighting overflow the interface cleanly */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#020204] via-[#020204]/30 to-transparent mix-blend-normal" />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-white/[0.08] via-transparent to-[#020204]/10" />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#020204]/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content Stage ── */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-10 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[680px]"
          >
            {/* Unified Title Frame Container */}
            <div className="mb-6 select-none flex items-center min-h-[110px]">
              {isFetchingDetails ? (
                <div className="h-[110px] w-48 bg-transparent" />
              ) : logoPath ? (
                <img
                  src={getLogoUrl(logoPath)}
                  alt={getTitle(current)}
                  className="max-h-[110px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <h1
                  className="text-5xl md:text-[64px] lg:text-[72px] font-black leading-[0.9] text-white uppercase tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                  style={{ fontWeight: 950, letterSpacing: '-0.03em' }}
                >
                  {getTitle(current)}
                </h1>
              )}
            </div>

            {/* Standardized Geometric Metadata Row Layer */}
            <div className="flex items-center gap-2.5 mb-6 flex-wrap">
              <div className={uniformMetadataPillClass} style={liquidGlassStyle}>
                <Star size={13} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                <span className="text-white">{current.vote_average ? current.vote_average.toFixed(1) : '7.9'}</span>
              </div>

              <div className={uniformMetadataPillClass} style={liquidGlassStyle}>
                <Calendar size={13} className="text-white/55 flex-shrink-0" />
                <span className="text-white">{getReleaseYear(current)}</span>
              </div>

              {runtimeLabel && (
                <div className={uniformMetadataPillClass} style={liquidGlassStyle}>
                  {isTV
                    ? <Tv size={13} className="text-white/55 flex-shrink-0" />
                    : <Clock size={13} className="text-white/55 flex-shrink-0" />
                  }
                  <span className="text-white">{runtimeLabel}</span>
                </div>
              )}
            </div>

            {/* DESCRIPTION LAYER: Strictly locks truncation parameters and conditional space evaluation anchors inside line 3 thresholds */}
            <div className="mb-8 max-w-[560px]">
              <p 
                className="text-white/95 text-base md:text-[17px] leading-relaxed select-text font-serif antialiased tracking-wide line-clamp-3 overflow-hidden text-ellipsis display-box webkit-box webkit-line-clamp-3 webkit-box-orient-vertical" 
                style={{ 
                  fontFamily: '"New York Medium", Georgia, Cambria, serif', 
                  fontWeight: 400,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {current.overview || 'No description available for this specific entertainment frame sequence.'}
                {/* STRICT CONDITIONAL INTERCEPT:
                  Increased threshold length boundary rules from 140 to 180 characters.
                  Guarantees that strings cleanly wrapping under 3 full block lines will never mount trailing ellipsis indicators.
                */}
                {current.overview && current.overview.length > 180 && (
                  <span className="text-white font-serif tracking-wide select-none">&nbsp;...</span>
                )}
              </p>
            </div>

            {/* Action Buttons Group Stage */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => {
                  setPlayerMedia({ id: current.id, type: isTV ? 'tv' : 'movie', season: 1, episode: 1 });
                  setIsPlayerOpen(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`${upscaledActionPillClass} bg-white/[0.07] border-white/[0.08] text-white hover:bg-white/[0.12] cursor-pointer`}
                style={liquidGlassStyle}
              >
                <Play size={15} className="text-white fill-current flex-shrink-0" />
                <span>Play</span>
              </motion.button>

              <motion.button
                onClick={() => { setSelectedMedia(current); setIsModalOpen(true); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`${upscaledActionPillClass} border-white/[0.08] text-white hover:bg-white/[0.12] cursor-pointer`}
                style={liquidGlassStyle}
              >
                <Info size={15} className="text-white/80 flex-shrink-0" />
                <span>Info</span>
              </motion.button>

              <motion.button
                onClick={() => inWatchlist ? removeFromWatchlist(current.id) : addToWatchlist(current)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center border shrink-0 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer"
                style={{
                  ...liquidGlassStyle,
                  background: inWatchlist ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.07)',
                  borderColor: inWatchlist ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Plus
                  size={18}
                  className={`transition-all duration-300 ${inWatchlist ? 'rotate-45 text-red-400' : 'text-white'}`}
                />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Progress Filling Capsule Bar Node ── */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-[8px] min-w-[200px]">
        {featured.map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-[7px] rounded-full overflow-hidden bg-white/20 transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
              style={{ width: isActive ? '24px' : '7px' }}
            >
              {isActive && (
                <motion.div
                  key={timerKey}
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeroBanner;