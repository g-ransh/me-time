import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import MediaCard from './MediaCard';

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

  if (!movies || movies.length === 0) return null;

  return (
    <motion.section
      className="relative w-full py-1" // <-- Changed from py-12 md:py-16 to py-1 to remove huge gap
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {/* Row Header - Only render if a title is passed */}
      {title && (
        <div className="flex items-center justify-between px-6 md:px-12 mb-2"> {/* <-- Changed mb-8 to mb-2 */}
          <h2 className="text-lg md:text-[19px] font-semibold text-white/95 tracking-normal">
            {title}
          </h2>
          
          {/* Navigation Arrows - Only visible on row hover */}
          <AnimatePresence>
            {isHovered && (
              <div className="hidden md:flex items-center gap-2">
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    canScrollLeft ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/10 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    canScrollRight ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/10 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={16} />
                </motion.button>
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
          className="flex gap-4 md:gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 py-1" // <-- Tighter row gap
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