import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Star, Info } from 'lucide-react';
import { Movie } from '../types';
import { getPosterUrl, getTitle, getReleaseYear } from '../lib/tmdb';
import { useStore } from '../store/useStore';

interface MediaCardProps {
  movie: Movie;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
};

const MediaCard: React.FC<MediaCardProps> = ({ movie, index = 0, size = 'md', showRank = false }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { setSelectedMedia, setIsModalOpen, addToWatchlist, removeFromWatchlist, isInWatchlist, setPlayerMedia, setIsPlayerOpen } = useStore();

  const inWatchlist = isInWatchlist(movie.id);
  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const genre = GENRE_MAP[movie.genre_ids?.[0]];
  const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie';

  const cardWidths = {
    sm: 'w-[140px] md:w-[160px]',
    md: 'w-[160px] md:w-[200px]',
    lg: 'w-[200px] md:w-[240px]',
  };

  const cardHeights = {
    sm: 'h-[200px] md:h-[235px]',
    md: 'h-[235px] md:h-[295px]',
    lg: 'h-[295px] md:h-[355px]',
  };

  return (
    <motion.div
      className={`relative flex-shrink-0 ${cardWidths[size]} group cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.04, zIndex: 20 }}
    >
      {/* Rank Number */}
      {showRank && (
        <div className="absolute -left-3 bottom-0 z-0 text-[80px] font-black text-white/5 leading-none select-none pointer-events-none"
          style={{ fontFamily: 'Outfit, sans-serif', WebkitTextStroke: '1px rgba(255,255,255,0.08)' }}>
          {index + 1}
        </div>
      )}

      {/* Card */}
      <div className={`relative ${cardHeights[size]} rounded-3xl overflow-hidden glass-card`}>
        {/* Poster */}
        {!imgError && movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/5 to-transparent">
            <div className="text-4xl">🎬</div>
            <span className="text-white/30 text-xs text-center px-2">{title}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Actions */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Top Action: Add to List */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie);
            }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full liquid-glass flex items-center justify-center ${
              inWatchlist ? 'text-red-400' : 'text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={14} className={`transition-transform ${inWatchlist ? 'rotate-45' : ''}`} />
          </motion.button>

          {/* Bottom Actions — Spacious */}
          <div className="flex items-stretch gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setPlayerMedia({ id: movie.id, type: mediaType });
                setIsPlayerOpen(true);
              }}
              className="flex-1 btn-primary py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={12} fill="white" />
              <span>Watch</span>
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMedia(movie);
                setIsModalOpen(true);
              }}
              className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-white"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Info size={14} />
            </motion.button>
          </div>
        </motion.div>

        {/* Rating Badge */}
        <div className="absolute top-2 left-2">
          <div className="rating-badge px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Star size={9} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Card Info Below */}
      <div className="mt-2.5 px-0.5">
        <p className="text-white/90 text-sm font-semibold truncate leading-tight">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/40 text-xs">{year}</span>
          {genre && (
            <>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-white/40 text-xs truncate">{genre}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;
