'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholders = [
  "Search apprenticeships...",
  "Find your dream career...",
  "Discover opportunities...",
  "Start your journey...",
  "Shape your future..."
];

export const TypingPlaceholder = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
        className="flex items-center"
      >
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="whitespace-nowrap"
        >
          {placeholders[currentIndex]}
        </motion.span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ 
            repeat: Infinity,
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="inline-block w-0.5 h-5 bg-current ml-0.5 -mb-0.5"
        />
      </motion.div>
    </AnimatePresence>
  );
};