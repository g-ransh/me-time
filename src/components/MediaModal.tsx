import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, Bookmark, Film, Calendar, Clock, MapPin, Tag } from 'lucide-react';
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

  // Fetch Full Details
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
      } catch (err) {
        console.error("Error fetching media details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedMedia, isModalOpen]);

  // Lock scroll
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
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

  const cast = details?.credits?.cast?.slice(0, 10) || [];
  const director = details?.credits?.crew?.find(c => c.job === 'Director');
  const similar = details?.similar?.results?.slice(0, 12) || [];

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f0f0f] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>

            {/* Backdrop Header */}
            <div className="relative h-[300px] md:h-[450px] w-full flex-shrink-0">
              <img
                src={getBackdropUrl(displayData.backdrop_path)}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{title}</h2>
                <div className="flex items-center gap-4 text-white/70 text-sm font-medium">
                  <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500" /> {displayData.vote_average?.toFixed(1)}</span>
                  <span>{year}</span>
                  {runtime && <span>{runtime}</span>}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => {
                    setPlayerMedia({ id: selectedMedia.id, type: mediaType });
                    setIsPlayerOpen(true);
                  }}
                  className="bg-white text-black px-8 py-3 rounded-md font-semibold text-sm hover:bg-gray-200"
                >
                  Watch Now
                </button>
                <button
                  onClick={() => inWatchlist ? removeFromWatchlist(selectedMedia.id) : addToWatchlist(selectedMedia)}
                  className="bg-white/10 text-white px-8 py-3 rounded-md font-semibold text-sm hover:bg-white/20 border border-white/10"
                >
                  {inWatchlist ? 'Saved to Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-3xl">
                {displayData.overview || 'No description available.'}
              </p>

              {/* Cast Row */}
              {cast.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-white font-semibold mb-4">Cast</h3>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    {cast.map(actor => (
                      <div key={actor.id} className="flex-shrink-0 w-24">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 mb-2">
                           <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-center text-white/80">{actor.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaModal;