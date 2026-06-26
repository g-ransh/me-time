import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import MediaCard from './MediaCard';
import { GlassButton } from './ui/GlassButton';

interface MediaRowProps {
  title: string;
  movies: Movie[];
  cardSize?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
}

const MediaRow: React.FC<MediaRowProps> = ({
  title,
  movies,
  cardSize = 'md',
  showRank = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // High-precision scroll control
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  };

  useEffect(() => {
    handleScroll();
  }, [movies]);

  // Locked style tokens inherited directly from your new embedded Navbar configuration specs
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.1)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  if (!movies || movies.length === 0) return null;

  return (
    <motion.section
      className="relative w-full py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {/* Row Header - Only render if a title is passed */}
      {title && (
        <div className="flex items-center justify-between px-6 md:px-12 mb-2">
          <h2 className="text-lg md:text-[19px] font-semibold text-white/95 tracking-normal">
            {title}
          </h2>
          
          {/* Navigation Arrows - Upgraded to GlassButton primitive structures matching alignment layers */}
          <AnimatePresence>
            {isHovered && (
              <div className="hidden md:flex items-center gap-2">
                <GlassButton
                  variant="icon"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`!w-8 !h-8 !rounded-full flex items-center justify-center transition-all ${
                    canScrollLeft ? 'text-white' : 'text-white/10 opacity-40 !cursor-not-allowed'
                  }`}
                  style={navbarMatchGlassStyle}
                >
                  <ChevronLeft size={16} />
                </GlassButton>
                
                <GlassButton
                  variant="icon"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`!w-8 !h-8 !rounded-full flex items-center justify-center transition-all ${
                    canScrollRight ? 'text-white' : 'text-white/10 opacity-40 !cursor-not-allowed'
                  }`}
                  style={navbarMatchGlassStyle}
                >
                  <ChevronRight size={16} />
                </GlassButton>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Media Carousel */}
      <div className="relative group">
        {/* Edge Fades for seamless integration */}
        <div className={`absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none transition-opacity duration-500 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none transition-opacity duration-500 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 py-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {movies.map((movie, i) => (
            <MediaCard 
              key={movie.id} 
              movie={movie} 
              index={i} 
              size={cardSize} 
              showRank={showRank} 
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default MediaRow;