import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Movie } from '../types';
import { getBackdropUrl, getTitle } from '../lib/tmdb';
import { useStore } from '../store/useStore';

interface MediaExhibitionDeckProps {
  movie: Movie;
  isActive: boolean;
}

export const MediaExhibitionDeck: React.FC<MediaExhibitionDeckProps> = ({ movie, isActive }) => {
  const { setPlayerMedia, setIsPlayerOpen, setSelectedMedia, setIsModalOpen } = useStore();

  if (!movie) return null;

  return (
    <div 
      className="w-full max-w-[1200px] mx-auto shrink-0 select-none px-4 md:px-0 relative"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <motion.div
        initial={false}
        animate={{ 
          opacity: isActive ? 1 : 0.4, 
          scale: isActive ? 1 : 0.95,
          filter: isActive ? 'blur(0px)' : 'blur(8px)'
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="w-full relative z-10"
      >
        <div 
          className="w-full aspect-[16/9] bg-[#060608] border rounded-3xl overflow-hidden relative group transition-all duration-500 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95)]"
          style={{ 
            borderColor: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.01)'
          }}
        >
          <img 
            src={getBackdropUrl(movie.backdrop_path)} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out z-0"
            style={{ opacity: isActive ? 0.35 : 0.15 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/10 to-transparent z-1" />

          {/* Expanded internal padding for broader layout structure */}
          <motion.div 
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-10 md:p-16 z-10 flex flex-col items-start text-left max-w-3xl"
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          >
            <div className="flex items-center gap-1.5 text-base font-semibold text-amber-400/90 mb-4 font-sans">
              <Star size={16} className="fill-current" />
              <span>{movie.vote_average?.toFixed(1) || 'N/A'} rating</span>
            </div>

            {/* Cinematic Title Focal Point */}
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-[0.88] mb-6 font-sans">
              {getTitle(movie)}
            </h2>

            <p className="text-white/50 text-base font-normal leading-relaxed mb-8 hidden md:block tracking-wide font-sans">
              {movie.overview || 'No additional summary tracks logged for this archival showcase frame.'}
            </p>

            {/* Magnified Larger Action Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setPlayerMedia({ id: movie.id, type: movie.media_type === 'tv' ? 'tv' : 'movie' }); setIsPlayerOpen(true); }} 
                className="px-8 py-4 rounded-full font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer transform active:scale-95 font-sans shadow-xl"
              >
                Play
              </button>
              <button 
                onClick={() => { setSelectedMedia(movie); setIsModalOpen(true); }} 
                className="px-7 py-4 rounded-full font-bold text-sm text-white border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer transform active:scale-95 font-sans"
              >
                Info
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};