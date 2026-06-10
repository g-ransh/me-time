import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Star, Video, X } from 'lucide-react';
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

// Mock Collections matching the mockup layout for seasons & tracks
const MOCK_EPISODES = [
  {
    id: 1,
    title: "Step into My Office",
    duration: "45m",
    airDate: "May 25",
    overview: "Ben Reilly, an aging and down-on-his-luck private investigator in 1930s New York, is forced to grapple with his past life as the city's one and only superhero.",
    thumb: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80"
  },
  {
    id: 2,
    title: "Tread Lightly",
    duration: "41m",
    airDate: "May 25",
    overview: "Tread Lightly — and down-on-his-luck private investigator in 1930s New York, is forced to grapple with his past life as and to.",
    thumb: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80"
  }
];

const SEASONS = ["Season 1", "Season 2", "Season 3", "Season 4", "Season 5", "Season 6"];

const MediaCard: React.FC<MediaCardProps> = ({ movie, index = 0, size = 'md', showRank = false }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeSeason, setActiveSeason] = useState("Season 1");
  const [showDetails, setShowDetails] = useState(false);

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
  const genre = GENRE_MAP[movie.genre_ids?.[0]];
  const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie';

  // Sizing scales to maintain perfect aspect ratios
  const cardWidths = {
    sm: 'w-[140px] md:w-[150px]',
    md: 'w-[160px] md:w-[180px]',
    lg: 'w-[200px] md:w-[220px]',
  };

  const cardHeights = {
    sm: 'h-[210px] md:h-[225px]',
    md: 'h-[240px] md:h-[270px]',
    lg: 'h-[300px] md:h-[330px]',
  };

  return (
    <motion.div
      className={`relative shrink-0 ${cardWidths[size]} cursor-pointer`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (mediaType === 'tv') {
          setShowDetails(true);
        } else {
          setSelectedMedia(movie);
          setIsModalOpen(true);
        }
      }}
    >
      {/* Background Rank Marker */}
      {showRank && (
        <div 
          className="absolute -left-6 bottom-8 z-0 text-[100px] font-black text-[#050508] leading-none select-none pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          style={{ fontFamily: 'Outfit, sans-serif', WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}
        >
          {index + 1}
        </div>
      )}

      {/* Main Glass Poster Wrapper */}
      <div 
        className={`relative ${cardHeights[size]} rounded-2xl overflow-hidden transition-all duration-500 z-10 ${
          hovered ? 'scale-[1.02] border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)]' : 'border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
        }`}
        style={{
          backgroundColor: 'rgba(20, 20, 25, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {/* Poster Image */}
        {!imgError && movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-700 ${hovered ? 'scale-105 opacity-50' : 'scale-100 opacity-100'}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#121215]">
            <div className="text-3xl opacity-20">🎬</div>
          </div>
        )}

        {/* Shadow Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-500 pointer-events-none ${hovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start pointer-events-none z-20">
          <div className="bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <Star size={9} className="text-amber-400 fill-amber-400" />
            <span className="text-white text-[10px] font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
          
          {/* Watchlist Quick Access Button */}
          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={(e) => {
                  e.stopPropagation();
                  inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center pointer-events-auto shadow-xl transition-all ${
                  inWatchlist ? 'bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                }`}
              >
                <Plus size={14} className={`transition-transform duration-200 ${inWatchlist ? 'rotate-45' : ''}`} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Centered Play Button Action overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayerMedia({ id: movie.id, type: mediaType });
                  setIsPlayerOpen(true);
                }}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center pointer-events-auto shadow-2xl hover:scale-110 transition-transform active:scale-95"
              >
                <Play size={20} className="fill-black text-black ml-0.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title Meta block */}
      <div className="mt-2.5 px-0.5">
        <p className="text-[13px] font-semibold truncate text-white/90 group-hover:text-white transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 text-white/45 text-[11px] font-medium">
          <span>{year}</span>
          {genre && (
            <>
              <span>•</span>
              <span className="truncate">{genre}</span>
            </>
          )}
          <span className="ml-auto px-1 rounded bg-white/5 border border-white/5 text-[9px] font-bold tracking-wider text-white/40 uppercase">
            {mediaType === 'tv' ? 'TV' : 'HD'}
          </span>
        </div>
      </div>

      {/* ── Premium ShuttleTV Expanded Detail Section (Conditional Sheet Injection via Portal) ── */}
      <AnimatePresence>
        {showDetails && mediaType === 'tv' && createPortal(
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/85 backdrop-blur-md overflow-y-auto" 
            onClick={() => setShowDetails(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#070709] p-6 md:p-8 shadow-2xl text-left mx-auto my-auto max-h-[92vh] overflow-y-auto"
              style={{
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.9), inset 0 1px 0 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Close Button Pin */}
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs cursor-pointer transition-colors z-50"
              >
                <X size={14} />
              </button>

              {/* Main Details Grid Layout */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
                <div className="w-full md:w-56 aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-white/5 shrink-0 shadow-lg">
                  <img src={getPosterUrl(movie.poster_path)} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-[32px] font-black text-white mb-2 tracking-tight">“{title}”</h2>
                  
                  {/* Meta Labels Ribbon */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-bold tracking-wide">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">★ {movie.vote_average.toFixed(1)}/10</span>
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/60">{year}</span>
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/60">1 Season</span>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase">TV-14</span>
                    {genre && <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/60">{genre}</span>}
                  </div>

                  <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-6 max-w-3xl">{movie.overview}</p>

                  {/* Operational Interactive Action Bar */}
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => { setPlayerMedia({ id: movie.id, type: 'tv' }); setIsPlayerOpen(true); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
                    >
                      <Play size={13} className="fill-black text-black" />
                      <span>Play S1 E1</span>
                    </button>
                    <button 
                      onClick={() => { setPlayerMedia({ id: movie.id, type: 'tv' }); setIsPlayerOpen(true); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                    >
                      <Video size={13} className="text-white/70" />
                      <span>Trailer</span>
                    </button>
                    <button 
                      onClick={() => inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white text-sm transition-colors cursor-pointer"
                    >
                      {inWatchlist ? '✕' : '+'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Seasons Tab Strip Row ── */}
              <div className="mt-6 border-t border-white/5 pt-5">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {SEASONS.map((season) => (
                    <button
                      key={season}
                      onClick={() => setActiveSeason(season)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                        activeSeason === season 
                          ? 'bg-white/10 border-white/20 text-white shadow-md' 
                          : 'bg-transparent border-transparent text-white/35 hover:text-white/70'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Full Interactive Episode Track Grid ── */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3.5 pl-0.5">
                  <h3 className="text-sm font-bold text-white/90 tracking-wide">Episodes</h3>
                </div>
                
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-hide">
                  {MOCK_EPISODES.map((ep, idx) => (
                    <div 
                      key={ep.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-3.5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group/ep"
                    >
                      {/* Dynamic Track Order Count */}
                      <span className="text-xs font-bold text-white/20 w-4 pl-0.5 text-center shrink-0">{idx + 1}</span>
                      
                      {/* Image Preview Window */}
                      <div className="w-full sm:w-36 aspect-video rounded-xl overflow-hidden border border-white/5 bg-white/5 shrink-0 relative shadow-inner">
                        <img src={ep.thumb} alt="" className="w-full h-full object-cover opacity-65 group-hover/ep:opacity-85 transition-opacity" />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>

                      {/* Episode Metadata Context tracking */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-4 mb-0.5">
                          <h4 className="text-xs md:text-sm font-bold text-white/95 truncate group-hover/ep:text-white transition-colors">{ep.title}</h4>
                          <span className="text-[10px] font-bold text-white/40 whitespace-nowrap">{ep.duration}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-white/30 block mb-1.5">{ep.airDate}</span>
                        <p className="text-[11px] md:text-xs text-white/50 leading-relaxed line-clamp-2 md:line-clamp-1">{ep.overview}</p>
                      </div>
                    </div>
                  ))}
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