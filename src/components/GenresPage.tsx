import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Check } from 'lucide-react';
import { Movie, Genre } from '../types';
import { discoverByGenre, getMovieGenres, getTVGenres } from '../lib/tmdb';
import MediaCard from './MediaCard';

const platforms = ['Netflix', 'Prime Video', 'Disney+', 'Max', 'Hulu', 'Apple TV+', 'Paramount+'];
const sortingOptions = ['Most Popular', 'Top Rated', 'Newest Releases'];

const GenresPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Custom Interactive States
  const [mediaFilter, setMediaFilter] = useState<'movie' | 'tv'>('movie');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedSort, setSelectedSort] = useState('Most Popular');

  // Active Dropdown Tracker
  const [activeDropdown, setActiveDropdown] = useState<'genre' | 'media' | 'provider' | 'sort' | null>(null);

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

  return (
    <div 
      className="min-h-screen pt-32 px-6 md:px-12 pb-24 max-w-[1600px] mx-auto text-white select-none relative"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Click-away layer to safely close open boxes */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveDropdown(null)} />
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-8 relative z-50">
        <h1 className="text-4xl md:text-[44px] font-extrabold tracking-tight text-white/95">
          Discover
        </h1>
        
        {/* Right Filtering Dock */}
        <div className="flex items-center gap-3">
          {/* Custom Format Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'media' ? null : 'media')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <span>{mediaFilter === 'movie' ? 'Movies' : 'Series'}</span>
              <ChevronDown size={14} className="opacity-60" />
            </button>
            <AnimatePresence>
              {activeDropdown === 'media' && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 top-full mt-2 bg-[#0e0e11]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 w-36">
                  {(['movie', 'tv'] as const).map(type => (
                    <button key={type} onClick={() => { setMediaFilter(type); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex justify-between items-center ${mediaFilter === type ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                      <span>{type === 'movie' ? 'Movies' : 'Series'}</span>
                      {mediaFilter === type && <Check size={12} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Liquid Glass Filter Hub ── */}
      <div className="flex flex-wrap items-center gap-3 mb-10 relative z-40">
        
        {/* Genre Selector */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'genre' ? null : 'genre')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>{selectedGenre?.name || 'Genres'}</span>
            <ChevronDown size={12} className="opacity-40" />
          </button>
          <AnimatePresence>
            {activeDropdown === 'genre' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute left-0 top-full mt-2 bg-[#0e0e11]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 w-44 max-h-64 overflow-y-auto scrollbar-hide">
                {genres.map(g => (
                  <button key={g.id} onClick={() => { setSelectedGenre(g); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex justify-between items-center ${selectedGenre?.id === g.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>
                    <span>{g.name}</span>
                    {selectedGenre?.id === g.id && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Providers Custom Overlay Box */}
        <div className="relative">
          <button onClick={() => setActiveDropdown(activeDropdown === 'provider' ? null : 'provider')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/45 hover:text-white/80 bg-white/2 border border-white/5 flex items-center gap-2 cursor-pointer transition-all">
            <span className={selectedProvider !== 'All Providers' ? 'text-white/90' : ''}>{selectedProvider}</span>
            <ChevronDown size={12} className="opacity-30" />
          </button>
          <AnimatePresence>
            {activeDropdown === 'provider' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute left-0 top-full mt-2 bg-[#0e0e11]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 w-48 max-h-60 overflow-y-auto scrollbar-hide">
                <button onClick={() => { setSelectedProvider('All Providers'); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/5 rounded-lg">All Providers</button>
                {platforms.map(p => (
                  <button key={p} onClick={() => { setSelectedProvider(p); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex justify-between items-center ${selectedProvider === p ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>
                    <span>{p}</span>
                    {selectedProvider === p && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sorting Custom Overlay Box */}
        <div className="relative">
          <button onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/45 hover:text-white/80 bg-white/2 border border-white/5 flex items-center gap-2 cursor-pointer transition-all">
            <span className={selectedSort !== 'Most Popular' ? 'text-white/90' : ''}>{selectedSort}</span>
            <ChevronDown size={12} className="opacity-30" />
          </button>
          <AnimatePresence>
            {activeDropdown === 'sort' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute left-0 top-full mt-2 bg-[#0e0e11]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 w-48">
                {sortingOptions.map(o => (
                  <button key={o} onClick={() => { setSelectedSort(o); setActiveDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex justify-between items-center ${selectedSort === o ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>
                    <span>{o}</span>
                    {selectedSort === o && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Catalog Results Canvas ── */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full aspect-2/3 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
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