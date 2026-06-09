import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MoviesPage from './components/MoviesPage';
import SeriesPage from './components/SeriesPage';
import SearchPage from './components/SearchPage';
import GenresPage from './components/GenresPage';
import MediaModal from './components/MediaModal';
import VideoPlayer from './components/VideoPlayer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { activeTab } = useStore();

  const pages = {
    home: <HomePage />,
    movies: <MoviesPage />,
    series: <SeriesPage />,
    search: <SearchPage />,
    genres: <GenresPage />,
  };

  return (
    <div
      className="relative min-h-screen text-white"
      style={{ fontFamily: 'Outfit, Inter, sans-serif', background: '#0a0a0a' }}
    >
      {/* ── Ambient Glow — Warm Amber (ShuttleTV style) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top-left amber blob */}
        <div
          className="absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(180,90,0,0.18) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '14s',
          }}
        />
        {/* Mid-right warm glow */}
        <div
          className="absolute top-1/4 -right-60 w-[700px] h-[700px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(150,70,0,0.12) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDuration: '18s',
            animationDelay: '-6s',
          }}
        />
        {/* Bottom subtle warm */}
        <div
          className="absolute -bottom-60 left-1/3 w-[700px] h-[700px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(120,55,0,0.10) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDuration: '20s',
            animationDelay: '-10s',
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          {pages[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* Global Overlays */}
      <MediaModal />
      <VideoPlayer />

      {/* Bottom accent line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px opacity-30"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }}
      />
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;