import React from 'react';

export const GLASS_TOKENS = {
  glassBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(5px) saturate(180%) brightness(100%)',
    WebkitBackdropFilter: 'blur(5px) saturate(180%) brightness(100%)',
    fontFamily: '"Inter", sans-serif',
    border: 'none',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.05), inset 0 0px 1px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,

  buttonClasses: "rounded-full flex items-center justify-center text-[14px] font-medium tracking-wide antialiased transition-all duration-200 cursor-pointer text-white/70 hover:text-white",
  
  interactions: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }
};