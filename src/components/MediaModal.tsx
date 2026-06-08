import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, Bookmark, Film } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getMovieDetails, getTVDetails, getBackdropUrl, getPosterUrl, getTitle, getReleaseYear } from '../lib/tmdb';
import { MovieDetails } from '../types';

const MediaModal: React.FC = () => {
  const {
    isModalOpen, setIsModalOpen,
    selectedMedia, setSelectedMedia,
    addToWatchlist, removeFromWatchlist, isInWatchlist,
    setPlayerMedia, setIsPlayerOpen,
  } = useStore();

  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedMedia || !isModalOpen) return;
    setDetails(null);
    setLoading(true);
    const fetchDetails = async () => {
      try {
        const type = selectedMedia.media_type === 'tv' ? 'tv' : 'movie';
        const data = type === 'tv'
          ? await getTVDetails(selectedMedia.id)
          : await getMovieDetails(selectedMedia.id);
        setDetails(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedMedia, isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  if (!selectedMedia) return null;

  const inWatchlist = isInWatchlist(selectedMedia.id);
  const mediaType = selectedMedia.media_type === 'tv' ? 'tv' : 'movie';
  const displayData = details || selectedMedia;
  const title = getTitle(displayData);
  const year = getReleaseYear(displayData);

  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.number_of_seasons
    ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}`
    : null;

  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const director = details?.credits?.crew?.find(c => c.job === 'Director');
  const similar = details?.similar?.results?.slice(0, 10) || [];

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] liquid-glass-dark rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl shadow-red-900/20"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-30 liquid-glass w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white"
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
            >
              <X size={18} />
            </motion.button>

            <div className="overflow-y-auto max-h-[95vh] md:max-h-[90vh] scrollbar-hide">
              {/* Hero Image */}
              <div className="relative h-[280px] md:h-[380px] w-full flex-shrink-0">
                <img
                  src={getBackdropUrl(displayData.backdrop_path)}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] via-[#0a0505]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0505]/60 to-transparent" />

                {/* Big Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    onClick={() => {
                      setPlayerMedia({ id: selectedMedia.id, type: mediaType });
                      setIsPlayerOpen(true);
                      setIsModalOpen(false);
                    }}
                    className="w-20 h-20 liquid-glass-red rounded-full flex items-center justify-center text-white glow-red"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play size={28} fill="white" className="ml-1" />
                  </motion.button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-3xl md:text-4xl font-black text-shadow mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {title}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 liquid-glass px-3 py-1 rounded-full">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-white/90 text-sm font-semibold">{displayData.vote_average?.toFixed(1)}</span>
                    </div>
                    <span className="liquid-glass text-white/70 text-sm px-3 py-1 rounded-full">{year}</span>
                    {runtime && <span className="liquid-glass text-white/70 text-sm px-3 py-1 rounded-full">{runtime}</span>}
                    {details?.spoken_languages?.[0] && (
                      <span className="liquid-glass text-white/60 text-xs px-2.5 py-1 rounded-full uppercase">
                        {details.spoken_languages[0].iso_639_1}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    onClick={() => {
                      setPlayerMedia({ id: selectedMedia.id, type: mediaType });
                      setIsPlayerOpen(true);
                      setIsModalOpen(false);
                    }}
                    className="btn-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2.5 text-white flex-1 justify-center md:flex-none"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play size={16} fill="white" />
                    Watch Now
                  </motion.button>

                  <motion.button
                    onClick={() => inWatchlist ? removeFromWatchlist(selectedMedia.id) : addToWatchlist(selectedMedia)}
                    className={`liquid-glass px-5 py-3 rounded-full font-medium flex items-center gap-2 ${inWatchlist ? 'text-red-400' : 'text-white'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bookmark size={15} className={inWatchlist ? 'fill-red-400' : ''} />
                    {inWatchlist ? 'Saved' : 'Save'}
                  </motion.button>
                </div>

                {/* Genres */}
                {details?.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((g) => (
                      <span key={g.id} className="liquid-glass px-3.5 py-1.5 rounded-full text-xs font-medium text-white/70">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 rounded-full animate-shimmer" style={{ width: `${90 - i * 10}%` }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 leading-relaxed text-sm md:text-base">
                    {displayData.overview || 'No description available.'}
                  </p>
                )}

                {/* Details Grid */}
                {details && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {director && (
                      <div className="liquid-glass p-4 rounded-3xl">
                        <p className="text-white/30 text-xs mb-1 uppercase tracking-wider">Director</p>
                        <p className="text-white/90 text-sm font-semibold truncate">{director.name}</p>
                      </div>
                    )}
                    {details.status && (
                      <div className="liquid-glass p-4 rounded-3xl">
                        <p className="text-white/30 text-xs mb-1 uppercase tracking-wider">Status</p>
                        <p className="text-white/90 text-sm font-semibold">{details.status}</p>
                      </div>
                    )}
                    {details.original_language && (
                      <div className="liquid-glass p-4 rounded-3xl">
                        <p className="text-white/30 text-xs mb-1 uppercase tracking-wider">Language</p>
                        <p className="text-white/90 text-sm font-semibold uppercase">{details.original_language}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cast */}
                {cast.length > 0 && (
                  <div>
                    <h3 className="text-white/70 text-sm font-semibold mb-3 uppercase tracking-wider">Cast</h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {cast.map((actor) => (
                        <div key={actor.id} className="flex-shrink-0 text-center w-20">
                          <div className="w-20 h-20 rounded-3xl overflow-hidden liquid-glass mb-2">
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                            )}
                          </div>
                          <p className="text-white/70 text-xs font-medium truncate">{actor.name}</p>
                          <p className="text-white/30 text-xs truncate">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar */}
                {similar.length > 0 && (
                  <div>
                    <h3 className="text-white/70 text-sm font-semibold mb-4 uppercase tracking-wider">More Like This</h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {similar.map((movie) => (
                        <div
                          key={movie.id}
                          className="flex-shrink-0 w-32 cursor-pointer group"
                          onClick={() => {
                            setSelectedMedia(movie);
                          }}
                        >
                          <div className="h-44 rounded-3xl overflow-hidden glass-card mb-2">
                            {movie.poster_path ? (
                              <img
                                src={getPosterUrl(movie.poster_path)}
                                alt={getTitle(movie)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film size={20} className="text-white/20" />
                              </div>
                            )}
                          </div>
                          <p className="text-white/60 text-xs truncate">{getTitle(movie)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaModal;
