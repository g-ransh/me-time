import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import MediaCard from './MediaCard';

const WatchlistPage: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useStore();

  return (
    <div className="min-h-screen pt-28 px-6 md:px-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight">Watchlist</h1>
          <p className="text-white/40 text-sm mt-1">{watchlist.length} saved</p>
        </div>
        {watchlist.length > 0 && (
          <motion.button
            onClick={() => watchlist.forEach(m => removeFromWatchlist(m.id))}
            className="liquid-glass px-4 py-2 rounded-full text-xs text-white/50 hover:text-red-400 flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 size={12} /> Clear all
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {watchlist.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center">
              <Bookmark size={28} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">Nothing saved yet</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {watchlist.map((movie, i) => (
              <MediaCard key={movie.id} movie={movie} index={i} size="md" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchlistPage;