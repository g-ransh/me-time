import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MoviesPage from './components/MoviesPage';
import SeriesPage from './components/SeriesPage';
import SearchPage from './components/SearchPage';
import GenresPage from './components/GenresPage';
import WatchlistPage from './components/WatchlistPage';
import MediaModal from './components/MediaModal';
import VideoPlayer from './components/VideoPlayer';
import Toast from './components/Toast';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

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

  // ── OPTIMIZATION: DNS PREFETCH & PRECONNECT ENGINES ──
  // Quietly establishes early infrastructure handshakes with upstream player CDNs
  useEffect(() => {
    const domains = [
      'https://vidsrc.to',
      'https://vidsrc.me',
      'https://vidsrc.xyz',
      'https://vidsrc.pm'
    ];

    domains.forEach(domain => {
      // Create and mount preconnect tags to warm up TCP/TLS sockets
      if (!document.querySelector(`link[href="${domain}"][rel="preconnect"]`)) {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = domain;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      }
      
      // Create and mount dns-prefetch fallback tags
      if (!document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`)) {
        const prefetch = document.createElement('link');
        prefetch.rel = 'dns-prefetch';
        prefetch.href = domain;
        document.head.appendChild(prefetch);
      }
    });
  }, []);

  const pages: Record<string, React.ReactElement> = {
    home: <HomePage />,
    movies: <MoviesPage />,
    series: <SeriesPage />,
    search: <SearchPage />,
    genres: <GenresPage />,
    watchlist: <WatchlistPage />,
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-white" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[140px] animate-float" style={{ animationDuration: '12s' }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-[120px] animate-float" style={{ animationDuration: '15s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[140px] animate-float" style={{ animationDuration: '18s' }} />
      </div>

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {pages[activeTab]}
        </motion.div>
      </AnimatePresence>

      <Footer />

      {/* Global Overlays */}
      <MediaModal />
      <VideoPlayer />
      <Toast />
      <BackToTop />

      {/* Bottom accent */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-400 opacity-40" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;