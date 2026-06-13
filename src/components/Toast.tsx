import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="liquid-glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto min-w-[200px] max-w-[300px] shadow-2xl"
          >
            {toast.type === 'success' && (
              <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
            )}
            {toast.type === 'error' && (
              <XCircle size={15} className="text-red-400 flex-shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info size={15} className="text-blue-400 flex-shrink-0" />
            )}
            <p className="text-white/85 text-sm flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/25 hover:text-white/70 transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;