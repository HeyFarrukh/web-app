import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholders = [
  "Search apprenticeships...",
  "Search for your future...",
  "Find your perfect role...",
  "Discover opportunities...",
  "Start your journey..."
];

export const AnimatedPlaceholder: React.FC<{ className?: string }> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 pointer-events-none"
        >
          {placeholders[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};