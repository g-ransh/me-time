import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Star, Check, Clock, MessageCircle, Calendar } from 'lucide-react';
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
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
};

// Helper to format runtime (minutes -> "1h 48m")
const formatRuntime = (minutes?: number) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const HeroBanner: React.FC<HeroBannerProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { 
    setSelectedMedia, 
    setIsModalOpen, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist, 
    setPlayerMedia, 
    setIsPlayerOpen 
  } = useStore();

  const featured = movies.slice(0, 5);
  const current = featured[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying || !featured.length) return;
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

  if (!current) return null;

  const genres = current.genre_ids?.slice(0, 3).map((id) => GENRE_MAP[id]).filter(Boolean) || [];
  const inWatchlist = isInWatchlist(current.id);
  const rating = current.vote_average ? current.vote_average.toFixed(1) : 'N/A';
  const voteCount = current.vote_count ? current.vote_count.toLocaleString() : '0';
  const runtimeFormatted = formatRuntime(current.runtime); // runtime might be missing in list endpoints

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(current.id);
    } else {
      addToWatchlist(current);
    }
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden select-none bg-black">
      {/* Background Images with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <img
            src={getBackdropUrl(current.backdrop_path)}
            alt={getTitle(current)}
            className="w-full h-full object-cover object-center"
          />
          {/* Premium Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto flex flex-col justify-end pb-24 px-8 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl"
          >
            {/* Strip Metadata */}
            <div className="flex items-center gap-3 mb-6 text-sm font-medium tracking-wide text-white">
              {/* Rating */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>{rating}/10</span>
              </div>

              {/* Year */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                <Calendar size={11} className="text-white/50" />
                <span>{getReleaseYear(current)}</span>
              </div>

              {/* Runtime */}
              {runtimeFormatted && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  <span>{runtimeFormatted}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-5 uppercase">
              {getTitle(current)}
            </h1>

            {/* Synopsis */}
            <p className="text-white/70 text-base md:text-lg line-clamp-3 mb-6 max-w-xl">
              {current.overview}
            </p>

            {/* ShuttleTV Premium Liquid Glass Action Controls */}
            <div className="flex items-center gap-3 relative z-30">
              {/* Primary Play Button */}
              <button
                onClick={() => {
                  setPlayerMedia({ id: current.id, type: current.media_type === 'tv' ? 'tv' : 'movie' });
                  setIsPlayerOpen(true);
                }}
                className="px-7 py-3 rounded-full font-bold text-xs tracking-wider uppercase flex items-center gap-2 text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer transform active:scale-95 shadow-lg"
              >
                <Play size={12} className="fill-current text-black" />
                <span>Play</span>
              </button>

              {/* Scaled-Up Glassmorphic Info/Details Button */}
              <button
                onClick={() => {
                  setSelectedMedia(current);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 rounded-full font-bold text-xs tracking-wider uppercase flex items-center gap-2 text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer transform active:scale-95 shadow-md"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  backdropFilter: 'blur(16px)', 
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <Info size={13} className="text-white/70" />
                <span>More Info</span>
              </button>

              {/* Standalone Balanced Watchlist Button */}
              <button
                onClick={handleWatchlistToggle}
                className="w-[42px] h-[42px] rounded-full border border-white/10 flex items-center justify-center transition-all cursor-pointer transform active:scale-95 shadow-md group"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  backdropFilter: 'blur(16px)', 
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.1)'
                }}
                title="Watchlist"
              >
                {inWatchlist ? (
                  <Check size={16} className="text-amber-400" />
                ) : (
                  <Plus size={16} className="text-white/60 group-hover:text-white transition-colors" />
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Centered Pagination Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? 'w-6 h-1.5 bg-white' 
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;