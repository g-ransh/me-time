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
    if (!isAutoPlaying) return;
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

  return (
    <div className="relative h-screen min-h-[700px] max-h-[920px] w-full overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          <img
            src={getBackdropUrl(current.backdrop_path)}
            alt={getTitle(current)}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-2xl"
          >
            {/* Metadata Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-5"
            >
              <div className="liquid-glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-white/90">{current.vote_average.toFixed(1)}</span>
              </div>
              <div className="liquid-glass px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium text-white/70">{getReleaseYear(current)}</span>
              </div>
              {genres[0] && (
                <div className="liquid-glass px-3 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-white/70">{genres[0]}</span>
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-shadow leading-tight mb-4"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {getTitle(current)}
            </motion.h1>

            {/* Overview */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-base md:text-lg leading-relaxed mb-10 line-clamp-3 text-shadow-sm max-w-xl"
            >
              {current.overview}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <motion.button
                onClick={() => {
                  setPlayerMedia({ id: current.id, type: current.media_type === 'tv' ? 'tv' : 'movie' });
                  setIsPlayerOpen(true);
                }}
                className="btn-primary px-7 py-3.5 rounded-full font-semibold flex items-center gap-2.5 text-white"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={18} fill="white" />
                Watch
              </motion.button>

              <motion.button
                onClick={() => {
                  setSelectedMedia(current);
                  setIsModalOpen(true);
                }}
                className="liquid-glass px-7 py-3.5 rounded-full font-semibold flex items-center gap-2.5 text-white"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Info size={16} />
                Details
              </motion.button>

              <motion.button
                onClick={() => inWatchlist ? useStore.getState().removeFromWatchlist(current.id) : addToWatchlist(current)}
                className={`liquid-glass w-12 h-12 rounded-full flex items-center justify-center ${inWatchlist ? 'text-red-400' : 'text-white'}`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <Plus size={18} className={inWatchlist ? 'rotate-45' : ''} style={{ transition: 'transform 0.3s' }} />
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {featured.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <motion.button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 liquid-glass w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} />
      </motion.button>

      <motion.button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 liquid-glass w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight size={20} />
      </motion.button>

      {/* Thumbnail Preview Strip */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-3">
        {featured.map((movie, i) => (
          <motion.button
            key={movie.id}
            onClick={() => goTo(i)}
            className={`relative w-20 h-12 rounded-2xl overflow-hidden transition-all duration-300 ${
              i === currentIndex ? 'ring-2 ring-red-400 opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
            }`}
            whileHover={{ scale: i === currentIndex ? 1.1 : 1.05 }}
          >
            <img
              src={getBackdropUrl(movie.backdrop_path)}
              alt={getTitle(movie)}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
