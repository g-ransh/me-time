import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const LINKS: { label: string; tab: 'home' | 'movies' | 'series' | 'genres' | 'watchlist' }[] = [
  { label: 'Home', tab: 'home' },
  { label: 'Movies', tab: 'movies' },
  { label: 'Series', tab: 'series' },
  { label: 'Discover', tab: 'genres' }, 
  { label: 'Watchlist', tab: 'watchlist' },
];

const Footer: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();

  return (
    <footer className="relative z-10 bg-[#020204]/40 backdrop-blur-md border-t border-white/[0.04] pb-12 pt-12 w-full shrink-0">
      <div className="max-w-[1360px] mx-auto px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
          {/* Logo - Classic Helvetica Geometry */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <span 
              className="text-[21px] font-bold tracking-[-0.04em] text-[#f5f5f7] antialiased"
              style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
            >
              metime
            </span>
          </div>

          {/* Navigation Layer - Structured Individual Pills with Seamless Active States */}
          <div className="flex items-center gap-[8px] flex-wrap justify-center">
            {LINKS.map((link) => {
              const isActive = activeTab === link.tab;
              return (
                <motion.button
                  key={link.tab}
                  onClick={() => setActiveTab(link.tab)}
                  className={`px-[14px] py-[6px] text-[13px] font-medium tracking-tight rounded-full border transition-all cursor-pointer ${
                    isActive 
                      ? 'text-[#f5f5f7] bg-white/[0.08] border-white/[0.15] font-semibold shadow-sm' 
                      : 'text-[#a1a1a6] bg-white/[0.02] border-white/[0.03] hover:text-[#f5f5f7] hover:border-white/[0.08] hover:bg-white/[0.05]'
                  }`}
                  style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Text Block */}
        <div className="pt-6 text-center max-w-4xl mx-auto border-t border-white/[0.04]">
          <p 
            className="text-[#ababcc] font-normal leading-relaxed text-[11px] tracking-normal antialiased opacity-70"
            style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
          >
            Disclaimer: metime does not host media files. All content is provided via
            third-party streaming embeds and the TMDB API. Legal inquiries regarding content must
            be directed to the respective hosts, as metime bears no responsibility for external
            media. All content © respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;