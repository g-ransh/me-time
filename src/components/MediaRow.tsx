import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
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

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <motion.section
      className="relative py-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-10 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`liquid-glass w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft ? 'text-white hover:text-red-300' : 'text-white/20 cursor-not-allowed'
            }`}
            whileHover={canScrollLeft ? { scale: 1.08 } : {}}
            whileTap={canScrollLeft ? { scale: 0.92 } : {}}
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`liquid-glass w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              canScrollRight ? 'text-white hover:text-red-300' : 'text-white/20 cursor-not-allowed'
            }`}
            whileHover={canScrollRight ? { scale: 1.08 } : {}}
            whileTap={canScrollRight ? { scale: 0.92 } : {}}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative">
        {/* Left fade */}
        <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050508] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        {/* Right fade */}
        <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050508] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-10 pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {movies.map((movie, i) => (
            <div key={movie.id} style={{ scrollSnapAlign: 'start' }}>
              <MediaCard movie={movie} index={i} size={cardSize} showRank={showRank} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default MediaRow;
