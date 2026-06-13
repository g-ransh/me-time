import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-8 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-red-500/20 backdrop-blur-md text-red-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all shadow-[0_0_25px_rgba(239,68,68,0.15)] cursor-pointer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Back to top"
        >
          <ChevronUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;