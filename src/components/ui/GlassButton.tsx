import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { GLASS_TOKENS } from '../../config/styles.config';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'text' | 'icon';
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  variant = 'text', 
  className = '', 
  style, 
  ...props 
}) => {
  // Apply condensed structural padding natively based on variant type
  const variablePadding = variant === 'text' ? 'p-[6px_14px]' : 'p-[8px] w-[34px] h-[34px]';

  return (
    <motion.button
      className={`${GLASS_TOKENS.buttonClasses} ${variablePadding} ${className}`}
      style={{ ...GLASS_TOKENS.glassBase, ...style }}
      {...GLASS_TOKENS.interactions}
      {...props}
    >
      {children}
    </motion.button>
  );
};