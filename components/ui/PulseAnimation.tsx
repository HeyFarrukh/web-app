'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PulseAnimationProps {
  children: React.ReactNode;
  persistKey?: string;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({ 
  children, 
  persistKey
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has already seen this animation
    if (persistKey && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`feature-hint-${persistKey}`);
      if (dismissed) {
        setIsVisible(false);
      }
    }

    // Add event listener to detect user interaction
    const handleInteraction = () => {
      setHasInteracted(true);
      setTimeout(() => {
        setIsVisible(false);
        if (persistKey && typeof window !== 'undefined') {
          localStorage.setItem(`feature-hint-${persistKey}`, 'true');
        }
      }, 500);
    };

    document.addEventListener('click', handleInteraction);
    
    // Auto-dismiss after 15 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (persistKey && typeof window !== 'undefined') {
        localStorage.setItem(`feature-hint-${persistKey}`, 'true');
      }
    }, 15000);

    return () => {
      document.removeEventListener('click', handleInteraction);
      clearTimeout(timer);
    };
  }, [persistKey]);

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative" style={{ isolation: 'isolate' }}>
      {/* Strong glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: hasInteracted ? 0 : [0.7, 0.9, 0.7],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-lg blur-md"
        style={{ 
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249, 115, 22, 0) 70%)',
          transform: 'scale(1.4)',
          zIndex: -1
        }}
      />
      
      {/* Animated ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: hasInteracted ? 0 : [0.4, 0.8, 0.4], 
          scale: hasInteracted ? 1 : [1, 1.15, 1]
        }}
        transition={{ 
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-lg"
        style={{ 
          boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.8)',
          zIndex: -1
        }}
      />

      {/* Second pulsing ring for added effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: hasInteracted ? 0 : [0.2, 0.5, 0.2], 
          scale: hasInteracted ? 1 : [1.1, 1.25, 1.1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute inset-0 rounded-lg"
        style={{ 
          boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.6)',
          zIndex: -1
        }}
      />

      {/* "New" label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute -top-6 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md z-10"
      >
        NEW
      </motion.div>

      {/* Main content with bounce effect */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: 2,
          repeatType: "reverse",
          type: "spring", 
          stiffness: 300, 
          damping: 10 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
