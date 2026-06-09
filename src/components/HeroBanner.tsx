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
            {/* ===== SHUTTLETV STRIP METADATA ===== */}
            <div className="flex items-center gap-3 mb-6 text-sm font-medium tracking-wide text-white">
              {/* Rating */}
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{rating}/10</span>
              </div>

              {/* Year */}
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold">
                <Calendar size={12} className="text-white/60" />
                <span>{getReleaseYear(current)}</span>
              </div>

              {/* Runtime */}
              {runtimeFormatted && (
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold">
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

            {/* ShuttleTV Low-Profile Minimal Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPlayerMedia({ id: current.id, type: current.media_type === 'tv' ? 'tv' : 'movie' });
                  setIsPlayerOpen(true);
                }}
                className="bg-black/50 hover:bg-white text-white hover:text-black border border-white/20 transition-all px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 tracking-wider uppercase"
              >
                <Play size={12} className="fill-current" /> Play
              </button>

              <div className="flex items-center bg-black/50 border border-white/20 rounded-full overflow-hidden p-0.5">
                <button
                  onClick={() => {
                    setSelectedMedia(current);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  title="More Info"
                >
                  <Info size={14} />
                </button>
                <div className="w-px h-3 bg-white/20" />
                <button
                  onClick={handleWatchlistToggle}
                  className={`p-2 transition-colors ${inWatchlist ? 'text-white' : 'text-white/70 hover:text-white'}`}
                  title="Watchlist"
                >
                  {inWatchlist ? <Check size={14} /> : <Plus size={14} />}
                </button>
              </div>
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