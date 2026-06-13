import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Film, Tv } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getTVDetails, getTVSeasonDetails } from '../lib/tmdb';

interface Provider {
  id: string;
  name: string;
  label: string;
  buildUrl: (id: number, type: 'movie' | 'tv', season: number, episode: number) => string;
}

const PROVIDERS: Provider[] = [
  { 
    id: 'cinesrc', 
    name: 'Server 1', 
    label: 'Fast', 
    buildUrl: (id, type, s, e) => type === 'tv' 
      ? `https://cinesrc.st/embed/tv/${id}/${s}/${e}` 
      : `https://cinesrc.st/embed/movie/${id}` 
  },
  { 
    id: '2embed', 
    name: 'Server 2', 
    label: 'HD', 
    buildUrl: (id, type, s, e) => type === 'tv' 
      ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` 
      : `https://www.2embed.cc/embed/${id}` 
  },
  { 
    id: 'vidking', 
    name: 'Server 3', 
    label: 'Alt', 
    buildUrl: (id, type, s, e) => type === 'tv' 
      ? `https://vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true` 
      : `https://vidking.net/embed/movie/${id}?autoPlay=true` 
  },
  { 
    id: 'vidsrc-xyz', 
    name: 'Server 4', 
    label: 'Backup', 
    buildUrl: (id, type, s, e) => type === 'tv' 
      ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1` 
      : `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1` 
  },
];

const VideoPlayer: React.FC = () => {
  const { isPlayerOpen, setIsPlayerOpen, playerMedia, setPlayerMedia, addToContinueWatching } = useStore();

  const [providerIndex, setProviderIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [, setIsPlaying] = useState(true);

  // ── Selector Panel States ──
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelSeason, setPanelSeason] = useState(playerMedia?.season ?? 1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState(false);

  const episodeCache = useRef<{ [seasonNum: number]: any[] }>({});
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const autoFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const season = playerMedia?.season ?? 1;
  const episode = playerMedia?.episode ?? 1;
  const type = playerMedia?.type ?? 'movie';
  const currentProvider = PROVIDERS[providerIndex];

  const currentUrl = useMemo(() => {
    if (!playerMedia) return '';
    return currentProvider.buildUrl(playerMedia.id, playerMedia.type, season, episode);
  }, [playerMedia, currentProvider, season, episode]);

  // ── FIX: Comprehensive Cache & Panel Reset on Show Switch ──
  useEffect(() => {
    setProviderIndex(0);
    setIframeKey(k => k + 1);
    setLoadStatus('loading');
    setIsPlaying(true);
    
    // Hard purge selector records so old series data doesn't bleed into new series trees
    episodeCache.current = {};
    setEpisodes([]);
    setTotalSeasons(1);
    setPanelSeason(playerMedia?.season ?? 1);
    setPanelError(false);
    setPanelLoading(false);
  }, [playerMedia?.id]); // Fires immediately when a brand new media item mounts

  // ── Intelligent 10s Auto-Fallback System ──
  useEffect(() => {
    if (loadStatus !== 'loading') {
      if (autoFallbackRef.current) clearTimeout(autoFallbackRef.current);
      return;
    }

    autoFallbackRef.current = setTimeout(() => {
      setProviderIndex(p => (p + 1) % PROVIDERS.length);
      setIframeKey(k => k + 1);
    }, 10000);

    return () => { if (autoFallbackRef.current) clearTimeout(autoFallbackRef.current); };
  }, [loadStatus, providerIndex]);

  useEffect(() => {
    document.body.style.overflow = isPlayerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPlayerOpen]);

  useEffect(() => {
    const handleMessage = () => {
      setIsPlaying(p => !p);
    };
    window.addEventListener('blur', handleMessage);
    return () => window.removeEventListener('blur', handleMessage);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setShowSourceMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isPlayerOpen) return;
      if (e.key === 'Escape') {
        if (isPanelOpen) setIsPanelOpen(false);
        else if (showSourceMenu) setShowSourceMenu(false);
        else setIsPlayerOpen(false);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlayerOpen, isPanelOpen, showSourceMenu]);

  // ── TMDB Episode Fetching Engine ──
  useEffect(() => {
    if (!isPlayerOpen || type !== 'tv' || !playerMedia?.id) return;

    const fetchSeasonData = async () => {
      if (episodeCache.current[panelSeason]) {
        setEpisodes(episodeCache.current[panelSeason]);
        setPanelLoading(false);
        setPanelError(false);
        return;
      }
      setPanelLoading(true);
      setPanelError(false);
      try {
        const seriesData = await getTVDetails(playerMedia.id);
        if (seriesData?.number_of_seasons) {
          setTotalSeasons(seriesData.number_of_seasons);
        }
        const data = await getTVSeasonDetails(playerMedia.id, panelSeason);
        const fetchedEpisodes = data?.episodes || [];
        episodeCache.current[panelSeason] = fetchedEpisodes;
        setEpisodes(fetchedEpisodes);
      } catch (err) {
        setPanelError(true);
      } finally {
        setPanelLoading(false);
      }
    };
    fetchSeasonData();
  }, [playerMedia?.id, panelSeason, isPlayerOpen, type]);

  if (!playerMedia) return null;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          className="fixed inset-0 z-[999] bg-[#020204] flex flex-col overflow-hidden select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ══════════════ 4. TOP BAR & EXIT OPTIONS ══════════════ */}
          <div
            className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-6 pt-6 pb-16 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(4,4,6,0.95) 0%, rgba(4,4,6,0.4) 60%, transparent 100%)' }}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1 pointer-events-auto">
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0 text-left">
                <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black mb-0.5 flex items-center gap-1.5">
                  {type === 'tv' ? <Tv size={10} /> : <Film size={10} />}
                  <span>{type === 'tv' ? 'Series Track' : 'Feature Film'}</span>
                </p>
                <p className="text-white/90 font-bold text-sm md:text-base tracking-tight truncate">
                  {type === 'tv' ? `Season ${season} · Episode ${episode}` : 'Feature Presentation'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 z-50 pointer-events-auto" ref={sourceMenuRef}>
              {/* ── 2. TV PILL TRIGGER ── */}
              {type === 'tv' && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPanelSeason(season); setIsPanelOpen(true); }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer shadow-lg group"
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                  <span className="text-white/90 group-hover:text-white transition-colors">{`S${season} · E${episode}`}</span>
                </button>
              )}

              {/* ── 1. SERVER SELECTION ── */}
              <div className="relative">
                <button
                  onClick={() => setShowSourceMenu(s => !s)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white/80 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-green-400" />
                  <span>{currentProvider.name}</span>
                </button>

                <AnimatePresence>
                  {showSourceMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden p-1.5 border border-white/10 shadow-2xl"
                      style={{ background: 'rgba(10,10,14,0.95)', backdropFilter: 'blur(30px)' }}
                    >
                      {PROVIDERS.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => { setProviderIndex(i); setShowSourceMenu(false); setLoadStatus('loading'); setIframeKey(k => k + 1); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-xs font-bold transition-all cursor-pointer ${i === providerIndex ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[9px] opacity-20 font-medium uppercase">{p.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ══════════════ CONTENT SURFACE IFRAME ENGINE ══════════════ */}
          <div className="flex-1 w-full h-full relative bg-black z-10">
            {/* ── 4. LOADING TRACKS SCREEN ── */}
            <AnimatePresence>
              {loadStatus === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#050508]"
                >
                  <div className="text-center mb-6">
                    <p className="text-white/90 font-bold text-base md:text-lg tracking-tight mb-1">
                      {type === 'tv' ? `Season ${season} · Episode ${episode}` : 'Loading Film Stream'}
                    </p>
                    <p className="text-white/30 text-xs tracking-wide">Securing network node via {currentProvider.name}...</p>
                  </div>
                  <div className="w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full w-1/2"
                      style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}
                      animate={{ x: ['-100%', '300%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={iframeKey}
              src={currentUrl}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title="Video Feed Content"
              onLoad={() => setLoadStatus('loaded')}
            />
          </div>

          {/* ── 2. MATCHING MEDIA-CARD LEVEL SELECTION SLIDING SHEET ── */}
          <AnimatePresence>
            {isPanelOpen && type === 'tv' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPanelOpen(false)} className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-xl cursor-pointer" />
                <motion.div
                  initial={{ scale: 0.97, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0, y: 20 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl h-[76vh] z-[101] rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden text-left"
                  style={{
                    backgroundColor: 'rgba(12, 12, 16, 0.6)',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.005) 100%)',
                    backdropFilter: 'blur(50px) saturate(220%) brightness(115%)',
                    WebkitBackdropFilter: 'blur(50px) saturate(220%) brightness(115%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 35px 80px -20px rgba(0, 0, 0, 0.95), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between mb-5 shrink-0">
                    <div>
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Navigation Index</h3>
                      <p className="text-base font-bold text-white tracking-tight">Select Season & Track</p>
                    </div>
                    <button onClick={() => setIsPanelOpen(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"><X size={14} /></button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/5 scrollbar-none shrink-0">
                    {Array.from({ length: totalSeasons }).map((_, idx) => {
                      const sNum = idx + 1;
                      const isTargetActive = panelSeason === sNum;
                      return (
                        <button
                          key={sNum} onClick={() => setPanelSeason(sNum)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isTargetActive ? 'text-white bg-red-600 shadow-lg shadow-red-600/20' : 'text-white/40 border border-white/5 bg-white/[0.02] hover:text-white'}`}
                        >
                          Season {sNum}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 custom-scrollbar pr-1">
                    {panelLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="w-full h-20 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse flex items-center p-3 gap-4">
                          <div className="w-24 h-full bg-white/5 rounded-lg" /><div className="flex-1 space-y-2"><div className="w-1/3 h-3 bg-white/5 rounded" /><div className="w-1/2 h-2 bg-white/5 rounded" /></div>
                        </div>
                      ))
                    ) : episodes.map((ep, idx) => {
                      const isCurrent = season === panelSeason && episode === ep.episode_number;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => { if (!playerMedia) return; setPlayerMedia({ ...playerMedia, season: panelSeason, episode: ep.episode_number }); setIsPanelOpen(false); setIframeKey(k => k + 1); }}
                          className="flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer select-none group"
                          style={{ backgroundColor: isCurrent ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.01)', borderColor: isCurrent ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)' }}
                        >
                          <span className={`text-xs font-bold w-4 text-center ${isCurrent ? 'text-red-400' : 'text-white/20'}`}>{ep.episode_number}</span>
                          <div className="w-24 aspect-video rounded-lg overflow-hidden border border-white/5 bg-white/5 shrink-0">
                            {ep.still_path ? <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt="" className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-neutral-900" />}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className={`text-xs md:text-sm font-bold truncate ${isCurrent ? 'text-red-400' : 'text-white/90'}`}>{ep.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-semibold text-white/30">
                              {ep.air_date && <span>{ep.air_date}</span>}
                              {ep.runtime && <span>• {ep.runtime}m</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayer;