import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';

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
        <GlassButton
          variant="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-8 left-4 z-50"
          title="Back to top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <ChevronUp size={20} />
        </GlassButton>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;