import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Film, Bookmark, Calendar, Clock, Tv, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getMovieDetails, getTVDetails, getBackdropUrl, getPosterUrl, getTitle, getReleaseYear } from '../lib/tmdb';
import { Movie, MovieDetails } from '../types';
import { GlassButton } from './ui/GlassButton';

const LOGO_BASE = 'https://image.tmdb.org/t/p/w500';

const MediaModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    selectedMedia,
    setSelectedMedia,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setPlayerMedia,
    setIsPlayerOpen,
  } = useStore();

  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const getMediaType = (): 'tv' | 'movie' => {
    if (!selectedMedia) return 'movie';
    if (selectedMedia.media_type === 'tv') return 'tv';
    if (selectedMedia.media_type === 'movie') return 'movie';
    
    if (
      'first_air_date' in selectedMedia || 
      'name' in selectedMedia || 
      'number_of_seasons' in selectedMedia ||
      'content_ratings' in selectedMedia
    ) {
      return 'tv';
    }
    return 'movie';
  };

  const mediaType = getMediaType();

  useEffect(() => {
    if (!selectedMedia || !isModalOpen) return;
    setDetails(null);
    setLogoPath(null);
    setLoading(true);
    setShowTrailer(false);

    (async () => {
      try {
        const data = mediaType === 'tv'
          ? await getTVDetails(selectedMedia.id)
          : await getMovieDetails(selectedMedia.id);
        setDetails(data);

        const d = data as any;
        const logos = d.images?.logos ?? [];
        const logo = logos.find((l: any) => l.iso_639_1 === 'en') ?? logos[0] ?? null;
        if (logo) setLogoPath(logo.file_path);
      } catch (err) {
        console.error("Failed fetching TMDB details context:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMedia?.id, isModalOpen, mediaType]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  if (!selectedMedia) return null;

  const inWatchlist = isInWatchlist(selectedMedia.id);
  const displayData = details || selectedMedia;
  const title = getTitle(displayData);
  const year = getReleaseYear(displayData) || '—';
  const isTV = mediaType === 'tv';

  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60 > 0 ? `${details.runtime % 60}m` : ''}`.trim()
    : details?.number_of_seasons
    ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}`
    : '—';

  const cast = details?.credits?.cast?.slice(0, 10) ?? [];
  const trailer = details?.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube',
  );

  const getCert = (): string => {
    if (!details) return 'NR';
    const d = details as any;
    if (mediaType === 'movie') {
      const us = d.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
      return us?.release_dates?.find((x: any) => x.certification)?.certification || 'PG-13';
    }
    return d.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || 'TV-14';
  };
  const cert = getCert();

  // Your system glass style configuration token metrics
  const navbarMatchGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(13, 17, 23, 0.1)',
    backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
    border: 'none',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  };

  // Restructured to utilize a clean 20% alpha dark glass tint mapping matching your colors exactly
  const getRatingStyle = (rating: string): React.CSSProperties => {
    const baseGlow = {
      backdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
      WebkitBackdropFilter: 'blur(4px) saturate(100%) brightness(100%)',
      border: 'none',
      boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    };
    
    if (rating === 'R' || rating === 'TV-MA') {
      return { ...baseGlow, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' };
    }
    if (rating === 'PG-13' || rating === 'TV-14') {
      return { ...baseGlow, backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' };
    }
    if (rating === 'PG' || rating === 'TV-PG') {
      return { ...baseGlow, backgroundColor: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
    }
    if (rating === 'G' || rating === 'TV-G' || rating === 'TV-Y7') {
      return { ...baseGlow, backgroundColor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' };
    }
    return navbarMatchGlassStyle;
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-6"
          style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <motion.div
            className="relative w-full max-w-[960px] max-h-[94vh] flex flex-col rounded-t-[28px] md:rounded-[28px] overflow-hidden"
            style={{
              background: '#0a0a0c',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'none',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close Overlay Controller Button */}
            <GlassButton
              variant="icon"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 !w-10 !h-10 !rounded-full text-white hover:!text-[#ef4444]"
              style={navbarMatchGlassStyle}
            >
              <X size={18} />
            </GlassButton>

            <div className="overflow-y-auto flex-1 pb-10" style={{ scrollbarWidth: 'none' }}>
              
              {/* ── Backdrop Hero Area ── */}
              <div className="relative w-full aspect-video bg-[#0d0d11]">
                {showTrailer && trailer ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : loading ? (
                  <div className="w-full h-full bg-white/[0.03] animate-pulse flex flex-col justify-end p-10 gap-4">
                    <div className="h-12 w-2/5 bg-white/[0.04] rounded-xl" />
                    <div className="flex gap-2">
                      {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="h-8 w-16 bg-white/[0.04] rounded-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={getBackdropUrl(displayData.backdrop_path ?? displayData.poster_path)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.4) 40%, transparent 100%)' }} />
                  </>
                )}

                {/* Typography and Metadata Capsule Overlay Section */}
                {!showTrailer && !loading && (
                  <div className="absolute inset-x-0 bottom-0 px-8 md:px-10 pb-6 z-10 flex flex-col gap-4">
                    <div>
                      {logoPath ? (
                        <img
                          src={`${LOGO_BASE}${logoPath}`}
                          alt=""
                          className="max-h-[64px] md:max-h-[85px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                        />
                      ) : (
                        <h2 
                          className="text-[34px] md:text-[50px] font-bold tracking-tight leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]" 
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          {title}
                        </h2>
                      )}
                    </div>

                    {/* Exact 6-Pill Structural Metadata Array Row — Fixed compile parameters */}
                    <div className="flex items-center gap-2 flex-wrap" style={{ fontFamily: '"Inter", sans-serif' }}>
                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold text-white pointer-events-none" style={navbarMatchGlassStyle}>
                        <Star size={12} className="text-amber-400 fill-amber-400 shrink-0 mr-1.5" />
                        <span>{displayData.vote_average?.toFixed(1) || '7.4'}</span>
                      </GlassButton>

                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold text-white pointer-events-none" style={navbarMatchGlassStyle}>
                        <Calendar size={12} className="text-white/60 shrink-0 mr-1.5" />
                        <span>{year}</span>
                      </GlassButton>

                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold text-white pointer-events-none" style={navbarMatchGlassStyle}>
                        {isTV ? <Tv size={12} className="text-white/60 shrink-0 mr-1.5" /> : <Clock size={12} className="text-white/60 shrink-0 mr-1.5" />}
                        <span>{runtime}</span>
                      </GlassButton>

                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold pointer-events-none" style={getRatingStyle(cert)}>
                        <span className="tracking-wider">{cert}</span>
                      </GlassButton>

                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold text-white pointer-events-none" style={navbarMatchGlassStyle}>
                        <span>{details?.genres?.[0]?.name || 'Action'}</span>
                      </GlassButton>

                      <GlassButton variant="text" className="!h-[32px] !px-4 !rounded-full text-[13px] font-bold text-white pointer-events-none" style={navbarMatchGlassStyle}>
                        <span>{details?.genres?.[1]?.name || 'Cinematic'}</span>
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Core Action Buttons Utilities Bar ── */}
              {!loading && (
                <div className="px-8 md:px-10 pt-6 pb-4 flex items-center gap-3 flex-wrap" style={{ fontFamily: '"Inter", sans-serif' }}>
                  <GlassButton
                    variant="text"
                    onClick={() => {
                      setPlayerMedia({ id: selectedMedia.id, type: mediaType, season: 1, episode: 1 });
                      setIsPlayerOpen(true);
                      setIsModalOpen(false);
                    }}
                    className="!h-[40px] !px-6 !text-[14px]"
                    style={navbarMatchGlassStyle}
                  >
                    <Play size={14} className="fill-white text-white shrink-0 mr-2" />
                    <span>Play</span>
                  </GlassButton>

                  {trailer && (
                    <GlassButton
                      variant="text"
                      onClick={() => setShowTrailer(t => !t)}
                      className="!h-[40px] !px-6 !text-[14px]"
                      style={navbarMatchGlassStyle}
                    >
                      <Film size={14} className="shrink-0 mr-2" />
                      <span>{showTrailer ? 'Close' : 'Trailer'}</span>
                    </GlassButton>
                  )}

                  <GlassButton
                    variant="icon"
                    onClick={() => inWatchlist ? removeFromWatchlist(selectedMedia.id) : addToWatchlist(selectedMedia)}
                    className="!w-[40px] !h-[40px] !rounded-full"
                    style={{
                      ...navbarMatchGlassStyle,
                      backgroundColor: inWatchlist ? 'rgba(239, 68, 68, 0.16)' : 'rgba(13, 17, 23, 0.1)'
                    }}
                  >
                    <Bookmark size={15} className={inWatchlist ? 'fill-current text-red-400' : 'text-white'} />
                  </GlassButton>
                </div>
              )}

              {/* ── Content Description Block ── */}
              <div className="px-8 md:px-10 py-3">
                {loading ? (
                  <div className="space-y-2.5 max-w-2xl animate-pulse">
                    <div className="h-4 w-full bg-white/[0.03] rounded" />
                    <div className="h-4 w-11/12 bg-white/[0.03] rounded" />
                    <div className="h-4 w-4/5 bg-white/[0.03] rounded" />
                  </div>
                ) : (
                  <p 
                    className="text-white/65 text-[15px] md:text-[16px] leading-relaxed max-wxl font-serif tracking-normal"
                    style={{ fontFamily: '"New York Medium", Georgia, Cambria, serif' }}
                  >
                    {displayData.overview || 'No description available for this layout title summary configuration.'}
                  </p>
                )}
              </div>

              {/* ── Cast Row ── */}
              {!loading && cast.length > 0 && (
                <div className="px-8 md:px-10 pt-6 border-t border-white/[0.06] mt-6" style={{ fontFamily: '"Inter", sans-serif' }}>
                  <h3 className="text-white text-[17px] font-bold tracking-wide mb-4">Cast</h3>
                  <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {cast.map((actor: any) => (
                      <div key={actor.id} className="flex-shrink-0 w-[135px] flex flex-col gap-2">
                        <div className="w-[135px] aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.08]">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">👤</div>
                          )}
                        </div>
                        <p 
                          className="text-white/70 text-[12px] font-semibold text-center px-0.5 truncate tracking-wide"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >
                          {actor.name}
                        </p>
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