import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, X, Film, Plus, Check, Sparkles, Layers, Info } from 'lucide-react';
import { Movie } from '../types';
import { getPosterUrl, getBackdropUrl, getTitle, getReleaseYear } from '../lib/tmdb';
import { useStore } from '../store/useStore';
import { GlassButton } from './ui/GlassButton';

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

const MOCK_EPISODES = [
  {
    id: 1,
    title: "Episode 1",
    duration: "64m",
    airDate: "June 2026",
    overview: "When institutional respect completely breaks down inside the campus corridors, an unconventional squad of specialized inspectors arrives to balance the scales with non-nonsense rules.",
    thumb: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80"
  },
  {
    id: 2,
    title: "Episode 2",
    duration: "58m",
    airDate: "June 2026",
    overview: "Tensions mount across departmental channels as strict structural audits force administrative staff to re-evaluate local protocol baselines.",
    thumb: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80"
  }
];

const SEASONS = ["Season 1", "Season 2"];

export const MediaCardSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const widths = { sm: 'w-[140px] md:w-[150px]', md: 'w-[160px] md:w-[180px]', lg: 'w-[200px] md:w-[220px]' };
  return (
    <div className={`shrink-0 ${widths[size]} aspect-2/3 rounded-2xl bg-[#141416] border border-white/5 animate-pulse`} />
  );
};

