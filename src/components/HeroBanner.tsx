import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { getBackdropUrl, getTitle, getReleaseYear } from '../lib/tmdb';
import { useStore } from '../store/useStore';

interface HeroBannerProps {
  movies: Movie[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

const HeroBanner: React.FC<HeroBannerProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { setSelectedMedia, setIsModalOpen, addToWatchlist, isInWatchlist, setPlayerMedia, setIsPlayerOpen } = useStore();

  const featured = movies.slice(0, 5);
  const current = featured[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying || featured.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featured.length]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prev = () => goTo((currentIndex - 1 + featured.length) % featured.length);
  const next = () => goTo((currentIndex + 1) % featured.length);

  if (!current) return null;

  const genres = current.genre_ids?.slice(0, 3).map((id) => GENRE_MAP[id]).filter(Boolean) || [];
  const inWatchlist = isInWatchlist(current.id);

  // Premium Liquid Glass Blur Config Stylesheet
  const liquidGlassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(32px) saturate(180%)',
    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
  };

  return (
    <div className="relative h-screen min-h-[700px] max-h-[950px] w-full overflow-hidden bg-[#020204]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Background Cinematic Canvas Layers */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
        >
          <img
            src={getBackdropUrl(current.backdrop_path)}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          {/* Proportional Lighting Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020204] via-[#020204]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-[#020204]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020204]" />
        </motion.div>
      </AnimatePresence>

      {/* Main Foreground Content Stage */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-16 max-w-[1400px] mx-auto text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            {/* Perfectly Unified Golden Ratio Badges Row */}
            <div className="flex items-center gap-3 mb-6">
              {/* Rating Pill */}
              <div 
                style={liquidGlassStyle} 
                className="w-24 h-9 rounded-full flex items-center justify-center gap-1.5 shadow-xl text-xs font-bold text-white shrink-0"
              >
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>{current.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>

              {/* Release Year Pill */}
              <div 
                style={liquidGlassStyle} 
                className="w-24 h-9 rounded-full flex items-center justify-center shadow-xl text-xs font-bold text-white/80 shrink-0"
              >
                <span>{getReleaseYear(current)}</span>
              </div>

              {/* Primary Genre Pill */}
              {genres[0] && (
                <div 
                  style={liquidGlassStyle} 
                  className="w-24 h-9 rounded-full flex items-center justify-center shadow-xl text-xs font-bold text-white/80 shrink-0 truncate px-2"
                >
                  <span>{genres[0]}</span>
                </div>
              )}
            </div>

            {/* Expanded Authoritative Upper Title Focal Point */}
            <h1 
              className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-5 font-sans drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            >
              {getTitle(current)}
            </h1>

            {/* Content Overview Segment Description */}
            <p className="text-white/50 text-sm md:text-base font-normal leading-relaxed mb-8 max-w-xl font-sans tracking-wide drop-shadow-sm line-clamp-3">
              {current.overview || 'No presentation logging cataloged for this specific archival showcase frame.'}
            </p>

            {/* Magnified Actions Row Block Interface */}
            <div className="flex items-center gap-3.5 flex-wrap">
              <motion.button
                onClick={() => {
                  setPlayerMedia({
                    id: current.id,
                    type: current.media_type === 'tv' ? 'tv' : 'movie',
                  });
                  setIsPlayerOpen(true);
                }}
                className="px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 bg-white text-black transition-all cursor-pointer shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={14} className="fill-current" />
                Play
              </motion.button>

              <motion.button
                onClick={() => {
                  setSelectedMedia(current);
                  setIsModalOpen(true);
                }}
                style={liquidGlassStyle}
                className="px-7 py-4 rounded-full font-bold text-sm flex items-center gap-2 text-white hover:bg-white/5 transition-all cursor-pointer shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Info size={14} />
                Info
              </motion.button>

              <motion.button
                onClick={() => inWatchlist ? useStore.getState().removeFromWatchlist(current.id) : addToWatchlist(current)}
                style={liquidGlassStyle}
                className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all shadow-2xl ${inWatchlist ? 'text-red-400' : 'text-white'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} className={inWatchlist ? 'rotate-45' : ''} style={{ transition: 'transform 0.3s ease-out' }} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Proportional Navigation Carousel Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Compact Interactive Right Side Miniature Thumb Rail */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-3">
        {featured.map((movie, i) => (
          <button
            key={movie.id}
            onClick={() => goTo(i)}
            className={`relative w-24 h-14 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer ${
              i === currentIndex ? 'ring-2 ring-white opacity-100 scale-105' : 'opacity-30 hover:opacity-60'
            }`}
          >
            <img src={getBackdropUrl(movie.backdrop_path)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;