import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { Movie, Genre } from '../types';
import { discoverByGenre, getMovieGenres, getTVGenres } from '../lib/tmdb';
import MediaCard from './MediaCard';
import { GlassButton } from './ui/GlassButton';

const sortingOptions = ['Most Popular', 'Top Rated', 'Newest Releases'];

const GenresPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Custom Interactive States
  const [mediaFilter, setMediaFilter] = useState<'movie' | 'tv'>('movie');
  const [selectedSort, setSelectedSort] = useState('Most Popular');

  // Active Dropdown Tracker
  const [activeDropdown, setActiveDropdown] = useState<'genre' | 'sort' | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
        const merged = [...movieGenres.genres];
        tvGenres.genres.forEach(g => {
          if (!merged.find(m => m.name === g.name)) merged.push(g);
        });
        setGenres(merged.slice(0, 15));
        if (merged.length > 0) setSelectedGenre(merged[0]);
      } catch {}
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    setLoading(true);
    const fetchMovies = async () => {
      try {
        const data = await discoverByGenre(selectedGenre.id, mediaFilter);
        let results = data.results || [];
        
        // Handle client-side sorting simulations so selections actually change content rows
        if (selectedSort === 'Top Rated') {
          results = [...results].sort((a, b) => b.vote_average - a.vote_average);
        } else if (selectedSort === 'Newest Releases') {
          results = [...results].sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
            const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
            return dateB - dateA;
          });
        }
        
        setGenreMovies(results);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre, mediaFilter, selectedSort]);

  // ── Golden Ratio Proportion Matrix (Base Scale Anchor = 16px) ──
  const scale = {
    cardGapX: '1.03rem',     // ~16.5px 
    cardGapY: '1.618rem',    // ~26px
    padX: '2.618rem',        // ~42px
    padY: '4.236rem',        // ~68px
    topSpaced: '8.472rem',  // ~135px
    maxBoundary: '104.9rem' // ~1678px
  };

  const globalDropdownGlassClass = "absolute top-full mt-[0.618rem] rounded-[0.618rem] p-[0.618rem] z-50 overflow-hidden";
  
  // Directly copied from the movies/series page token definitions (5% alpha dark overlay setup)
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.05)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  return (
    <div 
      className="min-h-screen relative text-white select-none mx-auto"
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        maxWidth: scale.maxBoundary,
        paddingTop: scale.topSpaced,
        paddingLeft: scale.padX,
        paddingRight: scale.padX,
        paddingBottom: scale.padY,
      }}
    >
      {/* Click-away layer to safely close open boxes */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveDropdown(null)} />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-[2.618rem] relative z-50">
        <h1 
          className="text-4xl md:text-[44px] font-bold tracking-tight text-white/95"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          Discover
        </h1>
        
        {/* Inline Selection Panel */}
        <div 
          className="flex items-center p-[0.382rem] rounded-xl w-fit" 
          style={{
            ...navbarMatchGlassStyle,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {(['movie', 'tv'] as const).map((type) => {
            const isSelected = mediaFilter === type;
            return (
              <GlassButton
                key={type}
                variant="text"
                onClick={() => setMediaFilter(type)}
                className={`!rounded-lg text-xs font-bold transition-all duration-200`}
                style={{ 
                  padding: '0.618rem 1.618rem',
                  backgroundColor: isSelected ? 'rgba(10, 10, 12, 0.55)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                  boxShadow: isSelected ? '0 2px 10px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(0,0,0,0.5)' : 'none',
                  border: 'none'
                }}
              >
                {type === 'movie' ? 'Movies' : 'Series'}
              </GlassButton>
            );
          })}
        </div>
      </div>

      {/* ── Liquid Glass Filter Hub ── */}
      <div className="flex flex-wrap items-center gap-[0.618rem] mb-[2.618rem] relative z-40">
        
        {/* Genre Selector */}
        <div className="relative">
          <GlassButton 
            variant="text"
            onClick={() => setActiveDropdown(activeDropdown === 'genre' ? null : 'genre')}
            className="flex items-center text-xs font-bold !rounded-[0.618rem] text-white"
            style={{ padding: '0.618rem 1.618rem', ...navbarMatchGlassStyle }}
          >
            <span>{selectedGenre?.name || 'Genres'}</span>
            <ChevronDown size={12} className="opacity-40 ml-[0.382rem]" />
          </GlassButton>
          <AnimatePresence>
            {activeDropdown === 'genre' && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 4 }} 
                className={`${globalDropdownGlassClass} left-0 w-[11.18rem] max-h-[16.18rem] overflow-y-auto scrollbar-hide`}
                style={navbarMatchGlassStyle}
              >
                <div className="flex flex-col gap-0.5">
                  {genres.map(g => {
                    const isActive = selectedGenre?.id === g.id;
                    return (
                      <GlassButton 
                        key={g.id} 
                        variant="text"
                        onClick={() => { setSelectedGenre(g); setActiveDropdown(null); }} 
                        className={`w-full justify-between items-center !rounded-[0.382rem] text-xs font-bold !bg-transparent transition-all duration-200 ${isActive ? '!text-white !bg-[#0a0a0c]/40' : '!text-white/50'} hover:!bg-[#0a0a0c]/40 hover:!text-white`}
                        style={{ padding: '0.382rem 0.618rem', boxShadow: 'none', border: 'none' }}
                      >
                        <span>{g.name}</span>
                        {isActive && <Check size={12} />}
                      </GlassButton>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sorting Selector */}
        <div className="relative">
          <GlassButton 
            variant="text"
            onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')} 
            className="flex items-center text-xs font-bold !rounded-[0.618rem]"
            style={{ padding: '0.618rem 1.618rem', ...navbarMatchGlassStyle }}
          >
            <span className={selectedSort !== 'Most Popular' ? 'text-white/90' : 'text-white/45'}>{selectedSort}</span>
            <ChevronDown size={12} className="opacity-30 ml-[0.382rem]" />
          </GlassButton>
          <AnimatePresence>
            {activeDropdown === 'sort' && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 4 }} 
                className={`${globalDropdownGlassClass} left-0 w-[12.36rem]`}
                style={navbarMatchGlassStyle}
              >
                <div className="flex flex-col gap-0.5">
                  {sortingOptions.map(o => {
                    const isActive = selectedSort === o;
                    return (
                      <GlassButton 
                        key={o} 
                        variant="text"
                        onClick={() => { setSelectedSort(o); setActiveDropdown(null); }} 
                        className={`w-full justify-between items-center !rounded-[0.382rem] text-xs font-bold !bg-transparent transition-all duration-200 ${isActive ? '!text-white !bg-[#0a0a0c]/40' : '!text-white/50'} hover:!bg-[#0a0a0c]/40 hover:!text-white`}
                        style={{ padding: '0.382rem 0.618rem', boxShadow: 'none', border: 'none' }}
                      >
                        <span>{o}</span>
                        {isActive && <Check size={12} />}
                      </GlassButton>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Catalog Results Canvas ── */}
      <div className="relative z-10">
        {loading ? (
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            style={{ columnGap: scale.cardGapX, rowGap: scale.cardGapY }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] rounded-[1.03rem] animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }} />
            ))}
          </div>
        ) : (
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            style={{ columnGap: scale.cardGapX, rowGap: scale.cardGapY }}
          >
            {genreMovies.map((movie, i) => (
              <MediaCard key={movie.id} movie={{ ...movie, media_type: mediaFilter }} index={i} size="lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenresPage;