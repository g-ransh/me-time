import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SkipForward, SkipBack, RefreshCw, Radio,
  Zap, ChevronDown, ChevronUp, Maximize, Minimize,
  ArrowLeft, Info, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface Provider {
  id: string;
  name: string;
  buildUrl: (id: number, type: 'movie' | 'tv', season: number, episode: number) => string;
}

// Tested, reliable providers — including CineSrc
const PROVIDERS: Provider[] = [
  {
    id: 'cinesrc',
    name: 'CineSrc',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://cinesrc.st/embed/tv/${id}/${s}/${e}`
        : `https://cinesrc.st/embed/movie/${id}`,
  },
  {
    id: 'vidsrc-to',
    name: 'VidSrc TO',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc XYZ',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&nextEpisode=true`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1`,
  },
  {
    id: 'vidsrc-net',
    name: 'VidSrc NET',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://vidsrc.net/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.net/embed/movie?tmdb=${id}`,
  },
  {
    id: 'embed-su',
    name: 'Embed SU',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://embed.su/embed/tv/${id}/${s}/${e}`
        : `https://embed.su/embed/movie/${id}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true`
        : `https://vidking.net/embed/movie/${id}?autoPlay=true`,
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed',
    buildUrl: (id, type, s, e) =>
      type === 'tv'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
];

const VideoPlayer: React.FC = () => {
  const { isPlayerOpen, setIsPlayerOpen, playerMedia, setPlayerMedia } = useStore();
  const [providerIndex, setProviderIndex] = useState(0);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isTheater, setIsTheater] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEpNav, setShowEpNav] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-fallback: if load takes too long, try next provider
  useEffect(() => {
    if (!isLoading) {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      return;
    }
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => {
      // Auto-try next provider after 8 seconds if still loading
      setProviderIndex((prev) => (prev + 1) % PROVIDERS.length);
      setIframeKey((k) => k + 1);
    }, 8000);
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [isLoading, providerIndex, iframeKey]);

  // Reset on media change
  useEffect(() => {
    setProviderIndex(0);
    setIframeKey(k => k + 1);
    setIsLoading(true);
    setLoadStatus('loading');
    setShowProviderMenu(false);
    setShowEpNav(false);
  }, [playerMedia?.id, playerMedia?.season, playerMedia?.episode]);

  useEffect(() => {
    if (isPlayerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPlayerOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (showProviderMenu) {
          setShowProviderMenu(false);
        } else if (showEpNav) {
          setShowEpNav(false);
        } else {
          setIsPlayerOpen(false);
        }
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 't' || e.key === 'T') setIsTheater((t) => !t);
      if (e.key === 'ArrowRight' && playerMedia?.type === 'tv' && e.shiftKey) {
        setPlayerMedia({ ...playerMedia, episode: (playerMedia.episode || 1) + 1 });
      }
      if (e.key === 'ArrowLeft' && playerMedia?.type === 'tv' && e.shiftKey && (playerMedia.episode || 1) > 1) {
        setPlayerMedia({ ...playerMedia, episode: (playerMedia.episode || 1) - 1 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsPlayerOpen, playerMedia, showProviderMenu, showEpNav]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!showProviderMenu && !showEpNav) setShowControls(false);
    }, 3500);
  };

  const currentProvider = PROVIDERS[providerIndex];
  const currentUrl = useMemo(() => {
    if (!playerMedia) return '';
    const { id, type, season = 1, episode = 1 } = playerMedia;
    return currentProvider.buildUrl(id, type, season, episode);
  }, [playerMedia, currentProvider]);

  if (!playerMedia) return null;

  const { type, season = 1, episode = 1 } = playerMedia;

  const tryNextProvider = () => {
    const next = (providerIndex + 1) % PROVIDERS.length;
    setProviderIndex(next);
    setIsLoading(true);
    setLoadStatus('loading');
  };

  const reload = () => {
    setIframeKey(k => k + 1);
    setIsLoading(true);
    setLoadStatus('loading');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseMove={resetHideTimer}
          onClick={resetHideTimer}
        >
          {/* Cinematic Ambient Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#050505]">
            {/* Extremely subtle neutral lighting to create depth, no colors */}
            <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[100px]" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-white/[0.02] rounded-full blur-[100px]" />
          </div>

          {/* Top Bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute top-0 left-0 right-0 z-30"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                  padding: '24px 32px',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <button
                      onClick={() => setIsPlayerOpen(false)}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white shrink-0 transition-colors border border-white/5"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-white/90 font-bold text-base md:text-lg truncate tracking-wide">
                        {type === 'tv' ? `Season ${season} · Episode ${episode}` : 'Feature Film'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          loadStatus === 'loaded' ? 'bg-white' : loadStatus === 'failed' ? 'bg-neutral-500' : 'bg-white/50 animate-pulse'
                        }`} />
                        <p className="text-xs text-white/50 font-medium tracking-wide">
                          {loadStatus === 'loaded' ? 'Playing securely' : loadStatus === 'failed' ? 'Connection failed' : 'Establishing connection'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowProviderMenu(!showProviderMenu)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-5 py-2.5 flex items-center gap-3 text-white transition-colors"
                      >
                        <Radio size={14} className="text-white/60" />
                        <span className="text-[13px] font-semibold tracking-wide hidden md:inline">{currentProvider.name}</span>
                        <ChevronDown size={14} className={`text-white/40 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showProviderMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-3 w-56 bg-[#0a0a0f]/95 backdrop-blur-2xl rounded-2xl p-1.5 shadow-2xl border border-white/10 z-40"
                          >
                            <div className="max-h-64 overflow-y-auto scrollbar-hide">
                              {PROVIDERS.map((p, i) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setProviderIndex(i);
                                    setShowProviderMenu(false);
                                    setIsLoading(true);
                                    setLoadStatus('loading');
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                                    i === providerIndex
                                      ? 'bg-white/10 text-white font-semibold'
                                      : 'hover:bg-white/5 text-white/60 font-medium'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${i === providerIndex ? 'bg-white' : 'bg-transparent'}`} />
                                  <span className="flex-1 text-[13px] tracking-wide">{p.name}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={reload}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/5"
                      title="Reload"
                    >
                      <RefreshCw size={16} />
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 items-center justify-center text-white/70 hover:text-white transition-all border border-white/5 hidden md:flex"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                    >
                      {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Frame */}
          <div className="flex-1 relative flex items-center justify-center min-h-0">
            <motion.div
              className={`w-full h-full relative overflow-hidden transition-all duration-500 ${
                isTheater ? '' : 'liquid-glass-dark p-1.5 shadow-2xl shadow-red-900/30'
              }`}
              style={{
                borderRadius: isTheater ? 0 : '28px',
                margin: isTheater ? 0 : '16px',
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <div
                className={`w-full h-full overflow-hidden bg-black relative ${isTheater ? '' : 'rounded-[22px]'}`}
              >
                {/* Loading Overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl"
                    >
                      {/* Clean Apple-style single spinner */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-white/80 mb-6"
                      />
                      <p className="text-white/90 text-[15px] font-semibold tracking-wide mb-1">Connecting to source...</p>
                      <p className="text-white/40 text-sm font-medium mb-8">{currentProvider.name}</p>
                      
                      <button
                        onClick={tryNextProvider}
                        className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-full px-6 py-2.5 text-xs font-semibold tracking-wide text-white flex items-center gap-2 border border-white/5"
                      >
                        <Zap size={14} className="text-white/60" /> Try next server
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <iframe
                  key={iframeKey}
                  src={currentUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                  title="Video Player"
                  onLoad={() => {
                    setIsLoading(false);
                    setLoadStatus('loaded');
                  }}
                  onError={() => {
                    setLoadStatus('failed');
                    setIsLoading(false);
                  }}
                />
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayer;