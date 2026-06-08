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
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-3xl" />
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
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <motion.button
                      onClick={() => setIsPlayerOpen(false)}
                      className="liquid-glass-dark w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white flex-shrink-0"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <ArrowLeft size={18} />
                    </motion.button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {loadStatus === 'loaded' ? (
                          <CheckCircle2 size={11} className="text-green-400" />
                        ) : loadStatus === 'failed' ? (
                          <AlertCircle size={11} className="text-red-400" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                          {loadStatus === 'loaded' ? 'Playing' : loadStatus === 'failed' ? 'Failed' : 'Loading'}
                          <span className="text-white/30 mx-2">·</span>
                          <span className="text-white/60">{currentProvider.name}</span>
                        </p>
                      </div>
                      <p className="text-white font-semibold text-sm md:text-base truncate">
                        {type === 'tv'
                          ? `Season ${season} · Episode ${episode}`
                          : 'Movie'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <motion.button
                        onClick={() => setShowProviderMenu(!showProviderMenu)}
                        className="liquid-glass-dark rounded-full px-4 py-2 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Radio size={12} className="text-red-400" />
                        <span className="text-xs font-medium hidden md:inline">{currentProvider.name}</span>
                        <ChevronDown size={12} className={`transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
                      </motion.button>

                      <AnimatePresence>
                        {showProviderMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-3 w-60 liquid-glass-dark rounded-3xl p-2 shadow-2xl z-40"
                          >
                            <p className="text-[10px] uppercase tracking-widest text-white/40 px-3 py-2 font-semibold">
                              Streaming Sources
                            </p>
                            <div className="max-h-80 overflow-y-auto scrollbar-hide">
                              {PROVIDERS.map((p, i) => (
                                <motion.button
                                  key={p.id}
                                  onClick={() => {
                                    setProviderIndex(i);
                                    setShowProviderMenu(false);
                                    setIsLoading(true);
                                    setLoadStatus('loading');
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all ${
                                    i === providerIndex
                                      ? 'bg-gradient-to-r from-red-500/30 to-rose-500/20 text-white border border-red-400/30'
                                      : 'hover:bg-white/5 text-white/70'
                                  }`}
                                  whileHover={{ x: 2 }}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${i === providerIndex ? 'bg-red-400 animate-pulse' : 'bg-white/20'}`} />
                                  <span className="flex-1 text-sm font-medium">{p.name}</span>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={reload}
                      className="liquid-glass-dark w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                      whileHover={{ scale: 1.08, rotate: 180 }}
                      whileTap={{ scale: 0.92 }}
                      title="Reload"
                    >
                      <RefreshCw size={15} />
                    </motion.button>

                    <motion.button
                      onClick={toggleFullscreen}
                      className="liquid-glass-dark w-11 h-11 rounded-full items-center justify-center text-white/80 hover:text-white hidden md:flex"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                    >
                      {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                    </motion.button>
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
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-black via-black to-red-950/30"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="relative mb-6"
                      >
                        <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-red-500" />
                        <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-white/5 border-b-rose-400" style={{ animation: 'spin 1s linear infinite reverse' }} />
                      </motion.div>
                      <p className="text-white/90 text-sm font-medium mb-1">Connecting to stream</p>
                      <p className="text-white/40 text-xs mb-4">{currentProvider.name}</p>
                      <button
                        onClick={tryNextProvider}
                        className="liquid-glass rounded-full px-4 py-2 text-xs text-white/70 hover:text-white flex items-center gap-2"
                      >
                        <Zap size={11} /> Try another source
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

          {/* Bottom Bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-0 left-0 right-0 z-30"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                  padding: '24px 32px',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Episode Nav */}
                  <div className="flex items-center gap-2 flex-1">
                    {type === 'tv' && (
                      <>
                        <motion.button
                          onClick={() => {
                            if (episode > 1) setPlayerMedia({ ...playerMedia, episode: episode - 1 });
                            else if (season > 1) setPlayerMedia({ ...playerMedia, season: season - 1, episode: 1 });
                          }}
                          className="liquid-glass-dark w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <SkipBack size={15} />
                        </motion.button>

                        <button
                          onClick={() => setShowEpNav(!showEpNav)}
                          className="liquid-glass-dark rounded-full px-4 py-2.5 flex items-center gap-2 text-white/90 hover:text-white"
                        >
                          <span className="text-xs font-semibold">
                            <span className="text-red-400">S</span>{season}
                            <span className="text-white/30 mx-1.5">·</span>
                            <span className="text-red-400">E</span>{episode}
                          </span>
                          <ChevronUp size={12} className={`transition-transform ${showEpNav ? '' : 'rotate-180'}`} />
                        </button>

                        <motion.button
                          onClick={() => setPlayerMedia({ ...playerMedia, episode: episode + 1 })}
                          className="liquid-glass-dark w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <SkipForward size={15} />
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Center: Status pill */}
                  <div className={`liquid-glass-dark rounded-full px-4 py-2 flex items-center gap-2 text-[11px] transition-all ${
                    loadStatus === 'loaded' ? 'text-green-400' : loadStatus === 'failed' ? 'text-red-400' : 'text-white/60'
                  }`}>
                    {loadStatus === 'loaded' ? (
                      <><CheckCircle2 size={11} /> <span className="hidden md:inline">Stream Active</span></>
                    ) : loadStatus === 'failed' ? (
                      <><AlertCircle size={11} /> <span className="hidden md:inline">Source Failed</span></>
                    ) : (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <RefreshCw size={11} />
                        </motion.div>
                        <span className="hidden md:inline">Buffering</span>
                      </>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <motion.button
                      onClick={() => setIsTheater(!isTheater)}
                      className={`liquid-glass-dark rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-medium transition-colors ${
                        isTheater ? 'text-red-400' : 'text-white/70'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Theater Mode (T)"
                    >
                      <Maximize size={12} />
                      <span className="hidden md:inline">{isTheater ? 'Theater' : 'Window'}</span>
                    </motion.button>

                    <motion.button
                      onClick={tryNextProvider}
                      className="liquid-glass-dark rounded-full px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-red-500/30 to-rose-500/20 border border-red-400/30 text-white text-xs font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap size={12} className="text-red-300" />
                      <span className="hidden md:inline">Next Source</span>
                    </motion.button>
                  </div>
                </div>

                {/* Episode Navigator */}
                <AnimatePresence>
                  {showEpNav && type === 'tv' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-4 md:left-8 mb-3 w-80 liquid-glass-dark rounded-3xl p-4 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Info size={13} className="text-red-400" />
                        <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                          Episodes
                        </p>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const epNum = i + 1;
                          const isActive = epNum === episode;
                          return (
                            <motion.button
                              key={epNum}
                              onClick={() => {
                                setPlayerMedia({ ...playerMedia, episode: epNum });
                                setShowEpNav(false);
                              }}
                              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                  ? 'btn-primary text-white'
                                  : 'liquid-glass text-white/60 hover:text-white'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {epNum}
                            </motion.button>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={() => {
                            if (season > 1) {
                              setPlayerMedia({ ...playerMedia, season: season - 1, episode: 1 });
                            }
                          }}
                          disabled={season <= 1}
                          className="text-xs text-white/50 hover:text-white disabled:opacity-30"
                        >
                          ← Season {season - 1}
                        </button>
                        <span className="text-xs text-white/40">Season {season}</span>
                        <button
                          onClick={() => {
                            setPlayerMedia({ ...playerMedia, season: season + 1, episode: 1 });
                          }}
                          className="text-xs text-white/50 hover:text-white"
                        >
                          Season {season + 1} →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayer;