export const MediaCard: React.FC<MediaCardProps> = ({ movie, index = 0, size = 'md', showRank = false }) => {
  const [activeSeason, setActiveSeason] = useState("Season 1");
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { 
    setSelectedMedia, 
    setIsModalOpen, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist, 
    setPlayerMedia, 
    setIsPlayerOpen 
  } = useStore();

  const inWatchlist = isInWatchlist(movie.id);
  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const genre = GENRE_MAP[movie.genre_ids?.[0]] || 'Entertainment';
  const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie';

  const cardWidths = { sm: 'w-[140px] md:w-[150px]', md: 'w-[160px] md:w-[180px]', lg: 'w-[200px] md:w-[220px]' };

  // System glass configuration metrics
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.1)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  const handleInfoAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMedia(movie);
    setIsModalOpen(true);
  };

  const handleWatchlistAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <motion.div
      className={`relative shrink-0 ${cardWidths[size]} select-none cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleInfoAction}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Background Rank Vector Mask Indicator */}
      {showRank && (
        <div 
          className="absolute -left-5 bottom-6 z-0 text-[90px] font-black text-black/40 leading-none select-none pointer-events-none tracking-tighter font-sans"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
        >
          {index + 1}
        </div>
      )}

      {/* Primary Poster Card Asset Frame Layout */}
      <div className="relative aspect-2/3 w-full rounded-2xl overflow-hidden border border-white/5 z-10 bg-[#070709]">
        {!imgError && movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[#141416] animate-pulse" />
        )}

        {/* Permanent Micro Brownian Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 z-20 pointer-events-none" />

        {/* ── Dynamic Hover Functional Controls Sub-Overlay System ── */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-30 pointer-events-none"
            >
              {/* Top Left Glassmorphed Ratings Pill */}
              {movie.vote_average > 0 && (
                <div className="pointer-events-auto">
                  <GlassButton
                    variant="text"
                    className="absolute top-2.5 left-2.5 !h-6 !px-2 !rounded-full text-[11px] font-bold text-amber-400 pointer-events-none flex items-center justify-center"
                    style={navbarMatchGlassStyle}
                  >
                    <Star size={10} className="fill-current text-amber-400 mr-1 shrink-0" />
                    <span className="leading-none mt-[0.5px]">{movie.vote_average.toFixed(1)}</span>
                  </GlassButton>
                </div>
              )}

              {/* Plus Icon Watchlist Trigger Button */}
              <div className="pointer-events-auto">
                <GlassButton
                  variant="icon"
                  onClick={handleWatchlistAction}
                  className="absolute top-2.5 right-2.5 !w-8 !h-8 !rounded-full text-white/80 hover:text-white flex items-center justify-center"
                  style={navbarMatchGlassStyle}
                >
                  {inWatchlist ? <Check size={14} className="text-green-400" /> : <Plus size={14} />}
                </GlassButton>
              </div>

              {/* Text Layout Overlay */}
              <motion.div 
                initial={{ y: 4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 4, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-3.5 left-3.5 right-3.5 text-left flex flex-col gap-0.5 pointer-events-none"
              >
                <h3 className="text-xs md:text-sm font-bold text-white leading-snug tracking-wide truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {title}
                </h3>
                <span className="text-[10px] font-medium text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {year} • {genre}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PORTAL INJECTION EXPANDED SHEET MODULE GRID ── */}
      <AnimatePresence>
        {showDetails && mediaType === 'tv' && createPortal(
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-xl overflow-y-auto"
            onClick={() => setShowDetails(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[4xl] rounded-3xl overflow-hidden bg-[#0a0a0c] text-left mx-auto my-auto max-h-[92vh] flex flex-col justify-start border border-white/5 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.95)]"
            >
              
              {/* Cinematic Billboard Banner Header Showcase Area */}
              <div className="relative w-full aspect-[16/9] md:aspect-[21/10] bg-zinc-900 shrink-0 border-b border-white/5">
                <img 
                  src={getBackdropUrl(movie.backdrop_path || movie.poster_path)} 
                  alt="" 
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/60 via-transparent to-transparent" />

                {/* Securely Anchored Fixed Upper Right Close/Exit Trigger Button */}
                <GlassButton 
                  variant="icon"
                  onClick={() => setShowDetails(false)}
                  className="absolute top-6 right-6 !w-9 !h-9 !rounded-md text-white z-50 flex items-center justify-center"
                  style={navbarMatchGlassStyle}
                >
                  <X size={15} />
                </GlassButton>

                {/* Foreground Text Layer Overlays */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col justify-end text-left items-start">
                  <h2 className="text-3xl md:text-[42px] font-black text-white tracking-tight leading-none uppercase mb-5 font-sans">
                    {title}
                  </h2> 

                  {/* Glass Transparent Blurred Badge Pills row */}
                  <div className="flex flex-wrap items-center gap-2 mb-5 font-sans">
                    <GlassButton variant="text" className="!h-7 !px-2.5 !rounded-md text-xs font-bold text-amber-400 pointer-events-none flex items-center justify-center" style={navbarMatchGlassStyle}>
                      <Star size={10} className="fill-current text-amber-400 mr-1" />
                      <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</span>
                    </GlassButton>
                    <GlassButton variant="text" className="!h-7 !px-2.5 !rounded-md text-xs font-bold text-white/70 pointer-events-none flex items-center justify-center" style={navbarMatchGlassStyle}>
                      {year}
                    </GlassButton>
                    <GlassButton variant="text" className="!h-7 !px-2.5 !rounded-md text-xs font-bold text-white/70 pointer-events-none flex items-center justify-center" style={navbarMatchGlassStyle}>
                      1 Season
                    </GlassButton>
                    <div className="h-7 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 rounded-md text-[10px] font-black tracking-wider flex items-center uppercase">
                      TV-MA
                    </div>
                    <GlassButton variant="text" className="!h-7 !px-2.5 !rounded-md text-xs font-bold text-white/50 pointer-events-none flex items-center justify-center" style={navbarMatchGlassStyle}>
                      {genre}
                    </GlassButton>
                    <GlassButton variant="text" className="!h-7 !px-2.5 !rounded-md text-xs font-bold text-white/50 pointer-events-none flex items-center justify-center" style={navbarMatchGlassStyle}>
                      Drama
                    </GlassButton>
                  </div>

                  {/* Action Layout Matrix */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setPlayerMedia({ id: movie.id, type: 'tv', movie }); setIsPlayerOpen(true); setShowDetails(false); }}
                      className="flex items-center justify-center gap-2 px-5 h-9 rounded-md text-xs font-black bg-white text-black cursor-pointer shadow-md transition-colors hover:bg-neutral-200"
                    >
                      <Play size={12} className="fill-black text-black" />
                      <span>Play S1 E1</span>
                    </button>
                    <GlassButton 
                      variant="text"
                      onClick={() => { setPlayerMedia({ id: movie.id, type: 'tv', movie }); setIsPlayerOpen(true); setShowDetails(false); }}
                      className="!h-9 !px-4 !rounded-md text-xs font-bold flex items-center justify-center"
                      style={navbarMatchGlassStyle}
                    >
                      <span>Trailer</span>
                    </GlassButton>
                    <GlassButton 
                      variant="icon"
                      onClick={handleWatchlistAction}
                      className="!w-9 !h-9 !rounded-md text-xs font-bold flex items-center justify-center"
                      style={navbarMatchGlassStyle}
                    >
                      <span>{inWatchlist ? '✕' : '+'}</span>
                    </GlassButton>
                  </div>
                </div>
              </div>

              {/* Lower Section Panels */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 font-sans">
                
                <p className="text-white/50 text-sm leading-relaxed max-w-3xl text-left font-normal">
                  {movie.overview || 'No presentation logging cataloged for this specific archival showcase frame.'}
                </p>

                {/* Technical System Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                    <Sparkles size={14} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Engine Class</p>
                      <p className="text-white/90 text-xs font-bold truncate">Premium</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                    <Layers size={14} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Stream Protocol</p>
                      <p className="text-white/90 text-xs font-bold truncate">HLS Fluid</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                    <Info size={14} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Index Cache</p>
                      <p className="text-white/90 text-xs font-bold truncate">Memory Valid</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                    <Film size={14} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">Channel Mapping</p>
                      <p className="text-white/90 text-xs font-bold truncate">Active Feed</p>
                    </div>
                  </div>
                </div>

                {/* Seasons Switcher */}
                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center justify-between mb-4 pl-0.5">
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">Episodes</h3>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-white/5 mb-4">
                    {SEASONS.map((season) => (
                      <GlassButton
                        key={season}
                        variant="text"
                        onClick={() => setActiveSeason(season)}
                        className={`!px-4 !py-1.5 !h-8 !rounded-md text-xs font-bold whitespace-nowrap flex items-center justify-center`}
                        style={{
                          ...navbarMatchGlassStyle,
                          backgroundColor: activeSeason === season ? 'rgba(255,255,255,0.05)' : 'transparent',
                          color: activeSeason === season ? '#ffffff' : 'rgba(255,255,255,0.3)'
                        }}
                      >
                        {season}
                      </GlassButton>
                    ))}
                  </div>

                  {/* Episode List */}
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                    {MOCK_EPISODES.map((ep, idx) => (
                      <div 
                        key={ep.id} 
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-3.5 rounded-xl border border-white/5 bg-white/[0.01] text-left"
                      >
                        <span className="text-xs font-black text-white/20 w-4 text-center shrink-0">{idx + 1}</span>
                        
                        <div className="w-full sm:w-32 aspect-video rounded-lg overflow-hidden border border-white/5 bg-white/5 shrink-0 relative shadow-md">
                          <img src={ep.thumb} alt="" className="w-full h-full object-cover opacity-70" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <h4 className="text-xs md:text-sm font-bold text-white/95 truncate">{ep.title}</h4>
                            <span className="text-[10px] font-bold text-white/40">{ep.duration}</span>
                          </div>
                          <p className="text-[11px] md:text-xs text-white/40 leading-relaxed line-clamp-2">{ep.overview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaCard;