'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FeatureHighlightProps {
  children: React.ReactNode;
  label: string;
  onClose?: () => void;
  persistKey?: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({ 
  children, 
  label,
  onClose,
  persistKey
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed this highlight
    if (persistKey && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`highlight-dismissed-${persistKey}`);
      if (dismissed) {
        setIsVisible(false);
      }
    }
  }, [persistKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Save dismissal to localStorage if persistKey is provided
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`highlight-dismissed-${persistKey}`, 'true');
    }
    
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-2 -right-2 z-10"
      >
        <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md whitespace-nowrap">
          {label}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 rounded-lg ring-2 ring-orange-500 ring-opacity-70 pointer-events-none"
        style={{ zIndex: 5 }}
      />
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-20"
        onClick={handleDismiss}
        aria-label="Dismiss highlight"
        style={{ transform: 'translate(100%, 0)' }}
      >
        ×
      </motion.button>
    </div>
  );
};
