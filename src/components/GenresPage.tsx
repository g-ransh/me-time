import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, Genre } from '../types';
import { discoverByGenre, getMovieGenres, getTVGenres } from '../lib/tmdb';
import MediaCard from './MediaCard';

const GenresPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'movie' | 'tv'>('movie');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
        const merged = [...movieGenres.genres];
        tvGenres.genres.forEach(g => {
          if (!merged.find(m => m.name === g.name)) merged.push(g);
        });
        setGenres(merged.slice(0, 19));
      } catch {}
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    setLoading(true);
    setGenreMovies([]);
    const fetchMovies = async () => {
      try {
        const data = await discoverByGenre(selectedGenre.id, mediaFilter);
        setGenreMovies(data.results);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre, mediaFilter]);

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight">Genres</h1>
      </motion.div>

      {/* Genre Pills — Clean, no emojis */}
      <div className="flex flex-wrap gap-2.5 mb-10">
        {genres.map((genre, i) => (
          <motion.button
            key={genre.id}
            onClick={() => setSelectedGenre(prev => prev?.id === genre.id ? null : genre)}
            className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedGenre?.id === genre.id
                ? 'btn-primary text-white'
                : 'liquid-glass text-white/70 hover:text-white'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {genre.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedGenre && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedGenre.name}
              </h2>
              <div className="liquid-glass rounded-full p-1 gap-1 flex">
                {(['movie', 'tv'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setMediaFilter(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      mediaFilter === type ? 'btn-primary text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    {type === 'movie' ? 'Movies' : 'Series'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-72 rounded-3xl animate-shimmer" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {genreMovies.map((movie, i) => (
                  <MediaCard key={movie.id} movie={{ ...movie, media_type: mediaFilter }} index={i} size="md" />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenresPage;
